# Personal Recipe Card Organizer

## Project Overview

The Personal Recipe Card Organizer is a web application designed to help home cooks and food enthusiasts digitally store, organize, and quickly find their cherished recipes. This application aims to reduce clutter and enhance the cooking experience by providing a simple, digital, and easily accessible platform for recipe management.

## Architecture

This application follows a **Client-Server** architecture with clear separation of concerns between the frontend, backend, and database components.

*   **Frontend:** Built with **React.js** and **Vite**, responsible for the user interface and user experience, handling user interactions, and making API calls to the backend.
*   **Backend (API):** Developed using **Node.js** with **Express.js**, providing RESTful API endpoints for business logic, user authentication, and recipe management. It interacts with the database to persist data.
*   **Database:** A **PostgreSQL** relational database is used for persistent storage of user accounts and recipe data, ensuring data integrity and consistency.

## Repository Structure

```
.
├── README.md             <- This file, providing overall project documentation.
├── frontend/             <- Contains the React.js frontend application.
├── backend/              <- Contains the Node.js/Express.js backend API.
└── database/             <- Contains documentation and instructions related to the database.
```

## Setup & Running Locally

To set up and run the entire Personal Recipe Card Organizer application locally, follow these steps:

### Prerequisites

*   **Node.js (LTS v20.x or higher)** and **npm** (comes with Node.js)
*   **Docker Desktop** (for running PostgreSQL database locally via Docker Compose)
*   **Git**

### 1. Clone the Repository

First, clone the project repository to your local machine:

```bash
git clone https://github.com/50101063/personal-recipe-card-organizer.git
cd personal-recipe-card-organizer
```

### 2. Backend Setup

Navigate into the `backend` directory and set up the backend service.

```bash
cd backend
```

#### 2.1. Environment Variables

Create a `.env` file in the `backend/` directory by copying the `.env.example` file:

```bash
cp .env.example .env
```

Edit the `.env` file and configure the following variables. Ensure `DB_HOST` is set to `localhost` if running Dockerized DB directly, or `db` if running via Docker Compose (as recommended below).

```
# Example .env content for local development
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_here # **CHANGE THIS IN PRODUCTION**
DB_HOST=localhost # or 'db' if using docker-compose service name
DB_PORT=5432
DB_USER=recipeuser
DB_PASSWORD=recipepassword
DB_NAME=recipedb
```

#### 2.2. Install Dependencies

```bash
npm install
```

#### 2.3. Run Database with Docker Compose

Ensure Docker Desktop is running. From the root of the `personal-recipe-card-organizer` directory (not inside `backend/`), you can start the PostgreSQL database using Docker Compose. This will create a `db` service accessible to the backend.

```bash
cd .. # Go back to the root directory if you are in 'backend'
docker compose up -d db
```
This command starts the PostgreSQL container in detached mode. You can verify it's running with `docker ps`.

#### 2.4. Run Database Migrations

Once the database container is running, navigate back to the `backend/` directory and run the database migrations to create the necessary tables (`users` and `recipes`):

```bash
cd backend
npx knex migrate:latest
```

#### 2.5. Start the Backend Server

```bash
npm start
```

The backend server should now be running, typically on `http://localhost:3000`.

### 3. Frontend Setup

Open a new terminal window, navigate into the `frontend` directory, and set up the frontend application.

```bash
cd personal-recipe-card-organizer # if not already in root
cd frontend
```

#### 3.1. Install Dependencies

```bash
npm install
```

#### 3.2. Start the Frontend Development Server

```bash
npm run dev
```

