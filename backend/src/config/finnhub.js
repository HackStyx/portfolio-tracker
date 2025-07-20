require('dotenv').config();

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

if (!FINNHUB_API_KEY) {
  console.warn('FINNHUB_API_KEY environment variable is not set. Some features will be limited.');
  // We'll continue running but with limited functionality
}

module.exports = {
  API_KEY: FINNHUB_API_KEY || 'demo', // Use 'demo' as a fallback
  BASE_URL: 'https://finnhub.io/api/v1'
}; 
