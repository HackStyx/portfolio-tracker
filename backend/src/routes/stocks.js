const express = require('express');
const router = express.Router();
const Stock = require('../models/Stock');
const stockPriceService = require('../services/stockPriceService');
const axios = require('axios');
const supabase = require('../config/supabase');
const { authenticateUser } = require('../middleware/auth');

// Test Finnhub connection
router.get('/test-finnhub/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    console.log('Testing Finnhub connection for ticker:', ticker);
    
    const response = await axios.get('https://finnhub.io/api/v1/quote', {
      params: {
        symbol: ticker,
        token: process.env.FINNHUB_API_KEY
      }
    });
    
    console.log('Finnhub response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Finnhub test error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Finnhub test failed',
      details: error.response?.data || error.message,
      apiKey: process.env.FINNHUB_API_KEY ? 'Present' : 'Missing'
    });
  }
});

// Test Finnhub search
router.get('/test-search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    console.log('Testing Finnhub search for query:', query);
    
    const response = await axios.get('https://finnhub.io/api/v1/search', {
      params: {
        q: query,
        token: process.env.FINNHUB_API_KEY
      }
    });
    
    console.log('Finnhub search test response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Finnhub search test error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Finnhub search test failed',
      details: error.response?.data || error.message,
      apiKey: process.env.FINNHUB_API_KEY ? 'Present' : 'Missing'
    });
  }
});

// Search stocks using Finnhub API
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ result: [] });
    }

    console.log('Searching stocks for query:', q);
    console.log('Using API key:', process.env.FINNHUB_API_KEY ? 'Present' : 'Missing');
    
    const url = `https://finnhub.io/api/v1/search?q=${encodeURIComponent(q)}&token=${process.env.FINNHUB_API_KEY}`;
    console.log('Making request to:', url.replace(process.env.FINNHUB_API_KEY, '***'));
    
    const response = await axios.get(url);
    
    console.log('Finnhub search response status:', response.status);
    console.log('Finnhub search response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.result) {
      console.log('Raw results count:', response.data.result.length);
      
      // First try to filter for common stock exchanges
      let filteredResults = response.data.result
        .filter(stock => 
          stock.symbol && 
          stock.description && 
          (stock.primaryExchange === 'NASDAQ' || 
           stock.primaryExchange === 'NYSE' || 
           stock.primaryExchange === 'BATS' ||
           stock.primaryExchange === 'ARCA')
        );
      
      // If no results, try less restrictive filtering
      if (filteredResults.length === 0) {
        console.log('No results with strict filtering, trying less restrictive...');
        filteredResults = response.data.result
          .filter(stock => 
            stock.symbol && 
            stock.description && 
            stock.type === 'Common Stock'
          );
      }
      
      // If still no results, return all results with symbols
      if (filteredResults.length === 0) {
        console.log('No results with type filtering, returning all with symbols...');
        filteredResults = response.data.result
          .filter(stock => stock.symbol && stock.description);
      }
      
      // Limit to 10 results
      filteredResults = filteredResults.slice(0, 10);
      
      console.log(`Found ${filteredResults.length} filtered stocks for query: ${q}`);
      console.log('Filtered results:', JSON.stringify(filteredResults, null, 2));
      
      res.json({ result: filteredResults });
    } else {
      console.log('No results found in response');
      res.json({ result: [] });
    }
  } catch (error) {
    console.error('Error searching stocks:', error.message);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    res.status(500).json({ 
      error: 'Failed to search stocks',
      details: error.response?.data || error.message
    });
  }
});

// Get all stocks (portfolio)
router.get('/', authenticateUser, async (req, res) => {
  try {
    console.log('Fetching portfolio stocks for user:', req.user.id);
    
    // Use direct Supabase query to be more explicit about filtering
    const { data: stocks, error } = await supabase
      .from('stocks')
      .select('*')
      .eq('user_id', req.user.id)
      .gt('shares', 0)
      .eq('is_in_watchlist', false) // Only get stocks that are NOT in watchlist
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    console.log(`Found ${stocks.length} portfolio stocks for user ${req.user.id}`);
    res.json(stocks);
  } catch (error) {
    console.error('Error fetching stocks:', error);
    res.status(500).json({ error: 'Failed to fetch stocks' });
  }
});

