import React, { useState, useEffect } from 'react';
import { 
  HiOutlineNewspaper, HiOutlineClock, HiOutlineUser, HiOutlineTrendingUp, 
  HiOutlineTrendingDown, HiOutlineEye, HiOutlineRefresh, HiOutlineBookmark,
  HiOutlineShare, HiOutlineExternalLink, HiBookmark, HiHeart, HiOutlineHeart,
  HiOutlineFilter, HiOutlineSearch, HiOutlineChevronDown
} from 'react-icons/hi';
import axios from 'axios';

const News = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [newsArticles, setNewsArticles] = useState([]);
  const [error, setError] = useState(null);
  const [savedArticles, setSavedArticles] = useState([]);
  const [likedArticles, setLikedArticles] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('latest');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  // Initialize theme
  useEffect(() => {
    const handleThemeChange = (e) => {
      const newTheme = e.detail?.theme || e.detail || localStorage.getItem('theme') || 'light';
      setTheme(newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');

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

  // Load saved/liked articles from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedArticles') || '[]');
    const liked = JSON.parse(localStorage.getItem('likedArticles') || '[]');
    setSavedArticles(saved);
    setLikedArticles(liked);
  }, []);

  // Fetch news from backend
  const fetchNews = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🚀 Fetching news from backend...');
      const response = await axios.get(`${API_BASE_URL}/news`);
      
      if (response.data && response.data.success) {
        console.log('✅ Received', response.data.count, 'articles');
        setNewsArticles(response.data.articles);
        setLastUpdated(new Date(response.data.lastUpdated));
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('❌ Error fetching news:', err);
      setError(err.message || 'Failed to fetch news. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Toggle saved article
  const toggleSaved = (articleId) => {
    const newSaved = savedArticles.includes(articleId)
      ? savedArticles.filter(id => id !== articleId)
      : [...savedArticles, articleId];
    setSavedArticles(newSaved);
    localStorage.setItem('savedArticles', JSON.stringify(newSaved));
  };

  // Toggle liked article
  const toggleLiked = (articleId) => {
    const newLiked = likedArticles.includes(articleId)
      ? likedArticles.filter(id => id !== articleId)
      : [...likedArticles, articleId];
    setLikedArticles(newLiked);
    localStorage.setItem('likedArticles', JSON.stringify(newLiked));
  };

  // Share article
  const shareArticle = async (article) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: article.url
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(article.url);
      alert('Link copied to clipboard!');
    }
  };

  // Generate categories
  const generateCategories = () => {
    const categoryCounts = {};
    newsArticles.forEach(article => {
      const category = article.category || 'General';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    const categories = [
      { id: 'all', name: 'All News', count: newsArticles.length, icon: '📰' }
    ];
    
    const categoryIcons = {
      'Market': '📈',
      'Technology': '💻',
      'Earnings': '💰',
      'Crypto': '₿',
      'General': '📋',
      'Finance': '🏦',
      'Forex': '💱'
    };
    
    Object.entries(categoryCounts).forEach(([category, count]) => {
      categories.push({
        id: category.toLowerCase().replace(/\s+/g, '-'),
        name: category,
        count: count,
        icon: categoryIcons[category] || '📄'
      });
    });
    
    return categories;
  };

  const categories = generateCategories();

  // Filter and sort articles
  const getFilteredArticles = () => {
    let filtered = newsArticles.filter(article => {
      const matchesCategory = selectedCategory === 'all' || 
        article.category?.toLowerCase().includes(selectedCategory.replace('-', ' '));
      const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    // Sort articles
    switch (sortBy) {
      case 'latest':
        filtered.sort((a, b) => b.datetime - a.datetime);
        break;
      case 'trending':
        filtered.sort((a, b) => parseFloat(b.views) - parseFloat(a.views));
        break;
      case 'saved':
        filtered = filtered.filter(a => savedArticles.includes(a.id));
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredArticles = getFilteredArticles();

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'Market': 'blue',
      'Technology': 'purple',
      'Earnings': 'green',
      'Crypto': 'orange',
      'General': 'gray',
      'Finance': 'indigo',
      'Forex': 'teal'
    };
    const color = colors[category] || 'gray';
    return `text-${color}-600 bg-${color}-100 dark:text-${color}-400 dark:bg-${color}-900/20`;
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0f0f0f]' : 'bg-gray-50'}`}>
      {/* Hero Header */}
      <div className={`${theme === 'dark' ? 'bg-gradient-to-r from-blue-900/50 to-purple-900/50' : 'bg-gradient-to-r from-blue-600 to-purple-600'} shadow-2xl`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="p-4 bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl">
                <HiOutlineNewspaper className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Financial News
                </h1>
                <p className="text-blue-100 text-lg">
                  Real-time market insights from multiple sources
                </p>
                {lastUpdated && (
                  <div className="flex items-center mt-2 space-x-2 text-sm text-blue-200">
                    <HiOutlineClock className="w-4 h-4" />
                    <span>Updated {lastUpdated.toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={fetchNews}
              disabled={isLoading}
              className={`px-6 py-3 bg-white/20 backdrop-blur-lg text-white rounded-xl font-medium transition-all duration-200 hover:bg-white/30 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg`}
            >
              <HiOutlineRefresh className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-8">
            <div className="relative max-w-2xl">
              <HiOutlineSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles, topics, companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters & Sort */}
        <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : theme === 'dark'
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  selectedCategory === category.id
                    ? 'bg-white/20'
                    : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <HiOutlineFilter className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-4 py-2 rounded-xl font-medium cursor-pointer transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800 text-gray-300 border-gray-700'
                  : 'bg-white text-gray-700 border-gray-300 shadow'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="latest">Latest First</option>
              <option value="trending">Most Viewed</option>
              <option value="saved">Saved Only</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Loading amazing news...
            </h3>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Aggregating from multiple sources with beautiful images
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className={`text-center py-12 ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'} rounded-2xl`}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-red-100 dark:bg-red-900/30">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Oops! Something went wrong
            </h3>
            <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {error}
            </p>
            <button
              onClick={fetchNews}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* News Grid - Modern Card Design */}
        {!isLoading && filteredArticles.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <article
                key={article.id}
                className={`group ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'} rounded-2xl shadow-xl border ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
                } overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 backdrop-blur-sm`}
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  {article.imageData?.url ? (
                    <img
                      src={article.imageData.url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br from-blue-500 to-purple-600`}></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 backdrop-blur-md bg-white/20 text-white rounded-full text-xs font-semibold border border-white/30">
                      {article.category}
                    </span>
                  </div>

                  {/* Trending Badge */}
                  <div className="absolute top-4 right-4 flex items-center space-x-1 backdrop-blur-md bg-white/20 px-2 py-1 rounded-full border border-white/30">
                    {article.trending === 'up' ? (
                      <HiOutlineTrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <HiOutlineTrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`text-xs font-semibold ${
                      article.trending === 'up' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {article.trending === 'up' ? 'Hot' : 'Cool'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute bottom-4 right-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLiked(article.id);
                      }}
                      className="p-2 backdrop-blur-md bg-white/20 hover:bg-white/30 rounded-full border border-white/30 transition-all"
                    >
                      {likedArticles.includes(article.id) ? (
                        <HiHeart className="w-5 h-5 text-red-400" />
                      ) : (
                        <HiOutlineHeart className="w-5 h-5 text-white" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaved(article.id);
                      }}
                      className="p-2 backdrop-blur-md bg-white/20 hover:bg-white/30 rounded-full border border-white/30 transition-all"
                    >
                      {savedArticles.includes(article.id) ? (
                        <HiBookmark className="w-5 h-5 text-yellow-400" />
                      ) : (
                        <HiOutlineBookmark className="w-5 h-5 text-white" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        shareArticle(article);
                      }}
                      className="p-2 backdrop-blur-md bg-white/20 hover:bg-white/30 rounded-full border border-white/30 transition-all"
                    >
                      <HiOutlineShare className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 
                    onClick={() => window.open(article.url, '_blank')}
                    className={`text-xl font-bold mb-3 line-clamp-2 cursor-pointer group-hover:text-blue-600 transition-colors ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {article.title}
                  </h3>

                  <p className={`mb-4 line-clamp-3 text-sm leading-relaxed ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {article.summary || 'Read the full article for more details...'}
                  </p>

                  {/* Sentiment (if available) */}
                  {article.sentiment && (
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-3 ${
                      article.sentiment === 'Bullish' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      article.sentiment === 'Bearish' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      Sentiment: {article.sentiment}
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                    <div className={`flex items-center space-x-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      <div className="flex items-center space-x-1">
                        <HiOutlineUser className="w-4 h-4" />
                        <span className="font-medium">{article.source}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <HiOutlineClock className="w-4 h-4" />
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                    <div className={`flex items-center space-x-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      <HiOutlineEye className="w-4 h-4" />
                      <span className="font-medium">{article.views}</span>
                    </div>
                  </div>

                  {/* Date & Read More */}
                  <div className="flex items-center justify-between mt-4">
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      {article.date}
                    </span>
                    <button
                      onClick={() => window.open(article.url, '_blank')}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm transition-colors"
                    >
                      <span>Read Full Article</span>
                      <HiOutlineExternalLink className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Image Credit */}
                  {article.imageData?.photographer && (
                    <div className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
                      Photo by {article.imageData.photographer}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredArticles.length === 0 && !error && (
          <div className="text-center py-16">
            <HiOutlineNewspaper className={`w-24 h-24 mx-auto mb-6 ${theme === 'dark' ? 'text-gray-700' : 'text-gray-300'}`} />
            <h3 className={`text-2xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              No articles found
            </h3>
            <p className={`text-lg mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Try adjusting your search or category filters
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Stats Footer */}
        {!isLoading && filteredArticles.length > 0 && (
          <div className={`mt-12 p-6 rounded-2xl ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'} shadow-xl`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {newsArticles.length}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Articles
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {savedArticles.length}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Saved
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {likedArticles.length}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Liked
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {categories.length - 1}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Categories
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default News;
