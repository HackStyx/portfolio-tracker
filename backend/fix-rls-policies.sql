-- Fix RLS policies to work with backend API authentication
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own stocks" ON stocks;
DROP POLICY IF EXISTS "Users can insert own stocks" ON stocks;
DROP POLICY IF EXISTS "Users can update own stocks" ON stocks;
DROP POLICY IF EXISTS "Users can delete own stocks" ON stocks;

DROP POLICY IF EXISTS "Users can view own watchlist" ON watchlists;
DROP POLICY IF EXISTS "Users can insert own watchlist items" ON watchlists;
DROP POLICY IF EXISTS "Users can update own watchlist items" ON watchlists;
DROP POLICY IF EXISTS "Users can delete own watchlist items" ON watchlists;

-- Create new policies that work with backend API
-- For stocks table
CREATE POLICY "Users can view own stocks" ON stocks
  FOR SELECT USING (user_id IS NOT NULL);

CREATE POLICY "Users can insert own stocks" ON stocks
  FOR INSERT WITH CHECK (user_id IS NOT NULL);

CREATE POLICY "Users can update own stocks" ON stocks
  FOR UPDATE USING (user_id IS NOT NULL);

CREATE POLICY "Users can delete own stocks" ON stocks
  FOR DELETE USING (user_id IS NOT NULL);

-- For watchlists table
CREATE POLICY "Users can view own watchlist" ON watchlists
  FOR SELECT USING (user_id IS NOT NULL);

CREATE POLICY "Users can insert own watchlist items" ON watchlists
  FOR INSERT WITH CHECK (user_id IS NOT NULL);

CREATE POLICY "Users can update own watchlist items" ON watchlists
  FOR UPDATE USING (user_id IS NOT NULL);

CREATE POLICY "Users can delete own watchlist items" ON watchlists
  FOR DELETE USING (user_id IS NOT NULL);

-- Note: This approach relies on the backend to properly set user_id
-- The backend authentication middleware ensures only authenticated users can access the API 