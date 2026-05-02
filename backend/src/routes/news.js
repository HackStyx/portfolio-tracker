const express = require('express');
const axios = require('axios');
const router = express.Router();

// News API configurations
const NEWS_SOURCES = {
  FINNHUB: process.env.FINNHUB_API_KEY,
};

// Unsplash API for beautiful stock images (free tier: 50 requests/hour)
const UNSPLASH_ACCESS_KEY = 'xQHb8Zm4T9JC-Pp9YqYpW3F3hQYrSrN_FY5q_rB-b7Q';

// Rich fallback news data
const FALLBACK_NEWS = [
  {
    id: 'fallback-1',
    title: "Federal Reserve Signals Potential Rate Cuts as Inflation Cools",
    summary: "The Federal Reserve's latest meeting minutes indicate a more dovish stance, with officials discussing potential interest rate reductions in the coming months as inflation shows signs of moderating.",
    source: "Financial Times",
    category: "Market",
    datetime: Date.now() - 3600000,
    trending: 'up',
    sentiment: 'Bullish',
    url: 'https://finnhub.io'
  },
  {
    id: 'fallback-2',
    title: "Tech Giants Report Strong Q4 Earnings Amid AI Boom",
    summary: "Major technology companies exceeded analyst expectations in their fourth-quarter earnings reports, driven by strong cloud services growth and substantial investments in artificial intelligence infrastructure.",
    source: "Reuters",
    category: "Technology",
    datetime: Date.now() - 7200000,
    trending: 'up',
    sentiment: 'Bullish',
    url: 'https://finnhub.io'
  },
  {
    id: 'fallback-3',
    title: "Oil Prices Surge on Middle East Supply Concerns",
    summary: "Crude oil prices experienced significant volatility as geopolitical tensions in key oil-producing regions intensified, raising concerns about global energy supply chains and affecting commodity markets.",
    source: "Bloomberg",
    category: "Commodities",
    datetime: Date.now() - 10800000,
    trending: 'up',
    url: 'https://finnhub.io'
  },
  {
    id: 'fallback-4',
    title: "Bitcoin Breaks $50K as Institutional Adoption Accelerates",
    summary: "Bitcoin and other major cryptocurrencies have shown strong recovery signals, with institutional adoption continuing to grow. Major financial institutions are now offering crypto services to clients.",
    source: "CoinDesk",
    category: "Crypto",
    datetime: Date.now() - 14400000,
    trending: 'up',
    sentiment: 'Bullish',
    url: 'https://finnhub.io'
  },
  {
    id: 'fallback-5',
    title: "Housing Market Shows Mixed Signals Amid Rising Rates",
    summary: "Recent housing market data reveals a complex picture, with some regions showing strength while others face challenges from high interest rates. First-time buyers are particularly affected by current conditions.",
    source: "Wall Street Journal",
    category: "Finance",
    datetime: Date.now() - 18000000,
    trending: 'down',
    url: 'https://finnhub.io'
  },
  {
    id: 'fallback-6',
    title: "ESG Investing Reaches Record $40 Trillion in Assets",
    summary: "Environmental, Social, and Governance (ESG) investing strategies are attracting record inflows as investors increasingly prioritize sustainability and responsible business practices in their portfolios.",
    source: "Financial News",
    category: "Finance",
    datetime: Date.now() - 21600000,
    trending: 'up',
    sentiment: 'Bullish',
    url: 'https://finnhub.io'
  },
  {
    id: 'fallback-7',
    title: "Apple Announces Revolutionary AI-Powered iPhone Features",
    summary: "Apple unveiled groundbreaking artificial intelligence capabilities for its next-generation iPhone lineup, promising to transform how users interact with their devices through advanced machine learning.",
    source: "CNBC",
    category: "Technology",
    datetime: Date.now() - 25200000,
    trending: 'up',
    sentiment: 'Bullish',
    url: 'https://finnhub.io'
  },
  {
    id: 'fallback-8',
    title: "Global Manufacturing PMI Shows Expansion Across Regions",
    summary: "Purchasing Managers' Index data from major economies indicates expanding manufacturing activity, suggesting resilience in the global industrial sector despite economic headwinds.",
    source: "MarketWatch",
    category: "Market",
    datetime: Date.now() - 28800000,
    trending: 'up',
    url: 'https://finnhub.io'
  },
  {
    id: 'fallback-9',
    title: "Nvidia Stock Soars on AI Chip Demand Forecast",
    summary: "Nvidia shares jumped after the company reported exceptional demand for its AI-focused graphics processing units, with data center revenue reaching record levels as AI adoption accelerates.",
    source: "CNBC",
    category: "Technology",
    datetime: Date.now() - 32400000,
    trending: 'up',
    sentiment: 'Bullish',
    url: 'https://finnhub.io'
  },
  {
    id: 'fallback-10',
    title: "European Central Bank Holds Rates Steady",
    summary: "The European Central Bank maintained interest rates at current levels, signaling a cautious approach to monetary policy as the eurozone economy shows signs of stabilization after recent challenges.",
    source: "Reuters",
    category: "Market",
    datetime: Date.now() - 36000000,
    trending: 'down',
    url: 'https://finnhub.io'
  },
  {
    id: 'fallback-11',
    title: "Tesla Unveils Next-Generation Battery Technology",
    summary: "Tesla announced breakthrough battery technology that promises to significantly extend electric vehicle range while reducing costs, potentially accelerating the transition to sustainable transportation.",
    source: "Bloomberg",
    category: "Technology",
    datetime: Date.now() - 39600000,
    trending: 'up',
    sentiment: 'Bullish',
    url: 'https://finnhub.io'
  },
  {
    id: 'fallback-12',
    title: "China's Economy Beats Growth Expectations",
    summary: "China's latest GDP figures exceeded forecasts, driven by strong consumer spending and government stimulus measures, providing a boost to global markets and commodity prices.",
    source: "Financial Times",
    category: "Market",
    datetime: Date.now() - 43200000,
    trending: 'up',
    url: 'https://finnhub.io'
  }
];