The frontend application should now be running, typically on `http://localhost:5173` (Vite's default port).

### 4. Access the Application

Open your web browser and navigate to `http://localhost:5173` (or the port indicated by Vite). You should see the Personal Recipe Card Organizer application.

## Key Integration Points

This section outlines how the frontend, backend, and database components interact.

### 1. API Endpoints

The backend exposes a **RESTful API** that the frontend consumes. All API endpoints are prefixed with `/api/v1`.

| Method | Endpoint                    | Description                                       |
| :----- | :-------------------------- | :------------------------------------------------ |
| `POST` | `/api/v1/auth/register`     | Registers a new user account.                     |
| `POST` | `/api/v1/auth/login`        | Authenticates a user and returns a JWT.           |
| `GET`  | `/api/v1/auth/me`           | Retrieves details of the authenticated user.      |
| `GET`  | `/api/v1/recipes`           | Retrieves all recipes for the authenticated user. Supports `name`, `ingredient` search, and `category` filter via query parameters. |
| `GET`  | `/api/v1/recipes/:id`       | Retrieves a single recipe by its ID.              |
| `POST` | `/api/v1/recipes`           | Creates a new recipe for the authenticated user.  |
| `PUT`  | `/api/v1/recipes/:id`       | Updates an existing recipe by its ID.             |
| `DELETE`| `/api/v1/recipes/:id`      | Deletes a recipe by its ID.                       |

### 2. Authentication Flow (JWT-based)

1.  **User Registration/Login:** The frontend sends user credentials to the `/api/v1/auth/register` or `/api/v1/auth/login` endpoint.
2.  **JWT Generation:** Upon successful login, the backend generates a JSON Web Token (JWT) and sends it back to the frontend.
3.  **Token Storage:** The frontend stores this JWT (e.g., in `localStorage`).
4.  **Authenticated Requests:** For all subsequent requests to protected routes (e.g., recipe management), the frontend includes the JWT in the `Authorization` header as a Bearer token (`Authorization: Bearer <your_jwt_token>`).
5.  **Token Verification:** The backend's `auth` middleware intercepts these requests, verifies the JWT, and extracts the `user_id` from the token. This `user_id` is then used to ensure that users can only access and modify their own recipes.

### 3. Data Flow (Frontend <-> Backend <-> Database)

*   **Frontend to Backend:** The frontend sends JSON payloads (e.g., new recipe data, updated recipe data) via HTTP requests to the appropriate backend API endpoints.
*   **Backend Processing:** The backend receives the request, performs input validation, applies business logic (e.g., associating a recipe with the logged-in user), and then interacts with the database.
*   **Backend to Database:** The backend uses `Knex.js` (a SQL query builder) to execute database operations (INSERT, SELECT, UPDATE, DELETE) on the `users` and `recipes` tables.
*   **Database to Backend:** The database returns the results of the query to the backend.
*   **Backend to Frontend:** The backend formats the data (or an error message) into a JSON response and sends it back to the frontend.
*   **Frontend Rendering:** The frontend receives the JSON response and updates the UI accordingly (e.g., displays the list of recipes, shows a success message, or handles an error).

### 4. Data Models Synchronization

The data structures used across the application are synchronized to ensure seamless integration:

*   **Frontend:** The JavaScript objects representing users and recipes align with the expected JSON payloads from the backend.
*   **Backend Models:** The `userModel.ts` and `recipeModel.ts` define the structure and methods for interacting with the `users` and `recipes` tables, respectively.
*   **Database Schema:** The `src/db/migrations/20240715100000_create_users_and_recipes_tables.ts` migration script defines the precise table schemas, including `id`, `username`, `password_hash` for `users`, and `id`, `user_id` (foreign key), `name`, `ingredients`, `instructions`, `category` for `recipes`. Foreign key constraints ensure referential integrity between users and their recipes.

## Future Enhancements (Out-of-Scope for Initial Release)

As per the Business Requirements Document, the following features are considered for future releases:

*   Adding images to recipes.
*   Ability to print recipes.
*   Integration with external recipe databases or import features.
*   Meal planning or grocery list generation.
*   User ratings or comments on recipes.
*   Support for multiple tags per recipe.
*   Advanced search (e.g., by cooking time, dietary restrictions).
*   Mobile native applications.

## Contact

For any questions or further collaboration, please reach out to the respective development teams:

*   **Frontend Developer:** [Contact Info/Team Name]
*   **Backend Developer:** [Contact Info/Team Name]
*   **Database Developer:** [Contact Info/Team Name]
*   **Integration Agent (This role):** [Contact Info/Team Name]