// Get historical data for a stock
router.get('/:ticker/history', async (req, res) => {
  try {
    const { ticker } = req.params;
    const { resolution = 'D', from, to } = req.query;

    const historicalData = await stockPriceService.getHistoricalData(
      ticker,
      resolution,
      from ? parseInt(from) : null,
      to ? parseInt(to) : null
    );

    if (!historicalData) {
      return res.status(404).json({ error: 'No historical data available' });
    }

    res.json(historicalData);
  } catch (err) {
    console.error('Error fetching historical data:', err);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// Get real-time quote for a stock
router.get('/:ticker/quote', async (req, res) => {
  try {
    const { ticker } = req.params;
    const quote = await stockPriceService.getQuote(ticker);

    if (!quote) {
      return res.status(404).json({ error: 'Quote not available' });
    }

    res.json(quote);
  } catch (err) {
    console.error('Error fetching quote:', err);
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

// Add new stock
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { name, ticker, shares, buy_price, target_price } = req.body;
    console.log('Received request to add stock for user:', req.user.id, req.body);

    // Validate required fields
    if (!name || !ticker || !shares || !buy_price) {
      console.error('Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate numeric values
    const parsedShares = parseFloat(shares);
    const parsedBuyPrice = parseFloat(buy_price);
    const parsedTargetPrice = parseFloat(target_price || buy_price); // Use buy_price as default target_price

    if (isNaN(parsedShares) || parsedShares <= 0) {
      console.error('Invalid number of shares:', shares);
      throw new Error('Invalid number of shares');
    }

    if (isNaN(parsedBuyPrice) || parsedBuyPrice <= 0) {
      console.error('Invalid buy price:', buy_price);
      throw new Error('Invalid buy price');
    }

    console.log('Fetching current price for ticker:', ticker);
    // Get current price from Finnhub
    const quote = await stockPriceService.getStockQuote(ticker);
    console.log('Received quote:', quote);
    
    if (!quote || !quote.c) {
      console.error('Failed to fetch quote for ticker:', ticker);
      throw new Error('Unable to fetch current price for ticker');
    }

    console.log('Creating stock in database for user:', req.user.id);
    console.log('User object:', {
      id: req.user.id,
      email: req.user.email,
      aud: req.user.aud
    });
    
    const stockData = {
      name: name.trim(),
      ticker: ticker.toUpperCase().trim(),
      shares: parsedShares,
      buy_price: parsedBuyPrice,
      current_price: quote.c,
      target_price: parsedTargetPrice,
      is_in_watchlist: false, // Explicitly set to false for portfolio stocks
      user_id: req.user.id, // Add user_id
      last_updated: new Date()
    };
    
    console.log('Stock data to insert:', stockData);
    
    const stock = await Stock.create(stockData);

    console.log('Stock added successfully:', stock.id);
    res.status(201).json(stock);
  } catch (error) {
    console.error('Error adding stock:', error);
    res.status(400).json({ error: error.message || 'Failed to add stock' });
  }
});

// Update stock
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, ticker, shares, buy_price } = req.body;
    console.log('Updating stock for user:', req.user.id, id, { name, ticker, shares, buy_price });

    const stock = await Stock.findByPk(id);
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    // Check if the stock belongs to the user
    if (stock.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate numeric values if provided
    let parsedShares = shares !== undefined ? parseFloat(shares) : stock.shares;
    let parsedBuyPrice = buy_price !== undefined ? parseFloat(buy_price) : stock.buy_price;

    if (shares !== undefined && (isNaN(parsedShares) || parsedShares < 0)) {
      throw new Error('Invalid number of shares');
    }

    if (buy_price !== undefined && (isNaN(parsedBuyPrice) || parsedBuyPrice < 0)) {
      throw new Error('Invalid buy price');
    }

    // Get current price from Finnhub if ticker changed
    let current_price = stock.current_price;
    if (ticker && ticker !== stock.ticker) {
      const quote = await stockPriceService.getStockQuote(ticker);
      if (!quote || !quote.c) {
        throw new Error('Unable to fetch current price for ticker');
      }
      current_price = quote.c;
    }

    await stock.update({
      name: name ? name.trim() : stock.name,
      ticker: ticker ? ticker.toUpperCase().trim() : stock.ticker,
      shares: parsedShares,
      buy_price: parsedBuyPrice,
      current_price,
      last_updated: new Date()
    });

    console.log('Stock updated:', id);
    res.json(stock);
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(400).json({ error: error.message || 'Failed to update stock' });
  }
});

// Delete stock
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting stock for user:', req.user.id, id);

    const stock = await Stock.findByPk(id);
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    // Check if the stock belongs to the user
    if (stock.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await stock.destroy();
    console.log('Stock deleted:', id);
    res.json({ message: 'Stock deleted successfully' });
  } catch (error) {
    console.error('Error deleting stock:', error);
    res.status(500).json({ error: 'Failed to delete stock' });
  }
});

