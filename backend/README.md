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

   # JWT Secrets
   ACCESS_TOKEN_SECRET=replace_me
   REFRESH_TOKEN_SECRET=replace_me_too

   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PRICE_ID=price_...
   # Filled in after creating a webhook endpoint
   STRIPE_WEBHOOK_SECRET=whsec_...

   # Frontend URL for redirects
   CLIENT_URL=http://localhost:5173

   # SendGrid Email settings
   SENDGRID_API_KEY=SG.your_key
   MAIL_FROM=ChoreSprint <your_email@example.com>
   ```

   The Stripe keys can be obtained from your Stripe dashboard. The webhook secret
   is displayed after you create a webhook endpoint.

   Create an API key in your SendGrid dashboard and place it in
   `SENDGRID_API_KEY`. Use `MAIL_FROM` to set the default "from" address.

3. Make sure to replace the placeholder values with your actual configuration.

### Testing Stripe Webhooks Locally

Use the Stripe CLI to forward events to your local server:

```bash
stripe listen --forward-to localhost:4000/api/payments/webhook
```

After running the command, copy the displayed `whsec_...` value into
`STRIPE_WEBHOOK_SECRET` in your `.env` file. This allows Stripe to verify
the incoming webhook requests while you develop locally.

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
