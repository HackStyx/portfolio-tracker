# Supabase Setup Guide

This guide will help you set up your Supabase project for the Portfolio Tracker application.

## 1. Create a Supabase Project

1. Go to [https://supabase.com/](https://supabase.com/) and sign up or log in
2. Click "New Project" and follow the steps to create a new project
3. Choose a name for your project and set a secure database password
4. Select a region closest to you
5. Wait for your project to be created (this may take a few minutes)

## 2. Create Database Tables

1. In your Supabase dashboard, go to the "SQL Editor" section
2. Create a new query
3. Copy and paste the contents of the `supabase-schema.sql` file into the editor
4. Click "Run" to execute the SQL and create the tables

## 3. Set Up API Access

1. In your Supabase dashboard, go to the "Settings" section
2. Click on "API" in the sidebar
3. Under "Project API keys", copy the "anon" public key
4. Also copy the "URL" value from the "Project URL" section

## 4. Configure Environment Variables

Update your `.env` file with the Supabase URL and key:

```
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_anon_key
FINNHUB_API_KEY=your_finnhub_api_key
PORT=5000
```

## 5. Test the Connection

Run the initialization script to test your connection:

```bash
npm run init-db
```

If successful, you should see a message confirming the connection to Supabase.

## 6. Row Level Security (Optional but Recommended)

For production environments, you should set up Row Level Security (RLS) policies in Supabase:

1. Go to the "Authentication" section, then "Policies"
2. For each table, create appropriate RLS policies based on your requirements

## 7. Additional Configuration

- Consider setting up Supabase Auth if you want to add user authentication
- Set up automated backups for your database
- Configure CORS settings if needed

For more information, refer to the [Supabase documentation](https://supabase.com/docs). 