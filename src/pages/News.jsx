import React, { useState, useEffect } from 'react';
import { HiOutlineNewspaper, HiOutlineClock, HiOutlineUser, HiOutlineTrendingUp, HiOutlineTrendingDown, HiOutlineEye, HiOutlineRefresh } from 'react-icons/hi';
import axios from 'axios';

const News = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [newsArticles, setNewsArticles] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Initialize theme and listen for changes
  useEffect(() => {
    const handleThemeChange = (e) => {
      const newTheme = e.detail?.theme || e.detail || localStorage.getItem('theme') || 'light';
      console.log('News: Theme change detected:', newTheme);
      setTheme(newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');

    // Listen to theme change events
    window.addEventListener('themeChange', handleThemeChange);
    window.addEventListener('storage', () => {
      const storedTheme = localStorage.getItem('theme') || 'light';
      handleThemeChange({ detail: { theme: storedTheme } });
    });
    document.addEventListener('themeChanged', handleThemeChange);

    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
      window.removeEventListener('storage', handleThemeChange);
      document.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);

  // Fallback news data
  const fallbackNews = [
    {
      id: 1,
      title: "Federal Reserve Signals Potential Rate Cuts in 2024",
      category: "Market News",
      date: "Jan 20, 2024",
      author: "Financial Times",
      readTime: "5 min read",
      image: "from-blue-500 to-purple-600",
      summary: "The Federal Reserve's latest meeting minutes indicate a more dovish stance, with officials discussing potential interest rate reductions in the coming months.",
      trending: "up",
      views: "2.4k",
      url: "#"
    },
    {
      id: 2,
      title: "Tech Giants Report Strong Q4 Earnings",
      category: "Earnings",
      date: "Jan 19, 2024",
      author: "Reuters",
      readTime: "4 min read",
      image: "from-green-500 to-blue-600",
      summary: "Major technology companies exceeded analyst expectations in their fourth-quarter earnings reports, driven by strong cloud services and AI investments.",
      trending: "up",
      views: "1.8k",
      url: "#"
    },
    {
      id: 3,
      title: "Oil Prices Volatile Amid Geopolitical Tensions",
      category: "Commodities",
      date: "Jan 18, 2024",
      author: "Bloomberg",
      readTime: "6 min read",
      image: "from-yellow-500 to-orange-600",
      summary: "Crude oil prices experienced significant volatility as tensions in key oil-producing regions intensified, affecting global energy markets.",
      trending: "down",
      views: "1.2k",
      url: "#"
    },
    {
      id: 4,
      title: "Cryptocurrency Market Shows Signs of Recovery",
      category: "Crypto",
      date: "Jan 17, 2024",
      author: "CoinDesk",
      readTime: "7 min read",
      image: "from-purple-500 to-pink-600",
      summary: "Bitcoin and other major cryptocurrencies have shown strong recovery signals, with institutional adoption continuing to grow.",
      trending: "up",
      views: "3.1k",
      url: "#"
    },
    {
      id: 5,
      title: "Housing Market Shows Mixed Signals",
      category: "Real Estate",
      date: "Jan 16, 2024",
      author: "Wall Street Journal",
      readTime: "5 min read",
      image: "from-indigo-500 to-purple-600",
      summary: "Recent housing market data reveals a complex picture, with some regions showing strength while others face challenges from high interest rates.",
      trending: "down",
      views: "956",
      url: "#"
    },
    {
      id: 6,
      title: "ESG Investing Continues to Gain Momentum",
      category: "ESG",
      date: "Jan 15, 2024",
      author: "Financial News",
      readTime: "6 min read",
      image: "from-teal-500 to-green-600",
      summary: "Environmental, Social, and Governance (ESG) investing strategies are attracting record inflows as investors prioritize sustainability and responsible business practices.",
      trending: "up",
      views: "1.5k",
      url: "#"
    }
  ];

  // Fetch news from Finnhub API with pagination
  const fetchNews = async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);
      
      // Get Finnhub API key from environment variables
      const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
      
      console.log('🔍 Checking for Finnhub API key...');
      console.log('API Key exists:', !!FINNHUB_API_KEY);
      
      if (!FINNHUB_API_KEY) {
        console.warn('⚠️ Finnhub API key not found. Using fallback data.');
        const paginatedFallback = paginateData(fallbackNews, page, 12);
        setNewsArticles(paginatedFallback.articles);
        setTotalPages(paginatedFallback.totalPages);
        setHasMore(paginatedFallback.hasMore);
        setLastUpdated(new Date());
        setIsLoading(false);
        setIsLoadingMore(false);
        return;
      }

      console.log('🚀 Fetching news from Finnhub API...');

      // Fetch general market news with pagination
      const response = await axios.get(`https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API_KEY}&minId=0`);
      
      console.log('📡 API Response received:', response.data?.length || 0, 'articles');
      
      if (response.data && Array.isArray(response.data)) {
        console.log('✅ Transforming API data...');
        // Transform the data to match our component structure
        const transformedNews = response.data.map((article, index) => ({
          id: article.id || index,
          title: article.headline || 'No title available',
          category: article.category || 'Market News',
          date: new Date(article.datetime * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          author: article.source || 'Financial News',
          readTime: `${Math.max(1, Math.floor(article.headline?.length / 200))} min read`,
          image: getRandomGradient(),
          summary: article.summary || 'No summary available',
          trending: Math.random() > 0.5 ? 'up' : 'down',
          views: `${Math.floor(Math.random() * 5) + 1}k`,
          url: article.url || '#'
        }));
        
        const paginatedData = paginateData(transformedNews, page, 12);
        
        if (append) {
          setNewsArticles(prev => [...prev, ...paginatedData.articles]);
        } else {
          setNewsArticles(paginatedData.articles);
        }
        
        setTotalPages(paginatedData.totalPages);
        setHasMore(paginatedData.hasMore);
        setCurrentPage(page);
        setLastUpdated(new Date());
        console.log('🎉 Successfully loaded', paginatedData.articles.length, 'articles from Finnhub API (page', page, ')');
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (err) {
      console.error('❌ Error fetching news:', err);
      setError(err.message || 'Failed to fetch news. Please try again later.');
      // Use fallback data on error
      console.log('🔄 Using fallback data due to error');
      const paginatedFallback = paginateData(fallbackNews, page, 12);
      setNewsArticles(paginatedFallback.articles);
      setTotalPages(paginatedFallback.totalPages);
      setHasMore(paginatedFallback.hasMore);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Pagination helper function
  const paginateData = (data, page, itemsPerPage) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const articles = data.slice(startIndex, endIndex);
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const hasMore = page < totalPages;
    
    return {
      articles,
      totalPages,
      hasMore,
      currentPage: page
    };
  };

  // Get random gradient for article images
  const getRandomGradient = () => {
    const gradients = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-blue-600',
      'from-yellow-500 to-orange-600',
      'from-purple-500 to-pink-600',
      'from-indigo-500 to-purple-600',
      'from-teal-500 to-green-600',
      'from-red-500 to-pink-600',
      'from-orange-500 to-red-600'
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  // Initialize news data
  useEffect(() => {
    if (newsArticles.length === 0) {
      fetchNews();
    }
  }, []);

  // Generate categories from news data
  const generateCategories = () => {
    const categoryCounts = {};
    newsArticles.forEach(article => {
      const category = article.category;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    const categories = [
      { id: 'all', name: 'All News', count: newsArticles.length }
    ];
    
    Object.entries(categoryCounts).forEach(([category, count]) => {
      categories.push({
        id: category.toLowerCase().replace(/\s+/g, '-'),
        name: category,
        count: count
      });
    });
    
    return categories;
  };

  const categories = generateCategories();

  // Filter articles based on category and search
  const filteredArticles = newsArticles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || 
      article.category.toLowerCase().includes(selectedCategory.replace('-', ' '));
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get category color styling
  const getCategoryColor = (category) => {
    switch (category) {
      case 'Market News':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case 'Earnings':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'Commodities':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'Crypto':
        return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20';
      case 'Real Estate':
        return 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/20';
      case 'ESG':
        return 'text-teal-600 bg-teal-100 dark:text-teal-400 dark:bg-teal-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setCurrentPage(1);
    fetchNews(1, false);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore) {
      fetchNews(currentPage + 1, true);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#171717] text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-40 ${theme === 'dark' ? 'bg-[#171717] border-b border-gray-800' : 'bg-white border-b border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <HiOutlineNewspaper className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Financial News
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Stay updated with the latest market insights
                </p>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-md ml-8">
              <div className={`relative ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 bg-transparent border-0 focus:outline-none focus:ring-0 ${
                    theme === 'dark' ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
                  }`}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Refresh Button and Last Updated */}
            <div className="flex items-center space-x-4">
              {lastUpdated && (
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isLoading
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:scale-105'
                } ${
                  theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                }`}
                title="Refresh news"
              >
                <HiOutlineRefresh className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Loading latest news...
            </h3>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Fetching the most recent financial news
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              theme === 'dark' ? 'bg-red-900/20' : 'bg-red-100'
            }`}>
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              API Error - Using Fallback Data
            </h3>
            <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {error}
            </p>
            <button
              onClick={fetchNews}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Categories */}
        {!isLoading && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : theme === 'dark'
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* News Grid */}
        {!isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article, index) => (
            <div
              key={article.id}
              className={`group cursor-pointer ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg border ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              } overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              onClick={() => window.open(article.url, '_blank')}
            >
              {/* Image */}
              <div className={`h-48 bg-gradient-to-br ${article.image} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                    {article.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4 flex items-center space-x-2">
                  {article.trending === 'up' ? (
                    <HiOutlineTrendingUp className="w-5 h-5 text-green-400" />
                  ) : (
                    <HiOutlineTrendingDown className="w-5 h-5 text-red-400" />
                  )}
                  <span className={`text-xs font-medium ${
                    article.trending === 'up' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {article.trending === 'up' ? 'Trending' : 'Declining'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className={`text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors duration-200 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {article.title}
                </h3>
                <p className={`mb-4 line-clamp-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {article.summary}
                </p>

                {/* Meta */}
                <div className="flex items-center justify-between text-sm">
                  <div className={`flex items-center space-x-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="flex items-center space-x-1">
                      <HiOutlineUser className="w-4 h-4" />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <HiOutlineClock className="w-4 h-4" />
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <HiOutlineEye className="w-4 h-4" />
                    <span>{article.views}</span>
                  </div>
                </div>

                {/* Date */}
                <div className={`mt-3 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  {article.date}
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <HiOutlineNewspaper className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              No news found
            </h3>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Try adjusting your search or category filters
            </p>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && filteredArticles.length > 0 && (
          <div className="mt-8 flex flex-col items-center space-y-4">
            {/* Load More Button */}
            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isLoadingMore
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:scale-105'
                } ${
                  theme === 'dark'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isLoadingMore ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Loading...</span>
                  </div>
                ) : (
                  'Load More Articles'
                )}
              </button>
            )}

            {/* Page Info */}
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Showing {newsArticles.length} articles
              {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
            </div>

            {/* End of Results */}
            {!hasMore && (
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                You've reached the end of all available articles
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default News; 