require('dotenv').config();
const supabase = require('./src/config/supabase');

async function initializeDatabase() {
  try {
    console.log('Testing connection to Supabase...');
    
    // Test connection by fetching version
    const { data, error } = await supabase.from('stocks').select('*').limit(1);
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
      console.log('Please make sure:');
      console.log('1. Your Supabase URL and API key are correct in .env');
      console.log('2. You have created the "stocks" and "watchlists" tables in Supabase');
      console.log('3. You have proper permissions set up');
      process.exit(1);
    }
    
    console.log('Successfully connected to Supabase!');
    console.log('Tables should be created in the Supabase dashboard.');
    console.log('Make sure you have the following tables:');
    console.log('1. stocks - with columns: id, name, ticker, shares, buy_price, current_price, target_price, is_in_watchlist, last_updated');
    console.log('2. watchlists - with columns: id, name, ticker, target_price, current_price, last_updated, created_at, updated_at');
    
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase(); 