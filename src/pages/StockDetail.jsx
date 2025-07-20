import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Title, Text, Badge, TabGroup, TabList, Tab, TabPanels, TabPanel } from '@tremor/react';
import { 
  HiTrendingUp, 
  HiTrendingDown, 
  HiCurrencyDollar, 
  HiChartBar,
  HiNewspaper,
  HiUserGroup,
  HiCalendar,
  HiLightningBolt,
  HiStar
} from 'react-icons/hi';
import api from '../services/api';

const StockDetail = ({ ticker }) => {
  const [stockData, setStockData] = useState(null);
  const [financials, setFinancials] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (ticker) {
      fetchStockData();
    }
  }, [ticker]);

  useEffect(() => {
    const handleThemeChange = (e) => {
      const newTheme = e.detail || localStorage.getItem('theme') || 'light';
      setTheme(newTheme);
    };

    window.addEventListener('themeChange', handleThemeChange);
    document.addEventListener('themeChanged', handleThemeChange);

    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
      document.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);

  const fetchStockData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch multiple data points in parallel
      const [quoteRes, profileRes, metricsRes, newsRes] = await Promise.allSettled([
        api.get(`/stocks/${ticker}/quote`),
        api.get(`/stocks/${ticker}/profile`),
        api.get(`/stocks/${ticker}/metrics`),
        api.get(`/stocks/${ticker}/news`)
      ]);

      const data = {
        quote: quoteRes.status === 'fulfilled' ? quoteRes.value.data : null,
        profile: profileRes.status === 'fulfilled' ? profileRes.value.data : null,
        metrics: metricsRes.status === 'fulfilled' ? metricsRes.value.data : null,
        news: newsRes.status === 'fulfilled' ? newsRes.value.data : []
      };

      setStockData(data);
      setNews(data.news.slice(0, 5)); // Show latest 5 news items
    } catch (error) {
      console.error('Error fetching stock data:', error);
      setError('Failed to fetch stock data');
    } finally {
      setLoading(false);
    }
  };

  const getPriceChangeColor = (change) => {
    return change >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const getPriceChangeIcon = (change) => {
    return change >= 0 ? <HiTrendingUp className="w-4 h-4" /> : <HiTrendingDown className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  if (!stockData) {
    return (
      <div className="text-center p-8">
        <div className="text-gray-500 text-lg">No data available</div>
      </div>
    );
  }

  const { quote, profile, metrics } = stockData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {profile?.name || ticker}
          </h1>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {profile?.exchange} • {profile?.finnhubIndustry}
          </p>
        </div>
        <Badge color="blue" size="lg">
          {ticker}
        </Badge>
      </div>

      {/* Price and Change */}
      {quote && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ${quote.c?.toFixed(2)}
              </div>
              <div className={`flex items-center gap-2 mt-2 ${getPriceChangeColor(quote.d)}`}>
                {getPriceChangeIcon(quote.d)}
                <span className="font-semibold">
                  {quote.d >= 0 ? '+' : ''}{quote.d?.toFixed(2)} ({quote.dp >= 0 ? '+' : ''}{quote.dp?.toFixed(2)}%)
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Day Range: ${quote.l?.toFixed(2)} - ${quote.h?.toFixed(2)}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Volume: {quote.v?.toLocaleString()}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <TabGroup>
        <TabList variant="solid">
          <Tab icon={HiChartBar}>Overview</Tab>
          <Tab icon={HiNewspaper}>News</Tab>
          <Tab icon={HiUserGroup}>Analysts</Tab>
          <Tab icon={HiCalendar}>Earnings</Tab>
        </TabList>
        <TabPanels>
          {/* Overview Tab */}
          <TabPanel>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {/* Key Metrics */}
              {metrics && (
                <Card>
                  <Title>Key Metrics</Title>
                  <div className="space-y-3 mt-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">P/E Ratio</span>
                      <span className="font-semibold">{metrics.pe?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">P/B Ratio</span>
                      <span className="font-semibold">{metrics.pb?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Market Cap</span>
                      <span className="font-semibold">
                        ${(metrics.marketCapitalization / 1e9)?.toFixed(2)}B
                      </span>
                    </div>
                  </div>
                </Card>
              )}

              {/* Company Info */}
              {profile && (
                <Card>
                  <Title>Company Info</Title>
                  <div className="space-y-3 mt-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sector</span>
                      <span className="font-semibold">{profile.finnhubIndustry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Country</span>
                      <span className="font-semibold">{profile.country}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">IPO Date</span>
                      <span className="font-semibold">
                        {profile.ipo ? new Date(profile.ipo).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <Title>Quick Actions</Title>
                <div className="space-y-3 mt-4">
                  <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                    Add to Portfolio
                  </button>
                  <button className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                    Add to Watchlist
                  </button>
                  <button className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
                    View Chart
                  </button>
                </div>
              </Card>
            </div>
          </TabPanel>

          {/* News Tab */}
          <TabPanel>
            <div className="mt-6 space-y-4">
              {news.length > 0 ? (
                news.map((article, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{article.headline}</h3>
                        <p className="text-gray-600 text-sm mb-2">{article.summary}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{article.source}</span>
                          <span>{new Date(article.datetime * 1000).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                      >
                        Read
                      </a>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No news available
                </div>
              )}
            </div>
          </TabPanel>

          {/* Analysts Tab */}
          <TabPanel>
            <div className="mt-6">
              <Card>
                <Title>Analyst Recommendations</Title>
                <div className="text-center py-8 text-gray-500">
                  Analyst data will be available here
                </div>
              </Card>
            </div>
          </TabPanel>

          {/* Earnings Tab */}
          <TabPanel>
            <div className="mt-6">
              <Card>
                <Title>Earnings Calendar</Title>
                <div className="text-center py-8 text-gray-500">
                  Earnings data will be available here
                </div>
              </Card>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </motion.div>
  );
};

export default StockDetail; 