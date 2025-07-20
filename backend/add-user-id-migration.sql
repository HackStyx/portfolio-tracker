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

-- Note: After running this migration, existing data will have NULL user_id
-- You may want to clean up existing data or assign it to a specific user 