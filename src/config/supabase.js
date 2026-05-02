import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// Support both old (ANON_KEY) and new (PUBLISHABLE_KEY) format
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY environment variables are not set. Authentication will not work.');
}

export const supabase = createClient(
  supabaseUrl || 'https://example.supabase.co',
  supabaseKey || 'demo-key'
); 