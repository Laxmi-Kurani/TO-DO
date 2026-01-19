# Todo App with MySQL Backend

A full-stack React todo application with Node.js/Express backend connected to MySQL database.

## Features

- User authentication (Sign up/Sign in)
- Add new todos
- Mark todos as completed
- Delete todos
- Persistent storage in MySQL database

## Getting Started

### Prerequisites
- Node.js installed
- MySQL server running (e.g., XAMPP, MySQL Workbench, or standalone MySQL)

### Backend Setup
1. Navigate to the `server` directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up the MySQL database:
   - Create a database named `todo_app`
   - Run the SQL script in `schema.sql` to create tables

4. Configure environment variables:
   - Edit `.env` file with your MySQL credentials if needed

5. Start the backend server:
   ```
   npm run dev
   ```
   The server will run on http://localhost:8080

### Frontend Setup
1. Navigate back to the root directory:
   ```
   cd ..
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the frontend:
   ```
   npm run dev
   ```
   The app will run on http://localhost:5173

### Usage
- Sign up for a new account
- Sign in with your credentials
- Add, toggle, and delete todos
- Todos are persisted in MySQL database