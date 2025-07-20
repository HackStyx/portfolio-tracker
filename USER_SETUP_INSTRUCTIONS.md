# 🔐 User-Specific Data Setup Instructions

## 🎯 **Overview**
This guide will help you set up user-specific data isolation so that each user only sees their own portfolio and watchlist data.

## 📋 **Prerequisites**
- Supabase project with authentication enabled
- Access to Supabase SQL Editor
- Backend server running

## 🗄️ **Step 1: Database Migration**

### **1.1 Run the Migration Script**
1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy and paste the following SQL script:

```sql
-- Migration to add user_id columns for user-specific data isolation
-- Run this in your Supabase SQL Editor

-- Add user_id column to stocks table
ALTER TABLE stocks 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to watchlists table  
ALTER TABLE watchlists 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stocks_user_id ON stocks(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON watchlists(user_id);

-- Add RLS (Row Level Security) policies
-- Enable RLS on both tables
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;

-- Create policy for stocks table - users can only see their own stocks
CREATE POLICY "Users can view own stocks" ON stocks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stocks" ON stocks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stocks" ON stocks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stocks" ON stocks
  FOR DELETE USING (auth.uid() = user_id);

-- Create policy for watchlists table - users can only see their own watchlist items
CREATE POLICY "Users can view own watchlist" ON watchlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlist items" ON watchlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watchlist items" ON watchlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlist items" ON watchlists
  FOR DELETE USING (auth.uid() = user_id);
```

4. Click **Run** to execute the migration

### **1.2 Verify Migration**
Run this query to verify the changes:

```sql
-- Check if user_id columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'stocks' AND column_name = 'user_id';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'watchlists' AND column_name = 'user_id';

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('stocks', 'watchlists');
```

## 🔧 **Step 2: Backend Setup**

### **2.1 Install Dependencies**
Make sure your backend has the required dependencies:

```bash
cd backend
npm install @supabase/supabase-js
```

### **2.2 Environment Variables**
Ensure your backend `.env` file has:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### **2.3 Restart Backend**
Restart your backend server to apply the changes:

```bash
npm run dev
```

## 🎨 **Step 3: Frontend Setup**

### **3.1 Verify API Service**
The frontend has been updated to use a centralized API service with authentication. Check that `src/services/api.js` exists and includes:

- Request interceptor for adding auth tokens
- Response interceptor for handling auth errors
- Automatic token refresh

### **3.2 Test User Isolation**
1. Create two different user accounts
2. Log in with the first user and add some stocks
3. Log out and log in with the second user
4. Verify that the second user sees an empty portfolio/watchlist

## 🧪 **Step 4: Testing**

### **4.1 Test User Registration**
1. Go to your application homepage
2. Create a new account with email/password
3. Verify you can log in successfully

### **4.2 Test Data Isolation**
1. **User A**: Add stocks to portfolio and watchlist
2. **User B**: Create a different account and verify empty data
3. **User A**: Log back in and verify data is still there

### **4.3 Test API Endpoints**
Test these endpoints with authentication:

```bash
# Get portfolio stocks (requires auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/stocks

# Get watchlist (requires auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/watchlist

# Add stock to portfolio (requires auth)
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Apple Inc","ticker":"AAPL","shares":10,"buy_price":150}' \
  http://localhost:5000/api/stocks
```

## 🔍 **Step 5: Troubleshooting**

### **5.1 Common Issues**

**Issue**: "No token provided" error
**Solution**: Check that the frontend is properly sending auth headers

**Issue**: "Access denied" error
**Solution**: Verify RLS policies are correctly set up

**Issue**: Users seeing each other's data
**Solution**: Check that `user_id` is being set correctly in database operations

### **5.2 Debug Commands**

```sql
-- Check current user's stocks
SELECT * FROM stocks WHERE user_id = auth.uid();

-- Check all stocks (admin only)
SELECT * FROM stocks;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('stocks', 'watchlists');
```

## 🎉 **Step 6: Verification Checklist**

- [ ] Database migration completed successfully
- [ ] RLS policies are active
- [ ] Backend authentication middleware is working
- [ ] Frontend API service includes auth tokens
- [ ] User registration and login works
- [ ] Data isolation between users is working
- [ ] All CRUD operations work with authentication
- [ ] Error handling for unauthorized access works

## 🚀 **Benefits After Setup**

✅ **Complete Data Isolation**: Each user only sees their own data
✅ **Security**: Row Level Security prevents unauthorized access
✅ **Scalability**: System can handle multiple users efficiently
✅ **Compliance**: Meets data privacy requirements
✅ **User Experience**: Clean, personalized interface for each user

## 📞 **Support**

If you encounter any issues:
1. Check the browser console for frontend errors
2. Check the backend logs for API errors
3. Verify Supabase authentication is working
4. Test with a fresh user account

---

**🎯 Result**: Each user will now have their own isolated portfolio and watchlist data! 