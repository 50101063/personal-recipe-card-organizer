# Personal Recipe Card Organizer - Backend

This directory contains the backend application for the Personal Recipe Card Organizer, built with Node.js, Express, and TypeScript. It exposes RESTful APIs for user authentication and recipe management.

## Technologies Used

*   **Node.js** (LTS v20.x)
*   **Express.js** (v4.x)
*   **TypeScript** (v5.x)
*   **PostgreSQL** (for production/development database)
*   **Knex.js** (SQL Query Builder for database interactions)
*   **bcrypt** (for password hashing)
*   **jsonwebtoken** (for JWT authentication)
*   **Joi** (for request validation)
*   **Winston** (for logging)

## Setup and Installation

### Prerequisites

*   Node.js (LTS v20.x or higher)
*   npm (comes with Node.js)
*   Docker and Docker Compose (recommended for local database setup)
*   Git

### 1. Clone the Repository

If you haven't already, clone the main project repository:

```bash
git clone https://github.com/50101063/personal-recipe-card-organizer.git
cd personal-recipe-card-organizer
```

### 2. Navigate to the Backend Directory

```bash
cd backend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Environment Variables

Create a `.env` file in the `backend/` directory based on `.env.example`:

```dotenv
# .env.example content:
NODE_ENV=development
PORT=5000
JWT_SECRET=your_jwt_secret_key_here # IMPORTANT: Change this to a strong, random string
DATABASE_URL=postgresql://user:password@localhost:5432/recipe_organizer_db
```

**Note:** For `JWT_SECRET`, generate a strong, random string. For `DATABASE_URL`, adjust if your local PostgreSQL setup differs.

### 5. Database Setup (using Docker Compose for PostgreSQL)

It's recommended to run PostgreSQL using Docker Compose for local development.

Create a `docker-compose.yml` in the **root** of your `personal-recipe-card-organizer` project (if not already present from the Solution Architect's design):

```yaml
# In the root directory (personal-recipe-card-organizer/docker-compose.yml)
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    container_name: recipe_organizer_db
    environment:
      POSTGRES_DB: recipe_organizer_db
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

From the **root** directory, run:

```bash
docker compose up -d db
```

This will start a PostgreSQL container named `recipe_organizer_db` accessible at `localhost:5432`.

### 6. Run Database Migrations

Once the database is running, apply the migrations to create the necessary tables:

```bash
npm run migrate
```

### 7. Run the Application

```bash
npm run dev
```

The backend server will start on `http://localhost:5000` (or the port specified in your `.env` file).

## API Endpoints

The API is designed as RESTful and uses JWT for authentication.

### Authentication

*   `POST /api/v1/auth/register`: Register a new user.
*   `POST /api/v1/auth/login`: Authenticate user and receive a JWT.
*   `GET /api/v1/auth/me`: Get details of the authenticated user. (Requires JWT in `Authorization` header).

### Recipe Management (Requires Authentication)

*   `GET /api/v1/recipes`: Retrieve all recipes for the authenticated user.
    *   Query parameters: `?name=<keyword>`, `?ingredient=<keyword>`, `?category=<tag>`
*   `GET /api/v1/recipes/:id`: Retrieve a single recipe by ID.
*   `POST /api/v1/recipes`: Create a new recipe.
*   `PUT /api/v1/recipes/:id`: Update an existing recipe.
*   `DELETE /api/v1/recipes/:id`: Delete a recipe.

## Project Structure

```
backend/
├── src/
│   ├── config/             # Application configuration
│   ├── db/                 # Database setup, migrations, seeds
│   │   ├── migrations/
│   │   └── seeds/
│   ├── middleware/         # Express middleware (auth, error handling)
│   ├── models/             # Data access layer (interacts with DB)\n│   ├── routes/             # API route definitions
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions (logger)
│   ├── validation/         # Joi validation schemas
│   ├── app.ts              # Express application setup
│   └── server.ts           # Server entry point
├── .env.example
├── knexfile.ts             # Knex.js configuration
├── package.json
├── tsconfig.json
└── README.md
```

