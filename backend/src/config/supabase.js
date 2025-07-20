const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('SUPABASE_URL or SUPABASE_KEY environment variables are not set. Some features will be limited.');
}

const supabase = createClient(
  SUPABASE_URL || 'https://example.supabase.co',
  SUPABASE_KEY || 'demo-key'
);

module.exports = supabase; 