/**
 * Get fallback images from Picsum (Lorem Picsum - always works)
 */
function getPicsumImage(seed) {
  const id = Math.floor(Math.abs(hashCode(seed)) % 1000);
  return {
    url: `https://picsum.photos/seed/${id}/800/450`,
    thumb: `https://picsum.photos/seed/${id}/400/225`,
    photographer: 'Stock Photos',
    photographerUrl: 'https://picsum.photos'
  };
}

// Simple hash function for consistent image seeding
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

/**
 * Get a relevant image from Unsplash based on keywords
 */
async function getUnsplashImage(query = 'finance business') {
  try {
    const response = await axios.get('https://api.unsplash.com/photos/random', {
      params: {
        query: query,
        orientation: 'landscape',
        count: 1
      },
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
      },
      timeout: 5000
    });

    if (response.data && response.data[0]) {
      return {
        url: response.data[0].urls.regular,
        thumb: response.data[0].urls.small,
        photographer: response.data[0].user.name,
        photographerUrl: response.data[0].user.links.html
      };
    }
  } catch (error) {
    console.log('Unsplash API rate limit or error:', error.message);
  }
  return null;
}

/**
 * Get smart image query based on article title and category
 */
function getSmartImageQuery(article) {
  const title = article.title.toLowerCase();
  const category = article.category?.toLowerCase() || '';

  // Extract key topics from title for better image matching
  if (title.includes('fed') || title.includes('federal reserve') || title.includes('rate')) {
    return 'federal reserve building economy';
  }
  if (title.includes('ai') || title.includes('artificial intelligence')) {
    return 'artificial intelligence technology';
  }
  if (title.includes('tesla') || title.includes('electric vehicle') || title.includes('ev')) {
    return 'tesla electric car';
  }
  if (title.includes('bitcoin') || title.includes('crypto')) {
    return 'bitcoin cryptocurrency';
  }
  if (title.includes('oil') || title.includes('crude')) {
    return 'oil refinery energy';
  }
  if (title.includes('apple') || title.includes('iphone')) {
    return 'apple iphone technology';
  }
  if (title.includes('nvidia') || title.includes('chip') || title.includes('semiconductor')) {
    return 'computer chip technology';
  }
  if (title.includes('housing') || title.includes('real estate')) {
    return 'modern houses real estate';
  }
  if (title.includes('bank') || title.includes('ecb') || title.includes('central bank')) {
    return 'bank building finance';
  }
  if (title.includes('china') || title.includes('chinese')) {
    return 'china business skyline';
  }
  if (title.includes('europe') || title.includes('european')) {
    return 'europe business city';
  }
  if (title.includes('earnings') || title.includes('revenue') || title.includes('profit')) {
    return 'business growth chart';
  }
  if (title.includes('esg') || title.includes('sustainable') || title.includes('green')) {
    return 'sustainability green energy';
  }

  // Category-based fallback
  const categoryQueries = {
    'market': 'stock market wall street',
    'technology': 'modern technology innovation',
    'crypto': 'cryptocurrency blockchain',
    'earnings': 'business analytics growth',
    'commodities': 'gold bars commodities',
    'forex': 'currency money exchange',
    'finance': 'financial district skyline',
    'general': 'business meeting office'
  };

  return categoryQueries[category] || 'business finance newspaper';
}

/**
 * Fetch news from Finnhub
 */
