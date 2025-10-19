# Database Setup Guide

## Step 1: Create Environment File

Create a `.env.local` file in the `clinic-management` directory with the following content:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Secret (for authentication)
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration (optional)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@yourclinic.com

# WhatsApp Configuration (optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

## Step 2: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following:
   - **Project URL** (for `NEXT_PUBLIC_SUPABASE_URL`)
   - **Service Role Key** (for `SUPABASE_SERVICE_ROLE_KEY`)

## Step 3: Apply Database Schema

### Option A: Using the Script (Recommended)

1. Install dependencies:
   ```bash
   npm install dotenv
   ```

2. Run the schema application script:
   ```bash
   node scripts/apply-schema.js
   ```

### Option B: Manual Application

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase-schema-working.sql`
4. Paste and run the SQL in the editor

## Step 4: Test the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000
3. Login with:
   - Email: `admin@clinic.com`
   - Password: `admin123`


## Troubleshooting

### Database Connection Error
- Make sure your `.env.local` file has the correct Supabase credentials
- Verify the schema has been applied successfully

### Authentication Issues
- Ensure the JWT_SECRET is set in your environment file
- Check that the login credentials are correct

### Build Errors
- Run `npm run build` to check for TypeScript errors
- Make sure all dependencies are installed with `npm install`
