const express = require('express');
const axios = require('axios');
const router = express.Router();

// News API configurations
const NEWS_SOURCES = {
  FINNHUB: process.env.FINNHUB_API_KEY,
  // Add more API keys here if you want to use premium services
  // NEWSAPI: process.env.NEWS_API_KEY,
};

// Unsplash API for beautiful stock images (free tier: 50 requests/hour)
const UNSPLASH_ACCESS_KEY = 'xQHb8Zm4T9JC-Pp9YqYpW3F3hQYrSrN_FY5q_rB-b7Q'; // Public demo key

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
    console.log('Unsplash API error:', error.message);
  }
  return null;
}

/**
 * Get fallback images from Picsum (Lorem Picsum - always works)
 */
function getPicsumImage(seed = Math.random()) {
  const id = Math.floor(Math.random() * 1000);
  return {
    url: `https://picsum.photos/seed/${seed}/800/450`,
    thumb: `https://picsum.photos/seed/${seed}/400/225`,
    photographer: 'Various Artists',
    photographerUrl: 'https://picsum.photos'
  };
}

/**
 * Get category-specific placeholder image
 */
function getCategoryImage(category) {
  const categoryImages = {
    'market': { query: 'stock market trading', color: 'blue' },
    'technology': { query: 'technology innovation', color: 'purple' },
    'crypto': { query: 'cryptocurrency blockchain', color: 'orange' },
    'earnings': { query: 'business growth', color: 'green' },
    'commodities': { query: 'gold oil commodities', color: 'yellow' },
    'forex': { query: 'currency exchange', color: 'teal' },
    'general': { query: 'business finance', color: 'indigo' }
  };

  const categoryData = categoryImages[category?.toLowerCase()] || categoryImages.general;
  
  // Use gradient as fallback
  return {
    url: null,
    gradient: `from-${categoryData.color}-500 to-${categoryData.color}-700`,
    query: categoryData.query
  };
}

/**
 * Fetch news from Finnhub
 */
async function fetchFinnhubNews() {
  if (!NEWS_SOURCES.FINNHUB) {
    console.log('Finnhub API key not configured');
    return [];
  }

  try {
    const response = await axios.get('https://finnhub.io/api/v1/news', {
      params: {
        category: 'general',
        token: NEWS_SOURCES.FINNHUB
      },
      timeout: 10000
    });

    if (response.data && Array.isArray(response.data)) {
      return response.data.slice(0, 20).map(article => ({
        id: `finnhub-${article.id || Date.now()}`,
        title: article.headline,
        summary: article.summary || '',
        url: article.url,
        source: article.source || 'Finnhub',
        category: article.category || 'General',
        datetime: article.datetime * 1000,
        image: article.image || null,
        related: article.related || []
      }));
    }
  } catch (error) {
    console.error('Finnhub news fetch error:', error.message);
  }
  return [];
}

/**
 * Fetch news from Alpha Vantage (Free tier)
 */
async function fetchAlphaVantageNews() {
  try {
    // Using demo API key for Alpha Vantage News
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'NEWS_SENTIMENT',
        apikey: 'demo',
        limit: 20
      },
      timeout: 10000
    });

    if (response.data && response.data.feed) {
      return response.data.feed.map((article, idx) => ({
        id: `alphavantage-${idx}-${Date.now()}`,
        title: article.title,
        summary: article.summary,
        url: article.url,
        source: article.source,
        category: article.topics?.[0]?.topic || 'Market',
        datetime: new Date(article.time_published).getTime(),
        image: article.banner_image || null,
        sentiment: article.overall_sentiment_label,
        sentimentScore: article.overall_sentiment_score
      }));
    }
  } catch (error) {
    console.log('Alpha Vantage API not available (using demo key)');
  }
  return [];
}

/**
 * Aggregate and enrich news from multiple sources
 */
async function aggregateNews() {
  console.log('📰 Fetching news from multiple sources...');
  
  // Fetch from all sources in parallel
  const [finnhubNews, alphaVantageNews] = await Promise.all([
    fetchFinnhubNews(),
    fetchAlphaVantageNews()
  ]);

  // Combine all news
  let allNews = [...finnhubNews, ...alphaVantageNews];
  
  console.log(`✅ Fetched ${allNews.length} articles from ${finnhubNews.length} Finnhub + ${alphaVantageNews.length} Alpha Vantage`);

  // Remove duplicates based on title similarity
  const uniqueNews = [];
  const seenTitles = new Set();
  
  for (const article of allNews) {
    const titleKey = article.title.toLowerCase().substring(0, 50);
    if (!seenTitles.has(titleKey)) {
      seenTitles.add(titleKey);
      uniqueNews.push(article);
    }
  }

  // Sort by date (newest first)
  uniqueNews.sort((a, b) => b.datetime - a.datetime);

  // Enrich with images
  console.log('🖼️  Enriching articles with images...');
  const enrichedNews = await Promise.all(
    uniqueNews.slice(0, 30).map(async (article, index) => {
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
        // For first 10 articles, try to get Unsplash images
        if (index < 10) {
          const categoryImage = getCategoryImage(article.category);
          imageData = await getUnsplashImage(categoryImage.query);
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
        trending: Math.random() > 0.5 ? 'up' : 'down',
        date: new Date(article.datetime).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      };
    })
  );

  console.log('✨ Successfully enriched news articles');
  return enrichedNews;
}

// Main route: Get aggregated news
router.get('/', async (req, res) => {
  try {
    const news = await aggregateNews();
    res.json({
      success: true,
      count: news.length,
      articles: news,
      lastUpdated: new Date().toISOString(),
      sources: ['Finnhub', 'Alpha Vantage', 'Unsplash']
    });
  } catch (error) {
    console.error('Error aggregating news:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news',
      message: error.message
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