// Get portfolio summary
router.get('/summary', authenticateUser, async (req, res) => {
  try {
    console.log('Getting portfolio summary for user:', req.user.id);
    
    // Use direct Supabase query to be more explicit about filtering
    const { data: stocks, error } = await supabase
      .from('stocks')
      .select('*')
      .eq('user_id', req.user.id)
      .gt('shares', 0)
      .eq('is_in_watchlist', false); // Only get stocks that are NOT in watchlist
    
    if (error) throw error;

    const summary = {
      totalValue: 0,
      totalGain: 0,
      totalGainPercent: 0,
      stockCount: stocks.length
    };

    for (const stock of stocks) {
      const stockValue = stock.shares * stock.current_price;
      const stockCost = stock.shares * stock.buy_price;
      const stockGain = stockValue - stockCost;

      summary.totalValue += stockValue;
      summary.totalGain += stockGain;
    }

    if (summary.totalValue > 0) {
      summary.totalGainPercent = (summary.totalGain / (summary.totalValue - summary.totalGain)) * 100;
    }

    console.log('Portfolio summary:', summary);
    res.json(summary);
  } catch (error) {
    console.error('Error getting portfolio summary:', error);
    res.status(500).json({ error: 'Failed to get portfolio summary' });
  }
});

// Diagnostic endpoint to check for data inconsistencies
router.get('/diagnostic/check-overlap', async (req, res) => {
  try {
    console.log('Running diagnostic check for portfolio/watchlist overlap...');
    
    // Get all stocks
    const { data: allStocks, error } = await supabase
      .from('stocks')
      .select('*');
    
    if (error) throw error;
    
    const portfolioStocks = allStocks.filter(stock => stock.shares > 0);
    const watchlistStocks = allStocks.filter(stock => stock.is_in_watchlist === true);
    const overlapStocks = allStocks.filter(stock => stock.shares > 0 && stock.is_in_watchlist === true);
    
    const diagnostic = {
      totalStocks: allStocks.length,
      portfolioStocks: portfolioStocks.length,
      watchlistStocks: watchlistStocks.length,
      overlapStocks: overlapStocks.length,
      overlapDetails: overlapStocks.map(stock => ({
        id: stock.id,
        ticker: stock.ticker,
        name: stock.name,
        shares: stock.shares,
        is_in_watchlist: stock.is_in_watchlist
      }))
    };
    
    console.log('Diagnostic results:', diagnostic);
    res.json(diagnostic);
  } catch (error) {
    console.error('Error running diagnostic:', error);
    res.status(500).json({ error: 'Failed to run diagnostic' });
  }
});

// Cleanup endpoint to fix overlapping stocks
router.post('/cleanup/fix-overlap', async (req, res) => {
  try {
    console.log('Running cleanup to fix portfolio/watchlist overlap...');
    
    // Get all stocks
    const { data: allStocks, error } = await supabase
      .from('stocks')
      .select('*');
    
    if (error) throw error;
    
    // Find stocks that have both shares > 0 and is_in_watchlist = true
    const overlapStocks = allStocks.filter(stock => stock.shares > 0 && stock.is_in_watchlist === true);
    
    console.log(`Found ${overlapStocks.length} stocks with overlap`);
    
    // Fix each overlapping stock by setting is_in_watchlist to false
    // (since they have shares > 0, they should be portfolio stocks)
    for (const stock of overlapStocks) {
      const { error: updateError } = await supabase
        .from('stocks')
        .update({ is_in_watchlist: false })
        .eq('id', stock.id);
      
      if (updateError) {
        console.error(`Error fixing stock ${stock.ticker}:`, updateError);
      } else {
        console.log(`Fixed stock ${stock.ticker} - removed from watchlist`);
      }
    }
    
    res.json({ 
      message: `Fixed ${overlapStocks.length} overlapping stocks`,
      fixedStocks: overlapStocks.map(stock => stock.ticker)
    });
  } catch (error) {
    console.error('Error running cleanup:', error);
    res.status(500).json({ error: 'Failed to run cleanup' });
  }
});

