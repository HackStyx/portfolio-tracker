-- ================================================================
-- COMPLETE DATABASE SETUP FOR NEW SUPABASE PROJECT
-- ================================================================
-- Run this entire script in your Supabase SQL Editor
-- ================================================================

-- ===== STEP 1: CREATE TABLES =====

-- Create stocks table
CREATE TABLE IF NOT EXISTS stocks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  ticker TEXT NOT NULL,
  shares FLOAT NOT NULL DEFAULT 0,
  buy_price FLOAT NOT NULL DEFAULT 0,
  current_price FLOAT NOT NULL DEFAULT 0,
  target_price FLOAT NOT NULL DEFAULT 0,
  is_in_watchlist BOOLEAN NOT NULL DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create watchlists table
CREATE TABLE IF NOT EXISTS watchlists (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  ticker TEXT NOT NULL,
  target_price DECIMAL(10, 2) NOT NULL,
  current_price DECIMAL(10, 2),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  last_updated TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===== STEP 2: CREATE INDEXES =====

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_stocks_ticker ON stocks(ticker);
CREATE INDEX IF NOT EXISTS idx_stocks_user_id ON stocks(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_ticker ON watchlists(ticker);
CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON watchlists(user_id);

-- ===== STEP 3: ENABLE ROW LEVEL SECURITY =====

ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;

-- ===== STEP 4: CREATE RLS POLICIES =====

-- Drop any existing policies (in case running this again)
DROP POLICY IF EXISTS "Users can view own stocks" ON stocks;
DROP POLICY IF EXISTS "Users can insert own stocks" ON stocks;
DROP POLICY IF EXISTS "Users can update own stocks" ON stocks;
DROP POLICY IF EXISTS "Users can delete own stocks" ON stocks;

DROP POLICY IF EXISTS "Users can view own watchlist" ON watchlists;
DROP POLICY IF EXISTS "Users can insert own watchlist items" ON watchlists;
DROP POLICY IF EXISTS "Users can update own watchlist items" ON watchlists;
DROP POLICY IF EXISTS "Users can delete own watchlist items" ON watchlists;

-- Stocks table policies
CREATE POLICY "Users can view own stocks" ON stocks
  FOR SELECT USING (user_id IS NOT NULL);

CREATE POLICY "Users can insert own stocks" ON stocks
  FOR INSERT WITH CHECK (user_id IS NOT NULL);

CREATE POLICY "Users can update own stocks" ON stocks
  FOR UPDATE USING (user_id IS NOT NULL);

CREATE POLICY "Users can delete own stocks" ON stocks
  FOR DELETE USING (user_id IS NOT NULL);

-- Watchlists table policies
CREATE POLICY "Users can view own watchlist" ON watchlists
  FOR SELECT USING (user_id IS NOT NULL);

CREATE POLICY "Users can insert own watchlist items" ON watchlists
  FOR INSERT WITH CHECK (user_id IS NOT NULL);

CREATE POLICY "Users can update own watchlist items" ON watchlists
  FOR UPDATE USING (user_id IS NOT NULL);

CREATE POLICY "Users can delete own watchlist items" ON watchlists
  FOR DELETE USING (user_id IS NOT NULL);

-- ===== SETUP COMPLETE =====
-- Your database is now ready!
-- Next steps:
-- 1. Configure authentication settings in Supabase dashboard
-- 2. Update environment variables in Vercel and Render
-- 3. Test the application
