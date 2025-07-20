const express = require('express');
const cors = require('cors');
require('dotenv').config();

const supabase = require('./config/supabase');
const stockRoutes = require('./routes/stocks');
const watchlistRoutes = require('./routes/watchlist');
const stockPriceService = require('./services/stockPriceService');

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

const start = async () => {
  try {
    // Start periodic stock price updates for existing stocks
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