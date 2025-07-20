# 🚀 Portfolio Tracker Deployment Guide

This guide will help you deploy your Portfolio Tracker application to production.

## 📋 Prerequisites

1. **Supabase Account** - [Sign up here](https://supabase.com)
2. **Finnhub API Key** - [Get free API key here](https://finnhub.io/register)
3. **GitHub Account** - Your code is already there
4. **Render Account** - [Sign up here](https://render.com) (for backend)
5. **Vercel Account** - [Sign up here](https://vercel.com) (for frontend)

## 🎯 Deployment Strategy

- **Frontend (React/Vite)** → **Vercel**
- **Backend (Express.js)** → **Render**

---

## 🔧 Step 1: Backend Deployment (Render)

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project name: `portfolio-tracker`
5. Enter a database password (save this!)
6. Choose a region close to your users
7. Click "Create new project"

### 1.2 Get Supabase Credentials

1. In your Supabase dashboard, go to **Settings > API**
2. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: `eyJ...` (starts with eyJ)
   - **service_role key**: `eyJ...` (starts with eyJ)

### 1.3 Get Finnhub API Key

1. Go to [finnhub.io/register](https://finnhub.io/register)
2. Sign up for a free account
3. Copy your API key from the dashboard

### 1.4 Deploy Backend to Render

1. Go to [render.com](https://render.com) and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `HackStyx/portfolio-tracker`
4. Configure the service:

   **Basic Settings:**
   - **Name**: `portfolio-tracker-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):

   ```
   NODE_ENV=production
   PORT=5000
   FINNHUB_API_KEY=your_finnhub_api_key_here
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=your_supabase_service_role_key_here
   ```

6. Click **"Create Web Service"**

7. **Wait for deployment** (usually 2-5 minutes)

8. **Copy your backend URL** (e.g., `https://portfolio-tracker-backend-abc123.onrender.com`)

---

## 🌐 Step 2: Frontend Deployment (Vercel)

### 2.1 Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **"New Project"**
3. Import your GitHub repository: `HackStyx/portfolio-tracker`
4. Configure the project:

   **Build Settings:**
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave empty)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Add Environment Variables** (click "Environment Variables"):

   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   VITE_API_BASE_URL=https://your-render-backend-url.onrender.com/api
   ```

6. Click **"Deploy"**

7. **Wait for deployment** (usually 1-3 minutes)

8. **Copy your frontend URL** (e.g., `https://portfolio-tracker-abc123.vercel.app`)

---

## ⚙️ Step 3: Configure Supabase Settings

### 3.1 Update Site URL

1. Go to your Supabase dashboard
2. Navigate to **Authentication > Settings**
3. Update **Site URL** to your Vercel frontend URL:
   ```
   https://your-frontend-url.vercel.app
   ```

### 3.2 Add Redirect URLs

1. In the same Authentication settings
2. Add these **Redirect URLs**:
   ```
   https://your-frontend-url.vercel.app/dashboard
   https://your-frontend-url.vercel.app/
   http://localhost:5173/dashboard
   http://localhost:5173/
   ```

### 3.3 Enable Email Confirmation (Recommended)

1. In Authentication settings
2. Enable **"Enable email confirmations"**
3. This ensures users verify their email before accessing the app

---

## 🧪 Step 4: Test Your Deployment

### 4.1 Test Backend

1. Visit your backend URL: `https://your-backend-url.onrender.com/api/health`
2. You should see a response indicating the server is running

### 4.2 Test Frontend

1. Visit your frontend URL: `https://your-frontend-url.vercel.app`
2. Try creating a new account
3. Test the login functionality
4. Navigate through the dashboard

### 4.3 Test API Integration

1. Sign in to your app
2. Try adding stocks to your watchlist
3. Check if stock data loads correctly
4. Test the news and calendar features

---

## 🔍 Troubleshooting

### Common Issues

#### Backend Issues

1. **"Module not found" errors**
   - Check that all dependencies are in `backend/package.json`
   - Verify the build command is correct

2. **"Environment variable not set" errors**
   - Double-check all environment variables in Render dashboard
   - Make sure there are no extra spaces

3. **"Port already in use" errors**
   - Render automatically sets the PORT environment variable
   - Make sure your code uses `process.env.PORT`

#### Frontend Issues

1. **"Invalid API key" errors**
   - Verify your Supabase anon key is correct
   - Check that environment variables are set in Vercel

2. **"CORS errors"**
   - Backend should already be configured for CORS
   - Check that your frontend URL is allowed

3. **"Authentication not working"**
   - Verify Supabase site URL and redirect URLs
   - Check browser console for detailed errors

#### Database Issues

1. **"Table not found" errors**
   - Run the database migrations in Supabase
   - Check the SQL editor in Supabase dashboard

2. **"RLS policy errors"**
   - Verify Row Level Security policies are set up
   - Check the authentication is working properly

---

## 📊 Monitoring

### Render Monitoring

1. Go to your Render dashboard
2. Click on your backend service
3. Monitor logs, performance, and uptime

### Vercel Monitoring

1. Go to your Vercel dashboard
2. Click on your project
3. Monitor deployments, performance, and analytics

### Supabase Monitoring

1. Go to your Supabase dashboard
2. Monitor database usage, API calls, and authentication

---

## 🔄 Updating Your Deployment

### Backend Updates

1. Push changes to your GitHub repository
2. Render will automatically redeploy
3. Monitor the deployment logs

### Frontend Updates

1. Push changes to your GitHub repository
2. Vercel will automatically redeploy
3. Monitor the deployment status

---

## 🎉 Success!

Your Portfolio Tracker is now live! 

- **Frontend**: `https://your-frontend-url.vercel.app`
- **Backend**: `https://your-backend-url.onrender.com`
- **Database**: Supabase dashboard

### Next Steps

1. **Customize your app** - Update branding, colors, and features
2. **Add more features** - Implement additional portfolio tracking features
3. **Monitor performance** - Keep an eye on usage and performance
4. **Scale up** - Upgrade plans as your user base grows

---

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the deployment logs in Render/Vercel
3. Check the browser console for frontend errors
4. Review Supabase logs for backend errors
5. Check the GitHub repository for updates

**Happy deploying! 🚀** 