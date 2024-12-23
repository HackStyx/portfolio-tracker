const axios = require('axios');
const { Stock } = require('../models/stock');
const { Op } = require('sequelize');

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

const getStockQuote = async (ticker) => {
  try {
    console.log('Fetching quote for ticker:', ticker);
    const response = await axios.get(`${FINNHUB_BASE_URL}/quote`, {
      params: {
        symbol: ticker,
        token: FINNHUB_API_KEY
      }
    });
    console.log('Quote response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    return null;
  }
};

const getHistoricalData = async (ticker) => {
  try {
    // Get timestamps for the last 30 days
    const end = Math.floor(Date.now() / 1000);
    const start = end - (30 * 24 * 60 * 60); // 30 days ago

    const response = await axios.get(
      `https://finnhub.io/api/v1/stock/candle?symbol=${ticker}&resolution=D&from=${start}&to=${end}&token=${FINNHUB_API_KEY}`
    );

    if (response.data.s === 'no_data') {
      throw new Error('No historical data available');
    }

    // Transform the data into the format we need
    const { t: timestamps, c: closingPrices } = response.data;
    return timestamps.map((timestamp, index) => ({
      timestamp: new Date(timestamp * 1000).toISOString(),
      price: closingPrices[index].toFixed(2)
    }));
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
};

const updateStockPrices = async () => {
  try {
    console.log('Starting stock price update...');
    const stocks = await Stock.findAll({
      where: {
        [Op.or]: [
          { shares: { [Op.gt]: 0 } },
          { is_in_watchlist: true }
        ]
      }
    });

    console.log(`Found ${stocks.length} stocks to update`);

    for (const stock of stocks) {
      try {
        const quote = await getStockQuote(stock.ticker);
        if (quote && quote.c > 0) {
          await stock.update({
            current_price: quote.c,
            last_updated: new Date()
          });
          console.log(`Updated price for ${stock.ticker}: $${quote.c}`);
        } else {
          console.log(`Failed to get valid price for ${stock.ticker}`);
        }
      } catch (error) {
        console.error(`Error updating price for ${stock.ticker}:`, error);
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('Finished updating stock prices');
  } catch (error) {
    console.error('Error in updateStockPrices:', error);
  }
};

const startPeriodicUpdates = () => {
  console.log('Starting periodic stock price updates');
  // Update immediately on start
  updateStockPrices();
  
  // Then update every 5 minutes
  setInterval(updateStockPrices, 5 * 60 * 1000);
};

module.exports = {
  getStockQuote,
  getHistoricalData,
  updateStockPrices,
  startPeriodicUpdates
}; 