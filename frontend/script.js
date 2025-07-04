document.addEventListener('DOMContentLoaded', () => {
    const authSection = document.getElementById('auth-section');
    const recipesListSection = document.getElementById('recipes-list-section');
    const recipeFormSection = document.getElementById('recipe-form-section');
    const notification = document.getElementById('notification');
    const noRecipesMessage = document.getElementById('no-recipes-message');

    // Navigation Buttons
    const navRecipesBtn = document.getElementById('nav-recipes');
    const navAddRecipeBtn = document.getElementById('nav-add-recipe');
    const navLogoutBtn = document.getElementById('nav-logout');
    const navLoginRegisterBtn = document.getElementById('nav-login-register');

    // Auth Forms
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    // Recipe Form
    const recipeForm = document.getElementById('recipe-form');
    const recipeIdInput = document.getElementById('recipe-id');
    const recipeNameInput = document.getElementById('recipe-name');
    const recipeIngredientsInput = document.getElementById('recipe-ingredients');
    const recipeInstructionsInput = document.getElementById('recipe-instructions');
    const recipeCategoryInput = document.getElementById('recipe-category');
    const recipeFormTitle = document.getElementById('recipe-form-title');
    const cancelRecipeBtn = document.getElementById('cancel-recipe-btn');

    // Recipe List & Controls
    const recipesContainer = document.getElementById('recipes-container');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');

    let currentRecipes = []; // In-memory store for recipes

    // --- Utility Functions ---
    function showSection(sectionToShow) {
        [authSection, recipesListSection, recipeFormSection].forEach(section => {
            section.classList.add('hidden');
            section.classList.remove('active');
        });
        sectionToShow.classList.remove('hidden');
        sectionToShow.classList.add('active');

        // Update active nav button
        [navRecipesBtn, navAddRecipeBtn, navLogoutBtn, navLoginRegisterBtn].forEach(btn => btn.classList.remove('active'));
        if (sectionToShow === recipesListSection) navRecipesBtn.classList.add('active');
        if (sectionToShow === recipeFormSection && recipeIdInput.value === '') navAddRecipeBtn.classList.add('active');
    }

    function showNotification(message, isError = false) {
        notification.textContent = message;
        notification.classList.remove('hidden');
        if (isError) {
            notification.style.backgroundColor = '#f44336'; // Red for errors
        } else {
            notification.style.backgroundColor = '#333'; // Default dark
        }
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.classList.add('hidden'), 500); // Hide after fade
        }, 3000);
    }

    function isAuthenticated() {
        // Simulate checking for a JWT in localStorage
        return localStorage.getItem('userToken') !== null;
    }

    function updateNavVisibility() {
        if (isAuthenticated()) {
            navRecipesBtn.classList.remove('hidden');
            navAddRecipeBtn.classList.remove('hidden');
            navLogoutBtn.classList.remove('hidden');
            navLoginRegisterBtn.classList.add('hidden');
        } else {
            navRecipesBtn.classList.add('hidden');
            navAddRecipeBtn.classList.add('hidden');
            navLogoutBtn.classList.add('hidden');
            navLoginRegisterBtn.classList.remove('hidden');
        }
    }

    // --- API Simulation Functions ---
    const simulateApiCall = (data, successMessage, errorMessage, delay = 500) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) { // 90% success rate
                    showNotification(successMessage);
                    resolve({ success: true, data: data });
                } else {
                    showNotification(errorMessage, true);
                    reject({ success: false, message: errorMessage });
                }
            }, delay);
        });
    };

    async function apiLogin(username, password) {
        console.log(`Simulating Login: ${username}`);
        try {
            const response = await simulateApiCall(
                { token: 'mock-jwt-token-for-' + username, username: username },
                'Login successful!',
                'Login failed. Invalid credentials.'
            );
            localStorage.setItem('userToken', response.data.token);
            localStorage.setItem('currentUser', response.data.username);
            updateNavVisibility();
            await fetchRecipes(); // Load recipes after login
            showSection(recipesListSection);
        } catch (error) {
            console.error('Login error:', error);
        }
    }

    async function apiRegister(username, password) {
        console.log(`Simulating Register: ${username}`);
        try {
            await simulateApiCall(
                {
                    username: username
                },
                'Registration successful! Please login.',
                'Registration failed. Username might be taken.'
            );
            showLoginLink.click(); // Go back to login form
        } catch (error) {
            console.error('Register error:', error);
        }
    }

    async function apiFetchRecipes(query = '', category = '') {
        console.log(`Simulating Fetch Recipes for: ${localStorage.getItem('currentUser') || 'guest'} with query "${query}" and category "${category}"`);
        // Filter from currentRecipes (in-memory)
        const filteredRecipes = currentRecipes.filter(recipe => {
            const matchesQuery = !query ||
                                 recipe.name.toLowerCase().includes(query.toLowerCase()) ||
                                 recipe.ingredients.toLowerCase().includes(query.toLowerCase());
            const matchesCategory = !category || recipe.category === category;
            return matchesQuery && matchesCategory;
        });

        try {
            const response = await simulateApiCall(
                filteredRecipes,
                'Recipes loaded!',
                'Failed to load recipes.'
            );
            renderRecipes(response.data);
            if (response.data.length === 0 && !query && !category) {
                noRecipesMessage.classList.remove('hidden');
            } else {
                noRecipesMessage.classList.add('hidden');
            }
        } catch (error) {
            console.error('Fetch recipes error:', error);
            renderRecipes([]); // Clear recipes on error
        }
    }

    async function apiSaveRecipe(recipe) {
        console.log('Simulating Save Recipe:', recipe);
        let message, isNew;
        if (recipe.id) {
            // Update existing
            isNew = false;
            message = 'Recipe updated successfully!';
            const index = currentRecipes.findIndex(r => r.id === recipe.id);
            if (index !== -1) {
                currentRecipes[index] = { ...recipe, updated_at: new Date().toISOString() };
            }
        } else {
            // Create new
            isNew = true;
            recipe.id = Date.now().toString(); // Simple unique ID
            recipe.created_at = new Date().toISOString();
            recipe.updated_at = new Date().toISOString();
            currentRecipes.push(recipe);
            message = 'Recipe added successfully!';
        }

        try {
            await simulateApiCall(recipe, message, `Failed to ${isNew ? 'add' : 'update'} recipe.`);
            await fetchRecipes(); // Re-fetch to update list
            showSection(recipesListSection);
        } catch (error) {
            console.error('Save recipe error:', error);
        }
    }

    async function apiDeleteRecipe(id) {
        console.log('Simulating Delete Recipe:', id);
        try {
            await simulateApiCall(
                null,
                'Recipe deleted successfully!',
                'Failed to delete recipe.'
            );
            currentRecipes = currentRecipes.filter(recipe => recipe.id !== id);
            await fetchRecipes(); // Re-fetch to update list
        } catch (error) {
            console.error('Delete recipe error:', error);
        }
    }

    // --- Rendering Functions ---
    function renderRecipes(recipes) {
        recipesContainer.innerHTML = '';
        if (recipes.length === 0) {
            noRecipesMessage.classList.remove('hidden');
            return;
        }
        noRecipesMessage.classList.add('hidden');

        recipes.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'recipe-card';
            card.innerHTML = `
                <h3 data-id="${recipe.id}">${recipe.name}</h3>
                <p class="category-tag">${recipe.category}</p>
                <div class="recipe-summary">
                    <p><strong>Ingredients:</strong> ${recipe.ingredients.split('\n').slice(0, 3).join(', ')}${recipe.ingredients.split('\n').length > 3 ? '...' : ''}</p>
                    <p><strong>Instructions:</strong> ${recipe.instructions.split('\n').slice(0, 2).join(' ')}${recipe.instructions.split('\n').length > 2 ? '...' : ''}</p>
                </div>
                <div class="actions">
                    <button class="edit-btn" data-id="${recipe.id}">Edit</button>
                    <button class="delete-btn" data-id="${recipe.id}">Delete</button>
                </div>
            `;
            recipesContainer.appendChild(card);
        });
    }

    function renderRecipeDetail(recipe) {
        // This function would typically render a dedicated detail page/modal.
        // For simplicity, we'll just expand the card or show a quick alert.
        // In this UI, we'll just show the form pre-filled.
        showSection(recipeFormSection);
        recipeFormTitle.textContent = 'Edit Recipe';
        recipeIdInput.value = recipe.id;
        recipeNameInput.value = recipe.name;
        recipeIngredientsInput.value = recipe.ingredients;
        recipeInstructionsInput.value = recipe.instructions;
        recipeCategoryInput.value = recipe.category;
    }

    // --- Event Handlers ---

    // Navigation
    navRecipesBtn.addEventListener('click', () => {
        if (isAuthenticated()) {
            showSection(recipesListSection);
            fetchRecipes();
        }
        else {
            showNotification('Please login to view your recipes.', true);
            showSection(authSection);
        }
    });

    navAddRecipeBtn.addEventListener('click', () => {
        if (isAuthenticated()) {
            recipeForm.reset();
            recipeIdInput.value = ''; // Clear ID for new recipe
            recipeFormTitle.textContent = 'Add New Recipe';
            showSection(recipeFormSection);
        }
        else {
            showNotification('Please login to add new recipes.', true);
            showSection(authSection);
        }
    });

    navLogoutBtn.addEventListener('click', () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('currentUser');
        currentRecipes = []; // Clear local recipes
        updateNavVisibility();
        showNotification('Logged out successfully!');
        showSection(authSection); // Go back to auth section
    });

    navLoginRegisterBtn.addEventListener('click', () => {
        showSection(authSection);
    });


    // Auth Form Toggling
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });

    // Auth Form Submissions
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = loginUsername.value;
        const password = loginPassword.value;
        await apiLogin(username, password);
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = registerUsername.value;
        const password = registerPassword.value;
        await apiRegister(username, password);
    });

    // Recipe Form Submission
    recipeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const recipe = {
            id: recipeIdInput.value || undefined, // Use undefined for new recipes
            name: recipeNameInput.value,
            ingredients: recipeIngredientsInput.value,
            instructions: recipeInstructionsInput.value,
            category: recipeCategoryInput.value,
        };
        await apiSaveRecipe(recipe);
    });

    cancelRecipeBtn.addEventListener('click', () => {
        showSection(recipesListSection);
        fetchRecipes(); // Refresh list in case of changes
    });

    // Recipe List Actions (Edit/Delete/View Detail)
    recipesContainer.addEventListener('click', async (e) => {
        const target = e.target;
        const recipeId = target.dataset.id;

        if (target.classList.contains('edit-btn')) {
            const recipeToEdit = currentRecipes.find(r => r.id === recipeId);
            if (recipeToEdit) {
                renderRecipeDetail(recipeToEdit);
            }
        } else if (target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this recipe?')) {
                await apiDeleteRecipe(recipeId);
            }
        } else if (target.tagName === 'H3' && recipeId) {
            // Simulate viewing full details by showing in form for now
            const recipeToView = currentRecipes.find(r => r.id === recipeId);
            if (recipeToView) {
                renderRecipeDetail(recipeToView);
                // Optionally disable form fields for view-only mode
                // recipeForm.querySelectorAll('input, textarea, select, button[type="submit"]').forEach(el => el.disabled = true);
            }
        }
    });

    // Search and Filter
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            fetchRecipes();
        }, 300); // Debounce search
    });

    categoryFilter.addEventListener('change', () => {
        fetchRecipes();
    });

    // Initial load logic
    async function fetchRecipes() {
        if (isAuthenticated()) {
            await apiFetchRecipes(searchInput.value, categoryFilter.value);
        } else {
            renderRecipes([]); // Clear recipes if not authenticated
            noRecipesMessage.classList.add('hidden'); // Hide message if no user
        }
    }

    // Initialize application state
    updateNavVisibility();
    if (isAuthenticated()) {
        showSection(recipesListSection);
        fetchRecipes();
    } else {
        showSection(authSection);
    }

    // Add some dummy recipes for initial testing if not logged in
    if (!isAuthenticated() && currentRecipes.length === 0) {
        currentRecipes = [
            {
                id: '1',
                name: 'Classic Tomato Pasta',
                ingredients: '200g spaghetti\n1 can crushed tomatoes\n2 cloves garlic, minced\nFresh basil\nOlive oil\nSalt, pepper',
                instructions: '1. Cook spaghetti according to package directions.\n2. In a pan, sauté garlic in olive oil.\n3. Add crushed tomatoes, salt, and pepper. Simmer for 15 mins.\n4. Drain pasta, add to sauce. Stir in fresh basil.',
                category: 'Dinner',
                created_at: '2025-07-01T10:00:00Z',
                updated_at: '2025-07-01T10:00:00Z'
            },
            {
                id: '2',
                name: 'Simple Scrambled Eggs',
                ingredients: '3 large eggs\n1 tbsp milk or cream\nSalt, pepper\nButter for pan',
                instructions: '1. Whisk eggs, milk, salt, and pepper.\n2. Melt butter in non-stick pan over medium-low heat.\n3. Pour in egg mixture. Cook, stirring gently, until set but still moist.',
                category: 'Breakfast',
                created_at: '2025-07-02T09:30:00Z',
                updated_at: '2025-07-02T09:30:00Z'
            }
        ];
        renderRecipes(currentRecipes);
        noRecipesMessage.classList.add('hidden');
    }
});