async function fetchFinnhubNews() {
  if (!NEWS_SOURCES.FINNHUB) {
    console.log('⚠️ Finnhub API key not configured');
    return [];
  }

  try {
    console.log('📡 Fetching from Finnhub...');
    const response = await axios.get('https://finnhub.io/api/v1/news', {
      params: {
        category: 'general',
        token: NEWS_SOURCES.FINNHUB
      },
      timeout: 10000
    });

    if (response.data && Array.isArray(response.data)) {
      console.log(`✅ Finnhub returned ${response.data.length} articles`);
      return response.data.slice(0, 20).map(article => ({
        id: `finnhub-${article.id || Date.now()}-${Math.random()}`,
        title: article.headline,
        summary: article.summary || '',
        url: article.url,
        source: article.source || 'Finnhub',
        category: article.category || 'General',
        datetime: article.datetime * 1000,
        image: article.image || null,
        related: article.related || [],
        trending: Math.random() > 0.5 ? 'up' : 'down'
      }));
    }
  } catch (error) {
    console.error('❌ Finnhub error:', error.message);
  }
  return [];
}

/**
 * Aggregate and enrich news from multiple sources
 */
async function aggregateNews() {
  console.log('📰 Starting news aggregation...');
  
  // Try to fetch from Finnhub
  const finnhubNews = await fetchFinnhubNews();

  // Use Finnhub if available, otherwise fallback
  let allNews = finnhubNews.length > 0 ? finnhubNews : FALLBACK_NEWS;
  
  console.log(`📊 Using ${allNews.length} articles (${finnhubNews.length > 0 ? 'from Finnhub' : 'fallback data'})`);

  // Remove duplicates
  const uniqueNews = [];
  const seenTitles = new Set();
  
  for (const article of allNews) {
    const titleKey = article.title.toLowerCase().substring(0, 50);
    if (!seenTitles.has(titleKey)) {
      seenTitles.add(titleKey);
      uniqueNews.push(article);
    }
  }

  // Sort by date
  uniqueNews.sort((a, b) => b.datetime - a.datetime);

  // Enrich with images
  console.log('🖼️  Enriching with images...');
  const enrichedNews = await Promise.all(
    uniqueNews.slice(0, 24).map(async (article, index) => {
      let imageData = null;

      // Use article's own image if available
      if (article.image) {
        imageData = {
          url: article.image,
          thumb: article.image,
          photographer: article.source,
          photographerUrl: article.url
        };
      } else {
        // Try Unsplash for first 8 articles with smart queries (to avoid rate limits)
        if (index < 8) {
          const query = getSmartImageQuery(article);
          imageData = await getUnsplashImage(query);
        }
        
        // Fallback to Picsum
        if (!imageData) {
          imageData = getPicsumImage(article.id);
        }
      }

      return {
        ...article,
        imageData,
        readTime: `${Math.max(1, Math.ceil((article.summary?.length || 200) / 200))} min read`,
        views: `${(Math.random() * 5 + 0.5).toFixed(1)}k`,
        date: new Date(article.datetime).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      };
    })
  );

  console.log('✨ News aggregation complete!');
  return enrichedNews;
}

// Main route: Get aggregated news
router.get('/', async (req, res) => {
  try {
    console.log('🔔 News API called');
    const news = await aggregateNews();
    
    res.json({
      success: true,
      count: news.length,
      articles: news,
      lastUpdated: new Date().toISOString(),
      sources: ['Finnhub', 'Unsplash', 'Picsum'],
      usingFallback: !NEWS_SOURCES.FINNHUB || news.length === FALLBACK_NEWS.length
    });
  } catch (error) {
    console.error('💥 Error in news route:', error);
    
    // Even on error, return enriched fallback data
    const enrichedFallback = await Promise.all(
      FALLBACK_NEWS.map(async (article) => ({
        ...article,
        imageData: getPicsumImage(article.id),
        readTime: `${Math.max(1, Math.ceil((article.summary?.length || 200) / 200))} min read`,
        views: `${(Math.random() * 5 + 0.5).toFixed(1)}k`,
        date: new Date(article.datetime).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }))
    );

    res.json({
      success: true,
      count: enrichedFallback.length,
      articles: enrichedFallback,
      lastUpdated: new Date().toISOString(),
      sources: ['Fallback Data'],
      usingFallback: true,
      error: error.message
    });
  }
});

// Get news by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const allNews = await aggregateNews();
    
    const filtered = allNews.filter(article => 
      article.category.toLowerCase().includes(category.toLowerCase())
    );

    res.json({
      success: true,
      count: filtered.length,
      category,
      articles: filtered,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching category news:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category news',
      message: error.message
    });
  }
});

module.exports = router;
