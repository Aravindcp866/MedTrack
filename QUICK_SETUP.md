# 🚀 Quick Setup Guide

## Step 1: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL** (looks like: `https://your-project.supabase.co`)
   - **Service Role Key** (long string starting with `eyJ...`)

## Step 2: Create Environment File

Create a file named `.env.local` in the `clinic-management` directory with this content:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
JWT_SECRET=your-secret-key-change-this
```

## Step 3: Run Setup Script

```bash
node scripts/complete-setup.js
```

This will:
- ✅ Create the environment file
- ✅ Install dependencies
- ✅ Apply database schema
- ✅ Add sample data
- ✅ Test the connection

## Step 4: Start the Application

```bash
npm run dev
```

Open http://localhost:3000 and login with:
- Email: `admin@clinic.com`
- Password: `admin123`

## 🎯 What You'll See

The dashboard will show:
- **Real patient count** (updates when you add/delete patients)
- **Real product count** (from your inventory)
- **Real revenue data** (from your bills)
- **Real expense data** (from your expenses)
- **Live charts** (all using real database data)

## 🔧 Troubleshooting

### Still getting "Database Connection Error"?
1. Check your `.env.local` file has the correct Supabase credentials
2. Make sure you ran `node scripts/complete-setup.js`
3. Verify your Supabase project is active

### Can't find Supabase credentials?
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy the Project URL and Service Role Key

### Need help?
Check the `DATABASE_SETUP_GUIDE.md` for detailed instructions.
