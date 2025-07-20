require('dotenv').config();
const supabase = require('./src/config/supabase');

async function cleanDatabase() {
  try {
    console.log('Cleaning database...');
    
    // Delete all records from stocks table
    const { error: stocksError } = await supabase
      .from('stocks')
      .delete()
      .neq('id', 0); // This will delete all records
    
    if (stocksError) {
      console.error('Error deleting stocks:', stocksError);
    } else {
      console.log('Successfully deleted all stocks');
    }
    
    // Delete all records from watchlists table
    const { error: watchlistsError } = await supabase
      .from('watchlists')
      .delete()
      .neq('id', 0); // This will delete all records
    
    if (watchlistsError) {
      console.error('Error deleting watchlists:', watchlistsError);
    } else {
      console.log('Successfully deleted all watchlists');
    }
    
    console.log('Database cleaning completed');
  } catch (error) {
    console.error('Error cleaning database:', error);
  }
}

// Run the cleaning
cleanDatabase(); 