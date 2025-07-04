# Database Setup and Management for Personal Recipe Card Organizer

This directory contains information and scripts related to the database for the Personal Recipe Card Organizer application.

## 1. Database Technology

The application uses **PostgreSQL (v16.x)** as its primary relational database.

## 2. Database Schema

The database schema is designed to store user information and their associated recipes.

### `users` table

| Column        | Type                     | Constraints                                 | Description                      |
| :------------ | :----------------------- | :------------------------------------------ | :------------------------------- |
| `id`          | `UUID`                   | `PRIMARY KEY`                               | Unique identifier for the user.  |
| `username`    | `VARCHAR(255)`           | `UNIQUE`, `NOT NULL`                        | User's unique username (e.g., email). |
| `password_hash` | `VARCHAR(255)`           | `NOT NULL`                                  | Hashed password of the user.     |
| `created_at`  | `TIMESTAMP WITH TIME ZONE` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP`     | Timestamp of account creation.   |

### `recipes` table

| Column        | Type                     | Constraints                                 | Description                      |
| :------------ | :----------------------- | :------------------------------------------ | :------------------------------- |
| `id`          | `UUID`                   | `PRIMARY KEY`                               | Unique identifier for the recipe. |
| `user_id`     | `UUID`                   | `NOT NULL`, `FOREIGN KEY` references `users(id)` | Links the recipe to its owner.   |
| `name`        | `VARCHAR(255)`           | `NOT NULL`                                  | Name of the recipe.              |
| `ingredients` | `TEXT`                   | `NOT NULL`                                  | Full list of ingredients.        |
| `instructions`| `TEXT`                   | `NOT NULL`                                  | Cooking instructions.            |
| `category`    | `VARCHAR(100)`           | `NOT NULL`                                  | Single category/tag (e.g., "Breakfast", "Dinner"). |
| `created_at`  | `TIMESTAMP WITH TIME ZONE` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP`     | Timestamp of recipe creation.    |
| `updated_at`  | `TIMESTAMP WITH TIME ZONE` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | Last update timestamp. |

### Relationships

*   There is a **one-to-many** relationship between `users` and `recipes`. One user can have multiple recipes, but each recipe belongs to only one user.
*   Foreign key constraints are enforced to maintain referential integrity.

## 3. Local Development Setup (using Docker)

For local development, it is highly recommended to run PostgreSQL using Docker to ensure environment consistency.

1.  **Install Docker:** If you don't have Docker installed, follow the instructions for your operating system from the [official Docker website](https://docs.docker.com/get-docker/).

2.  **Start PostgreSQL Container:**
    The `docker-compose.yml` file in the root of this repository is configured to start a PostgreSQL service. Navigate to the root of the repository and run:
    ```bash
    docker compose up -d db
    ```
    This command will start the PostgreSQL container in the background.

3.  **Database Connection Details (for local development):**
    *   **Host:** `localhost` (or the service name `db` if connecting from another Docker container)
    *   **Port:** `5432`
    *   **User:** `recipeuser` (as defined in `docker-compose.yml`)
    *   **Password:** `recipepassword` (as defined in `docker-compose.yml`)
    *   **Database Name:** `recipedb` (as defined in `docker-compose.yml`)

    These details are typically consumed by the backend application via environment variables (refer to `backend/.env.example`).

## 4. Running Database Migrations

The backend application uses `Knex.js` for database migrations. Migrations are essential for managing schema changes in a version-controlled manner.

1.  **Ensure PostgreSQL is running** (as per step 3 above).

2.  **Navigate to the `backend/` directory:**
    ```bash
    cd backend/
    ```

3.  **Install backend dependencies:**
    ```bash
    npm install
    ```

4.  **Run Migrations:**
    To apply all pending migrations and create the necessary tables, run:
    ```bash
    npm run migrate:latest
    ```
    This command executes the `knex migrate:latest` command defined in `package.json`, which will create the `users` and `recipes` tables.

5.  **Rollback Migrations (for development/testing):**
    To undo the last batch of migrations (useful for development):
    ```bash
    npm run migrate:rollback
    ```

6.  **Create New Migrations:**
    When schema changes are required, a new migration file can be generated:
    ```bash
    npm run migrate:make <migration_name>
    ```
    Replace `<migration_name>` with a descriptive name (e.g., `add_new_column_to_recipes`). This will create a new timestamped migration file in `backend/src/db/migrations/`.

## 5. Persistence Logic

The persistence logic (how data is saved, retrieved, updated, and deleted) is handled by the backend application's data access layer, specifically within the `backend/src/models/` and `backend/src/services/` directories, utilizing `Knex.js` or `Prisma` (if chosen) to interact with the PostgreSQL database.

*   **`backend/src/models/userModel.ts`**: Handles database operations related to the `users` table.
*   **`backend/src/models/recipeModel.ts`**: Handles database operations related to the `recipes` table.

These models abstract the raw SQL queries, providing an interface for the services to perform CRUD operations on the respective tables.

## 6. Important Notes

*   **Production Environment:** In a production environment, Amazon RDS for PostgreSQL will be used as a managed database service, offering high availability, automated backups, and scalability.
*   **Data Security:** Sensitive data like `password_hash` is stored securely using `bcrypt` hashing, and direct access to the database should be restricted to the backend application only.
*   **Indexing:** Key columns (`user_id`, `name`, `category` on `recipes`, `username` on `users`) will have appropriate indexes to ensure efficient query performance.