// Get stock price history
router.get('/history/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    
    // Generate sample historical data for the last 30 days
    const history = [];
    const today = new Date();
    let currentPrice = (await stockPriceService.getQuote(ticker))?.currentPrice || 100;
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Add some random variation to create realistic-looking price movements
      const randomChange = (Math.random() - 0.5) * 5; // Random change between -2.5 and 2.5
      currentPrice = Math.max(currentPrice + randomChange, 1); // Ensure price doesn't go below 1
      
      history.push({
        date: date.toISOString().split('T')[0],
        price: parseFloat(currentPrice.toFixed(2))
      });
    }
    
    res.json({ history });
  } catch (error) {
    console.error('Error fetching stock history:', error);
    res.status(500).json({ error: 'Failed to fetch stock history' });
  }
});

// Get historical data for a stock
router.get('/:ticker/historical', async (req, res) => {
  try {
    const { ticker } = req.params;
    const { period = '1D' } = req.query;

    let resolution;
    let from;
    const to = Math.floor(Date.now() / 1000);

    switch (period) {
      case '1D':
        resolution = '5';
        from = to - 24 * 60 * 60;
        break;
      case '1W':
        resolution = '15';
        from = to - 7 * 24 * 60 * 60;
        break;
      case '1M':
        resolution = '60';
        from = to - 30 * 24 * 60 * 60;
        break;
      case '3M':
        resolution = 'D';
        from = to - 90 * 24 * 60 * 60;
        break;
      case '1Y':
        resolution = 'D';
        from = to - 365 * 24 * 60 * 60;
        break;
      case 'ALL':
        resolution = 'W';
        from = to - 5 * 365 * 24 * 60 * 60;
        break;
      default:
        resolution = '5';
        from = to - 24 * 60 * 60;
    }

    // Use direct API call instead of finnhubClient
    const response = await axios.get('https://finnhub.io/api/v1/stock/candle', {
      params: {
        symbol: ticker,
        resolution: resolution,
        from: from,
        to: to,
        token: process.env.FINNHUB_API_KEY
      }
    });

    const data = response.data;
    
    if (data.s !== 'ok') {
      throw new Error('Failed to fetch historical data');
    }

    const historicalData = data.t.map((timestamp, index) => ({
      time: new Date(timestamp * 1000).toISOString(),
      price: data.c[index]
    }));

    res.json(historicalData);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// Get stock profile information
router.get('/:ticker/profile', async (req, res) => {
  try {
    const { ticker } = req.params;
    console.log('Fetching stock profile for:', ticker);

    const response = await axios.get('https://finnhub.io/api/v1/stock/profile2', {
      params: {
        symbol: ticker,
        token: process.env.FINNHUB_API_KEY
      }
    });

    console.log('Profile response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching stock profile:', error);
    res.status(500).json({ error: 'Failed to fetch stock profile' });
  }
});

// Get stock metrics (P/E, P/B, etc.)
router.get('/:ticker/metrics', async (req, res) => {
  try {
    const { ticker } = req.params;
    console.log('Fetching stock metrics for:', ticker);

    const response = await axios.get('https://finnhub.io/api/v1/stock/metric', {
      params: {
        symbol: ticker,
        metric: 'all',
        token: process.env.FINNHUB_API_KEY
      }
    });

    console.log('Metrics response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching stock metrics:', error);
    res.status(500).json({ error: 'Failed to fetch stock metrics' });
  }
});

// Get company news
router.get('/:ticker/news', async (req, res) => {
  try {
    const { ticker } = req.params;
    const { from, to } = req.query;
    
    console.log('Fetching company news for:', ticker);

    const response = await axios.get('https://finnhub.io/api/v1/company-news', {
      params: {
        symbol: ticker,
        from: from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
        to: to || new Date().toISOString().split('T')[0], // today
        token: process.env.FINNHUB_API_KEY
      }
    });

    console.log('News response count:', response.data?.length || 0);
    res.json(response.data || []);
  } catch (error) {
    console.error('Error fetching company news:', error);
    res.status(500).json({ error: 'Failed to fetch company news' });
  }
});

// Get analyst recommendations
router.get('/:ticker/recommendations', async (req, res) => {
  try {
    const { ticker } = req.params;
    console.log('Fetching analyst recommendations for:', ticker);

    const response = await axios.get('https://finnhub.io/api/v1/stock/recommendation', {
      params: {
        symbol: ticker,
        token: process.env.FINNHUB_API_KEY
      }
    });

    console.log('Recommendations response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching analyst recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch analyst recommendations' });
  }
});

// Get upcoming earnings calendar (MUST come before /:ticker/earnings)
router.get('/calendar/earnings', async (req, res) => {
  try {
    const { from, to } = req.query;
    console.log('📅 Fetching earnings calendar...');

    const fromDate = from || new Date().toISOString().split('T')[0];
    const toDate = to || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    console.log('📅 Date range:', { from: fromDate, to: toDate });

    const response = await axios.get('https://finnhub.io/api/v1/calendar/earnings', {
      params: {
        from: fromDate,
        to: toDate,
        token: process.env.FINNHUB_API_KEY
      }
    });

    console.log('📅 Earnings calendar response:', {
      status: response.status,
      dataLength: response.data?.earningsCalendar?.length || 0,
      hasData: !!response.data?.earningsCalendar
    });
    
    // Return the real data from Finnhub API
    res.json(response.data);
  } catch (error) {
    console.error('❌ Error fetching earnings calendar:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch earnings calendar' });
  }
});

// Get earnings calendar for specific ticker
router.get('/:ticker/earnings', async (req, res) => {
  try {
    const { ticker } = req.params;
    console.log('Fetching earnings calendar for:', ticker);

    const response = await axios.get('https://finnhub.io/api/v1/calendar/earnings', {
      params: {
        symbol: ticker,
        from: new Date().toISOString().split('T')[0],
        to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
        token: process.env.FINNHUB_API_KEY
      }
    });

    console.log('Earnings response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching earnings calendar:', error);
    res.status(500).json({ error: 'Failed to fetch earnings calendar' });
  }
});

// Get stock peers (competitors)
router.get('/:ticker/peers', async (req, res) => {
  try {
    const { ticker } = req.params;
    console.log('Fetching stock peers for:', ticker);

    const response = await axios.get('https://finnhub.io/api/v1/stock/peers', {
      params: {
        symbol: ticker,
        token: process.env.FINNHUB_API_KEY
      }
    });

    console.log('Peers response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching stock peers:', error);
    res.status(500).json({ error: 'Failed to fetch stock peers' });
  }
});

// Get dividend history
router.get('/:ticker/dividends', async (req, res) => {
  try {
    const { ticker } = req.params;
    const { from, to } = req.query;
    
    console.log('Fetching dividend history for:', ticker);

    const response = await axios.get('https://finnhub.io/api/v1/stock/dividend', {
      params: {
        symbol: ticker,
        from: from || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year ago
        to: to || new Date().toISOString().split('T')[0], // today
        token: process.env.FINNHUB_API_KEY
      }
    });

    console.log('Dividends response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching dividend history:', error);
    res.status(500).json({ error: 'Failed to fetch dividend history' });
  }
});

// Get market status
router.get('/market/status', async (req, res) => {
  try {
    console.log('🏛️ Fetching market status...');

    const response = await axios.get('https://finnhub.io/api/v1/stock/market-status', {
      params: {
        exchange: 'US',
        token: process.env.FINNHUB_API_KEY
      }
    });

    console.log('🏛️ Market status response:', {
      status: response.status,
      data: response.data,
      hasData: !!response.data
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('❌ Error fetching market status:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch market status' });
  }
});



// Get IPO calendar
router.get('/calendar/ipo', async (req, res) => {
  try {
    const { from, to } = req.query;
    console.log('Fetching IPO calendar');

    const response = await axios.get('https://finnhub.io/api/v1/calendar/ipo', {
      params: {
        from: from || new Date().toISOString().split('T')[0],
        to: to || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
        token: process.env.FINNHUB_API_KEY
      }
    });

    console.log('IPO calendar response count:', response.data?.length || 0);
    res.json(response.data || []);
  } catch (error) {
    console.error('Error fetching IPO calendar:', error);
    res.status(500).json({ error: 'Failed to fetch IPO calendar' });
  }
});

module.exports = router; 