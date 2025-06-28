# ChoresSprint Backend Setup

## Database Setup

### 🛠 Create PostgreSQL Database and .env File

#### 1. Create a PostgreSQL user and database (if not already created)

Make sure PostgreSQL is running, then open your terminal and run:

```bash
# Create a PostgreSQL superuser (if not already present)
createuser -s postgres

# Create the database for the app
createdb choresprint_db
```

3. Optional: Install a database management tool like pgAdmin or use the VS Code PostgreSQL extension to manage your database.

## Environment Variables Setup

1. Create a `.env` file in the backend directory:

   ```bash
   touch .env
   ```

2. Add the following environment variables to the `.env` file:

   ```
   # Database Configuration
   DB_URL=postgres://postgres:your_password@localhost:5432/choresprint_db
   ```

3. Make sure to replace the placeholder values with your actual configuration.

## Running the Backend

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Note on Security

- Never commit the `.env` file to version control. Add it to your `.gitignore` file.
- For production, use a secure method to manage environment variables.
