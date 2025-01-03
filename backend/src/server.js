const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/database');
const stockRoutes = require('./routes/stocks');
const watchlistRoutes = require('./routes/watchlist');
const stockPriceService = require('./services/stockPriceService');
const Stock = require('./models/Stock');

// Sample stocks data for initialization
const defaultStocks = [
  {
    name: 'Apple Inc.',
    ticker: 'AAPL',
    shares: 1,
    buy_price: 175.50,
    current_price: 175.50,
    target_price: 200.00,
    is_in_watchlist: true
  },
  {
    name: 'Microsoft Corporation',
    ticker: 'MSFT',
    shares: 1,
    buy_price: 350.00,
    current_price: 350.00,
    target_price: 400.00,
    is_in_watchlist: true
  },
  {
    name: 'Amazon.com Inc.',
    ticker: 'AMZN',
    shares: 1,
    buy_price: 145.00,
    current_price: 145.00,
    target_price: 170.00,
    is_in_watchlist: true
  },
  {
    name: 'NVIDIA Corporation',
    ticker: 'NVDA',
    shares: 1,
    buy_price: 480.00,
    current_price: 480.00,
    target_price: 550.00,
    is_in_watchlist: true
  },
  {
    name: 'Tesla Inc.',
    ticker: 'TSLA',
    shares: 1,
    buy_price: 240.00,
    current_price: 240.00,
    target_price: 280.00,
    is_in_watchlist: true
  }
];

const app = express();

// Configure CORS with more permissive options for development
app.use(cors({
  origin: [
    'https://portfolio-tracker-sage.vercel.app',
    'https://portfolio-tracker-hackstyx.vercel.app',
    'https://portfolio-tracker-kc46ea0ei-hackstyxs-projects.vercel.app',
    'http://localhost:5173',
    /\.vercel\.app$/ // Allow all Vercel preview deployments
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Pre-flight requests
app.options('*', cors());

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  // Add CORS headers explicitly for the health endpoint
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  res.json({ status: 'ok', message: 'Server is running' });
});

app.use('/api/stocks', stockRoutes);
app.use('/api/watchlist', watchlistRoutes);

const PORT = process.env.PORT || 5000;

const initializeStocks = async () => {
  try {
    // Check if there are any existing stocks
    const stockCount = await Stock.count();
    
    if (stockCount === 0) {
      console.log('No stocks found. Initializing with default stocks...');
      
      // Create default stocks
      await Promise.all(defaultStocks.map(stock => Stock.create(stock)));
      
      console.log('Default stocks created successfully');
    } else {
      console.log(`Found ${stockCount} existing stocks. Skipping initialization.`);
    }
  } catch (error) {
    console.error('Error initializing stocks:', error);
  }
};

const start = async () => {
  try {
    // Sync database
    await sequelize.sync();
    console.log('Database synced successfully');

    // Initialize stocks
    await initializeStocks();

    // Start periodic stock price updates
    stockPriceService.startPeriodicUpdates();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();

module.exports = app; 