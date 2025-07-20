# Supabase Authentication Setup

This guide will help you set up Supabase authentication for the Portfolio Tracker application.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A Supabase project created

## Setup Steps

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter a project name (e.g., "portfolio-tracker")
5. Enter a database password
6. Choose a region close to your users
7. Click "Create new project"

### 2. Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### 3. Configure Environment Variables

1. Create a `.env` file in the root of your project
2. Add the following variables:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_API_BASE_URL=https://portfolio-tracker-backend-y7ne.onrender.com/api
```

### 4. Configure Authentication Settings

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure the following:

#### Site URL
- Set to `http://localhost:5173` for development
- Set to your production URL for production

#### Redirect URLs
Add these redirect URLs:
- `http://localhost:5173/dashboard`
- `http://localhost:5173/`
- Your production URLs when deployed

### 5. Email Templates (Optional)

1. Go to Authentication > Email Templates
2. Customize the email templates for:
   - Confirm signup
   - Reset password
   - Magic link

### 6. Enable Email Confirmation (Recommended)

1. Go to Authentication > Settings
2. Enable "Enable email confirmations"
3. This ensures users verify their email before accessing the app

## Features Implemented

### Authentication Functions
- **Sign Up**: Users can create accounts with email, password, and name
- **Sign In**: Users can sign in with email and password
- **Sign Out**: Users can sign out and return to homepage
- **Password Reset**: Users can request password reset emails
- **Email Verification**: Users receive confirmation emails (if enabled)

### Protected Routes
- All dashboard routes (`/dashboard`, `/portfolio`, `/watchlist`, etc.) are protected
- Unauthenticated users are redirected to the homepage
- Loading states are shown during authentication checks

### User Experience
- Form validation and error handling
- Loading states during authentication
- Success/error messages
- Automatic redirect to dashboard after successful login
- Persistent sessions across browser refreshes

## Testing the Setup

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:5173`
3. Try creating a new account
4. Try signing in with the created account
5. Test the logout functionality

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Check that your `VITE_SUPABASE_ANON_KEY` is correct
   - Make sure you're using the "anon public" key, not the service role key

2. **"Invalid redirect URL" error**
   - Add your localhost URL to the redirect URLs in Supabase settings
   - Make sure the URL matches exactly (including protocol and port)

3. **Email not received**
   - Check spam folder
   - Verify email templates are configured in Supabase
   - Check Supabase logs for email delivery issues

4. **Authentication not working**
   - Verify environment variables are loaded correctly
   - Check browser console for errors
   - Ensure Supabase project is active and not paused

### Getting Help

- Check the [Supabase documentation](https://supabase.com/docs)
- Review the [Supabase Auth documentation](https://supabase.com/docs/guides/auth)
- Check the browser console for detailed error messages 