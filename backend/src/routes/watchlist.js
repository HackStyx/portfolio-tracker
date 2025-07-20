const express = require('express');
const router = express.Router();
const Stock = require('../models/Stock');
const stockPriceService = require('../services/stockPriceService');
const supabase = require('../config/supabase');
const { authenticateUser } = require('../middleware/auth');

// Get all watchlist stocks
router.get('/', authenticateUser, async (req, res) => {
  try {
    console.log('Fetching watchlist stocks for user:', req.user.id);
    const { data: stocks, error } = await supabase
      .from('stocks')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('is_in_watchlist', true)
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    console.log('Found watchlist stocks:', stocks.length);
    res.json(stocks);
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

// Add stock to watchlist
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { name, ticker, target_price } = req.body;
    console.log('Adding stock to watchlist for user:', req.user.id, { name, ticker, target_price });

    // Validate numeric values
    const parsedTargetPrice = parseFloat(target_price);
    if (isNaN(parsedTargetPrice) || parsedTargetPrice <= 0) {
      throw new Error('Invalid target price');
    }

    // Validate ticker format (basic validation)
    const tickerRegex = /^[A-Z]{1,5}$/;
    if (!tickerRegex.test(ticker.toUpperCase().trim())) {
      throw new Error('Invalid ticker format. Please use a valid US stock ticker (1-5 letters, e.g., AAPL, GOOG, MSFT)');
    }

    // Check if stock already exists in portfolio for this user
    const { data: existingStock, error: checkError } = await supabase
      .from('stocks')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('ticker', ticker.toUpperCase().trim())
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
      throw checkError;
    }

    if (existingStock) {
      // If stock exists in portfolio, just add it to watchlist
      const { data: updatedStock, error: updateError } = await supabase
        .from('stocks')
        .update({
          is_in_watchlist: true,
          target_price: parsedTargetPrice,
          last_updated: new Date().toISOString()
        })
        .eq('id', existingStock.id)
        .select()
        .single();

      if (updateError) throw updateError;

      console.log('Stock added to watchlist (existing):', updatedStock.id);
      res.status(200).json(updatedStock);
    } else {
      // Get current price from Finnhub
      const quote = await stockPriceService.getStockQuote(ticker);
      if (!quote || !quote.c) {
        console.error(`Failed to fetch price for ${ticker}:`, quote);
        throw new Error(`Unable to fetch current price for ${ticker}. This ticker may not be available in your current plan or may not exist. Please try a different ticker (e.g., GOOG instead of GOOG.MX).`);
      }

      // Create new stock record for watchlist only
      const { data: stock, error } = await supabase
        .from('stocks')
        .insert([{
          name: name.trim(),
          ticker: ticker.toUpperCase().trim(),
          shares: 0, // Explicitly set to 0 to indicate it's not in portfolio
          buy_price: 0, // Explicitly set to 0 to indicate it's not in portfolio
          current_price: quote.c,
          target_price: parsedTargetPrice,
          is_in_watchlist: true, // Explicitly set to true
          user_id: req.user.id, // Add user_id
          last_updated: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      console.log('Stock added to watchlist (new):', stock.id);
      res.status(201).json(stock);
    }
  } catch (error) {
    console.error('Error adding stock to watchlist:', error);
    res.status(400).json({ error: error.message || 'Failed to add stock to watchlist' });
  }
});

// Sync portfolio stocks to watchlist
router.post('/sync-portfolio', authenticateUser, async (req, res) => {
  try {
    console.log('Syncing portfolio stocks to watchlist for user:', req.user.id);
    const { data: portfolioStocks, error } = await supabase
      .from('stocks')
      .select('*')
      .eq('user_id', req.user.id)
      .gt('shares', 0);

    if (error) throw error;

    console.log('Found portfolio stocks:', portfolioStocks.length);

    for (const stock of portfolioStocks) {
      // If no target price is set, use current price + 10%
      const targetPrice = !stock.target_price ? stock.current_price * 1.1 : stock.target_price;
      
      const { error: updateError } = await supabase
        .from('stocks')
        .update({
          is_in_watchlist: true,
          target_price: targetPrice,
          updated_at: new Date().toISOString()
        })
        .eq('id', stock.id);
      
      if (updateError) throw updateError;
    }

    console.log('Portfolio stocks synced to watchlist');
    res.json({ message: 'Portfolio stocks synced to watchlist' });
  } catch (error) {
    console.error('Error syncing portfolio stocks:', error);
    res.status(500).json({ error: 'Failed to sync portfolio stocks' });
  }
});

// Delete stock from watchlist
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    console.log('Deleting stock from watchlist for user:', req.user.id, req.params.id);
    
    // First check if stock exists and belongs to user
    const { data: stock, error: fetchError } = await supabase
      .from('stocks')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();
    
    if (fetchError || !stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    if (stock.shares > 0) {
      // If stock is in portfolio, just remove from watchlist
      const { error: updateError } = await supabase
        .from('stocks')
        .update({ is_in_watchlist: false })
        .eq('id', stock.id);
      
      if (updateError) throw updateError;
    } else {
      // If stock is not in portfolio, delete it completely
      const { error: deleteError } = await supabase
        .from('stocks')
        .delete()
        .eq('id', stock.id);
      
      if (deleteError) throw deleteError;
    }

    console.log('Stock removed from watchlist');
    res.json({ message: 'Stock removed from watchlist' });
  } catch (error) {
    console.error('Error deleting stock from watchlist:', error);
    res.status(500).json({ error: 'Failed to delete stock from watchlist' });
  }
});

// Update stock target price
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { target_price } = req.body;
    console.log('Updating stock target price for user:', req.user.id, { id, target_price });

    // Validate numeric values
    const parsedTargetPrice = parseFloat(target_price);
    if (isNaN(parsedTargetPrice) || parsedTargetPrice <= 0) {
      throw new Error('Invalid target price');
    }

    // First check if stock exists
    const { data: stock, error: fetchError } = await supabase
      .from('stocks')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    const { data: updatedStock, error: updateError } = await supabase
      .from('stocks')
      .update({
        target_price: parsedTargetPrice,
        last_updated: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) throw updateError;

    console.log('Stock target price updated:', id);
    res.json(updatedStock);
  } catch (error) {
    console.error('Error updating stock target price:', error);
    res.status(400).json({ error: error.message || 'Failed to update stock target price' });
  }
});

// Get stock price history
router.get('/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: stock, error: fetchError } = await supabase
      .from('stocks')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    try {
      const historicalData = await stockPriceService.getHistoricalData(stock.ticker);
      res.json(historicalData);
    } catch (error) {
      console.error('Error fetching historical data:', error);
      
      // Fallback to mock data if API fails
      const today = new Date();
      const mockPriceHistory = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (29 - i));
        
        const basePrice = parseFloat(stock.current_price);
        const randomVariation = (Math.random() - 0.5) * 0.1;
        const price = basePrice * (1 + randomVariation);

        return {
          timestamp: date.toISOString(),
          price: price.toFixed(2)
        };
      });

      res.json(mockPriceHistory);
    }
  } catch (error) {
    console.error('Error in price history endpoint:', error);
    res.status(500).json({ error: 'Failed to fetch stock price history' });
  }
});

module.exports = router; 