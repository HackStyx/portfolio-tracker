import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineEye, HiOutlineTrash, HiSearch, HiPlus, HiTrendingUp, HiTrendingDown, HiOutlineBell, HiOutlineChartBar, HiOutlineClock, HiOutlinePencil } from 'react-icons/hi';
import api from '../services/api';
import { Card, Text, Metric, Badge, ProgressBar } from '@tremor/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';



const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [newStock, setNewStock] = useState({ name: '', ticker: '', target_price: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  // Autocomplete states
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    console.log('Watchlist component mounted');
    fetchWatchlist();
    // Removed automatic sync - watchlist should only show manually added stocks

    const handleThemeChange = (e) => {
      const newTheme = e.detail || localStorage.getItem('theme') || 'light';
      console.log('Theme changed to:', newTheme);
      setTheme(newTheme);
    };

    // Listen for theme changes
    window.addEventListener('themeChange', handleThemeChange);
    document.addEventListener('themeChanged', handleThemeChange);

    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
      document.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);

  const fetchWatchlist = async () => {
    try {
      console.log('Fetching watchlist from API');
      const response = await api.get('/watchlist');
      console.log('Watchlist response:', response.data);
      setWatchlist(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      setError('Failed to fetch watchlist');
      setLoading(false);
    }
  };

  const syncPortfolioStocks = async () => {
    try {
      console.log('Syncing portfolio stocks...');
      await api.post('/watchlist/sync-portfolio');
      await fetchWatchlist();
    } catch (error) {
      console.error('Error syncing portfolio stocks:', error);
      setError('Failed to sync portfolio stocks');
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    try {
      console.log('Adding stock:', newStock);
      await api.post('/watchlist', newStock);
      handleModalClose();
      await fetchWatchlist();
    } catch (error) {
      console.error('Error adding stock:', error);
      setError(error.response?.data?.error || 'Failed to add stock');
    }
  };

  const handleDeleteStock = async (id) => {
    if (window.confirm('Are you sure you want to remove this stock from your watchlist?')) {
      try {
        console.log('Deleting stock:', id);
        await api.delete(`/watchlist/${id}`);
        await fetchWatchlist();
      } catch (error) {
        console.error('Error deleting stock:', error);
        setError('Failed to delete stock');
      }
    }
  };

  const clearAllWatchlist = async () => {
    if (window.confirm('Are you sure you want to clear all stocks from your watchlist? This action cannot be undone.')) {
      try {
        console.log('Clearing all watchlist stocks...');
        
        // Get current watchlist and delete each stock individually
        const response = await api.get('/watchlist');
        const currentWatchlist = response.data;
        
        console.log(`Found ${currentWatchlist.length} stocks to remove`);
        
        // Delete each stock one by one
        for (const stock of currentWatchlist) {
          try {
            console.log(`Removing ${stock.ticker} (ID: ${stock.id}) from watchlist...`);
            await api.delete(`/watchlist/${stock.id}`);
            console.log(`Successfully removed ${stock.ticker}`);
          } catch (deleteError) {
            console.error(`Failed to remove ${stock.ticker}:`, deleteError);
            // Continue with other stocks
          }
        }
        
        // Refresh the watchlist
        await fetchWatchlist();
        console.log('Watchlist clearing completed');
        
      } catch (error) {
        console.error('Error in clearAllWatchlist:', error);
        setError('Failed to clear watchlist. Please try refreshing the page and deleting stocks individually.');
      }
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    try {
      console.log('Updating stock:', selectedStock);
      await api.put(`/watchlist/${selectedStock.id}`, {
        target_price: selectedStock.target_price
      });
      setShowUpdateModal(false);
      setSelectedStock(null);
      await fetchWatchlist();
    } catch (error) {
      console.error('Error updating stock:', error);
      setError(error.response?.data?.error || 'Failed to update stock');
    }
  };

  const handleViewStock = async (stock) => {
    setSelectedStock(stock);
    setShowViewModal(true);
    try {
      const response = await api.get(`/watchlist/${stock.id}/history`);
      setPriceHistory(response.data.map(item => ({
        ...item,
        date: new Date(item.timestamp).toLocaleDateString(),
        price: parseFloat(item.price)
      })));
    } catch (error) {
      console.error('Error fetching price history:', error);
      setPriceHistory([]);
    }
  };

  const handleUpdateClick = (stock) => {
    setSelectedStock(stock);
    setShowUpdateModal(true);
  };

  // Stock search and autocomplete functions
  const searchStocks = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      // Use our backend endpoint to search for stocks
      const response = await api.get(`/stocks/search?q=${encodeURIComponent(query)}`);
      
      if (response.data && response.data.result) {
        setSearchResults(response.data.result);
        setShowDropdown(true);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('Error searching stocks:', error);
      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setStockSearchQuery(query);
    setNewStock({ ...newStock, name: '', ticker: '' });
    
    // Debounce the search
    const timeoutId = setTimeout(() => {
      searchStocks(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const selectStock = (stock) => {
    setNewStock({
      ...newStock,
      name: stock.description,
      ticker: stock.symbol
    });
    setStockSearchQuery(stock.symbol);
    setShowDropdown(false);
    setSearchResults([]);
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setNewStock({ name: '', ticker: '', target_price: '' });
    setStockSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  const filteredWatchlist = watchlist.filter(stock => 
    stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateStats = () => {
    const totalStocks = watchlist.length;
    const stocksAboveTarget = watchlist.filter(stock => parseFloat(stock.current_price || 0) > parseFloat(stock.target_price || 0));
    const stocksNearTarget = watchlist.filter(stock => 
      Math.abs((parseFloat(stock.current_price || 0) - parseFloat(stock.target_price || 0)) / parseFloat(stock.target_price || 1)) <= 0.05
    );
    const stocksBelowTarget = watchlist.filter(stock => parseFloat(stock.current_price || 0) < parseFloat(stock.target_price || 0));
    
    const totalValue = watchlist.reduce((sum, stock) => sum + (parseFloat(stock.current_price || 0) * (parseInt(stock.shares || 0, 10) || 1)), 0);
    const targetValue = watchlist.reduce((sum, stock) => sum + (parseFloat(stock.target_price || 0) * (parseInt(stock.shares || 0, 10) || 1)), 0);
    const valueGrowthPotential = totalValue > 0 ? ((targetValue - totalValue) / totalValue) * 100 : 0;

    const bestPerformer = watchlist.reduce((best, stock) => {
      const currentPerformance = ((parseFloat(stock.current_price || 0) - parseFloat(stock.target_price || 0)) / parseFloat(stock.target_price || 1)) * 100;
      if (!best || currentPerformance > best.performance) {
        return { ticker: stock.ticker, performance: currentPerformance };
      }
      return best;
    }, null);

    return {
      totalStocks,
      nearTarget: stocksNearTarget.length,
      aboveTarget: stocksAboveTarget.length,
      belowTarget: stocksBelowTarget.length,
      targetProgress: totalStocks > 0 ? (stocksAboveTarget.length / totalStocks) * 100 : 0,
      valueGrowthPotential,
      bestPerformer,
      totalValue,
      averageProgress: totalStocks > 0 ? watchlist.reduce((sum, stock) => {
        return sum + ((parseFloat(stock.current_price || 0) / parseFloat(stock.target_price || 1)) * 100);
      }, 0) / totalStocks : 0
    };
  };

  const stats = calculateStats();

  console.log('Rendering Watchlist component with theme:', theme);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`p-6 min-h-screen ${theme === 'dark' ? 'bg-[#171717] text-white' : 'bg-white text-gray-800'}`}
    >
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Watchlist
            </h1>
            <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Track and monitor your favorite stocks
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-grow sm:max-w-xs">
              <input
                type="text"
                placeholder="Search stocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-xl border ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-200 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <HiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
            >
              <HiPlus className="w-5 h-5" />
              <span>Add to Watchlist</span>
            </button>
            {watchlist.length > 0 && (
              <button
                onClick={clearAllWatchlist}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-sm"
              >
                <HiOutlineTrash className="w-5 h-5" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Portfolio Overview Card */}
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className={`relative p-6 rounded-2xl overflow-hidden ${
              theme === 'dark'
                ? 'bg-[#1f1f1f]/80 border border-white/10 backdrop-blur-md'
                : 'bg-white/80 border border-gray-200 backdrop-blur-md'
            } shadow-lg hover:shadow-xl transition-all duration-300`}
          >
            {/* Blurry background decoration */}
            <div className={`absolute inset-0 bg-gradient-to-br ${
              theme === 'dark' 
                ? 'from-blue-500/10 via-purple-500/5 to-transparent' 
                : 'from-blue-100/30 via-purple-100/20 to-transparent'
            } blur-xl`}></div>
            <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Text className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Portfolio Overview
                </Text>
                <Metric className={`mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.totalStocks} Stocks
                </Metric>
              </div>
                <div className={`p-3 rounded-xl backdrop-blur-sm ${
                  theme === 'dark' ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-blue-100/80 border border-blue-200/50'
              }`}>
                <HiOutlineChartBar className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Text className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Above Target</Text>
                <Badge color="emerald">{stats.aboveTarget}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <Text className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Near Target</Text>
                <Badge color="amber">{stats.nearTarget}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <Text className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Below Target</Text>
                <Badge color="red">{stats.belowTarget}</Badge>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Target Progress Card */}
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className={`relative p-6 rounded-2xl overflow-hidden ${
              theme === 'dark'
                ? 'bg-[#1f1f1f]/80 border border-white/10 backdrop-blur-md'
                : 'bg-white/80 border border-gray-200 backdrop-blur-md'
            } shadow-lg hover:shadow-xl transition-all duration-300`}
          >
            {/* Blurry background decoration */}
            <div className={`absolute inset-0 bg-gradient-to-br ${
              theme === 'dark' 
                ? 'from-green-500/10 via-emerald-500/5 to-transparent' 
                : 'from-green-100/30 via-emerald-100/20 to-transparent'
            } blur-xl`}></div>
            <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Text className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Target Progress
                </Text>
                <div className="flex items-baseline gap-2 mt-2">
                  <Metric className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    {stats.averageProgress.toFixed(1)}%
                  </Metric>
                  <Text className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    average
                  </Text>
                </div>
              </div>
                <div className={`p-3 rounded-xl backdrop-blur-sm ${
                  theme === 'dark' ? 'bg-green-500/20 border border-green-500/30' : 'bg-green-100/80 border border-green-200/50'
              }`}>
                <HiOutlineBell className={`w-6 h-6 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Text className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Overall Progress</Text>
                  <Text className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {stats.targetProgress.toFixed(1)}%
                  </Text>
                </div>
                <ProgressBar value={stats.targetProgress} color="emerald" className="h-2" />
              </div>
              {stats.bestPerformer && (
                <div className="pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
                  <Text className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Best Performer</Text>
                  <div className="flex justify-between items-center mt-1">
                    <Text className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {stats.bestPerformer.ticker}
                    </Text>
                    <Badge color="emerald">
                      {stats.bestPerformer.performance.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              )}
              </div>
            </div>
          </motion.div>

          {/* Value Analysis Card */}
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className={`relative p-6 rounded-2xl overflow-hidden ${
              theme === 'dark'
                ? 'bg-[#1f1f1f]/80 border border-white/10 backdrop-blur-md'
                : 'bg-white/80 border border-gray-200 backdrop-blur-md'
            } shadow-lg hover:shadow-xl transition-all duration-300`}
          >
            {/* Blurry background decoration */}
            <div className={`absolute inset-0 bg-gradient-to-br ${
              theme === 'dark' 
                ? 'from-purple-500/10 via-pink-500/5 to-transparent' 
                : 'from-purple-100/30 via-pink-100/20 to-transparent'
            } blur-xl`}></div>
            <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Text className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Value Analysis
                </Text>
                <div className="flex items-baseline gap-2 mt-2">
                  <Metric className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    ${stats.totalValue.toLocaleString()}
                  </Metric>
                </div>
              </div>
                <div className={`p-3 rounded-xl backdrop-blur-sm ${
                  theme === 'dark' ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-purple-100/80 border border-purple-200/50'
              }`}>
                <HiOutlineClock className={`w-6 h-6 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Text className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Growth Potential</Text>
                <Badge 
                  color={stats.valueGrowthPotential > 0 ? 'emerald' : 'red'}
                  icon={stats.valueGrowthPotential > 0 ? HiTrendingUp : HiTrendingDown}
                >
                  {stats.valueGrowthPotential.toFixed(1)}%
                </Badge>
              </div>
              <div className="pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <Text className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Last Updated</Text>
                  <Text className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {new Date().toLocaleTimeString()}
                  </Text>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {error && (
          <div
            className={`mb-6 p-4 rounded-xl border ${
              theme === 'dark'
                ? 'bg-red-900/20 border-red-800 text-red-400'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {error}
          </div>
        )}

        {/* Watchlist Table */}
        <div
          className={`relative rounded-2xl overflow-hidden ${
            theme === 'dark' 
              ? 'bg-[#1f1f1f]/80 border border-white/10 backdrop-blur-md' 
              : 'bg-white/80 border border-gray-200 backdrop-blur-md'
          } shadow-lg`}
        >
          {/* Blurry background decoration */}
          <div className={`absolute inset-0 bg-gradient-to-br ${
            theme === 'dark' 
              ? 'from-gray-500/5 via-blue-500/3 to-transparent' 
              : 'from-gray-100/20 via-blue-100/10 to-transparent'
          } blur-xl`}></div>
          <div className="relative z-10">
          <div className="overflow-x-auto">
            <table className="w-full">
                <thead className={`${
                  theme === 'dark' 
                    ? 'bg-gray-800/60 border-b border-gray-700/50' 
                    : 'bg-gray-50/80 border-b border-gray-200/50'
                } backdrop-blur-sm`}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-xs font-semibold tracking-wider uppercase ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Stock</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold tracking-wider uppercase ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Current Price</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold tracking-wider uppercase ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Target Price</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold tracking-wider uppercase ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Distance to Target</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold tracking-wider uppercase ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Actions</th>
                </tr>
              </thead>
                <tbody className={`divide-y ${
                  theme === 'dark' 
                    ? 'divide-gray-700/50' 
                    : 'divide-gray-200/50'
                }`}>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredWatchlist.length === 0 ? (
                  <tr>
                    <td colSpan="5" className={`px-6 py-8 text-center ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <div className="flex flex-col items-center">
                        <HiOutlineEye className={`w-12 h-12 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                        <p className="mt-2">No stocks in watchlist</p>
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                        >
                          Add Your First Stock
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredWatchlist.map((stock) => (
                    <tr
                      key={stock.id}
                        className={`${
                          theme === 'dark' 
                            ? 'bg-gray-800/40 hover:bg-gray-700/60' 
                            : 'bg-white/60 hover:bg-gray-50/80'
                        } transition-all duration-200 backdrop-blur-sm`}
                    >
                      <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <div className="flex items-center">
                          <div>
                              <div className="font-semibold">{stock.name}</div>
                            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{stock.ticker}</div>
                          </div>
                        </div>
                      </td>
                        <td className={`px-6 py-4 whitespace-nowrap font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        ${parseFloat(stock.current_price || 0).toFixed(2)}
                      </td>
                        <td className={`px-6 py-4 whitespace-nowrap font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        ${parseFloat(stock.target_price || 0).toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap`}>
                        <Badge
                          color={parseFloat(stock.current_price || 0) >= parseFloat(stock.target_price || 0) ? 'emerald' : 'red'}
                          icon={parseFloat(stock.current_price || 0) >= parseFloat(stock.target_price || 0) ? HiTrendingUp : HiTrendingDown}
                        >
                          {(((parseFloat(stock.current_price || 0) - parseFloat(stock.target_price || 0)) / parseFloat(stock.target_price || 1)) * 100).toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleViewStock(stock)}
                              className={`p-2 rounded-lg transition-all duration-200 ${
                              theme === 'dark' 
                                  ? 'hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 hover:shadow-lg' 
                                  : 'hover:bg-blue-100 text-blue-500 hover:text-blue-600 hover:shadow-md'
                            }`}
                            title="View Details"
                          >
                            <HiOutlineEye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleUpdateClick(stock)}
                              className={`p-2 rounded-lg transition-all duration-200 ${
                              theme === 'dark'
                                  ? 'hover:bg-green-500/20 text-green-400 hover:text-green-300 hover:shadow-lg'
                                  : 'hover:bg-green-100 text-green-500 hover:text-green-600 hover:shadow-md'
                            }`}
                            title="Update Target"
                          >
                            <HiOutlinePencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStock(stock.id)}
                              className={`p-2 rounded-lg transition-all duration-200 ${
                              theme === 'dark'
                                  ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300 hover:shadow-lg'
                                  : 'hover:bg-red-100 text-red-500 hover:text-red-600 hover:shadow-md'
                            }`}
                            title="Remove from Watchlist"
                          >
                            <HiOutlineTrash className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      </div>

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={`w-full max-w-md p-6 rounded-2xl shadow-2xl ${
              theme === 'dark'
                ? 'bg-[#1f1f1f] border border-gray-600'
                : 'bg-white border border-gray-200'
            }`}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Add Stock to Watchlist
            </h3>
              <button
                onClick={handleModalClose}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddStock}>
              <div className="space-y-4">
                {/* Stock Search with Autocomplete */}
                <div className="relative">
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Search Stock
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={stockSearchQuery}
                      onChange={handleSearchChange}
                      className={`w-full px-3 py-3 text-base rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
                      }`}
                      placeholder="Search for a stock (e.g., AAPL, Apple)"
                      required
                    />
                    {isSearching && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Autocomplete Dropdown */}
                  {showDropdown && searchResults.length > 0 && (
                    <div className={`absolute z-10 w-full mt-1 rounded-xl border-2 shadow-xl max-h-60 overflow-y-auto ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-600'
                        : 'bg-white border-gray-200'
                    }`}>
                      {searchResults.map((stock, index) => (
                        <button
                          key={`${stock.symbol}-${index}`}
                          type="button"
                          onClick={() => selectStock(stock)}
                          className={`w-full px-4 py-3 text-left hover:bg-blue-500 hover:text-white transition-colors ${
                            theme === 'dark'
                              ? 'text-gray-200 hover:bg-blue-600'
                              : 'text-gray-900 hover:bg-blue-500'
                          } ${index === 0 ? 'rounded-t-xl' : ''} ${index === searchResults.length - 1 ? 'rounded-b-xl' : ''}`}
                        >
                          <div className="flex justify-between items-center">
                <div>
                              <div className="font-semibold">{stock.symbol}</div>
                              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {stock.description}
                              </div>
                            </div>
                            <div className={`text-xs px-2 py-1 rounded ${
                              theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {stock.primaryExchange}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Stock Display */}
                {newStock.ticker && newStock.name && (
                  <div className={`p-3 rounded-xl border-2 ${
                    theme === 'dark'
                      ? 'bg-blue-900/20 border-blue-600/50'
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className={`font-semibold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                          {newStock.ticker}
                        </div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                          {newStock.name}
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'
                      }`}>
                        Selected
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Target Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newStock.target_price}
                    onChange={(e) => setNewStock({ ...newStock, target_price: e.target.value })}
                    className={`w-full px-3 py-3 text-base rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newStock.ticker || !newStock.name}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
                    newStock.ticker && newStock.name
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                >
                  Add Stock
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Update Stock Modal */}
      {showUpdateModal && selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className={`w-full max-w-md p-6 rounded-2xl shadow-2xl ${
              theme === 'dark'
                ? 'bg-[#1f1f1f] border border-gray-600'
                : 'bg-white border border-gray-200'
            }`}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Update Target Price
              </h3>
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedStock(null);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdateStock}>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={selectedStock.name}
                    disabled
                    className={`w-full px-3 py-3 text-base rounded-xl border-2 ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-300'
                        : 'bg-gray-100 border-gray-300 text-gray-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Ticker Symbol
                  </label>
                  <input
                    type="text"
                    value={selectedStock.ticker}
                    disabled
                    className={`w-full px-3 py-3 text-base rounded-xl border-2 ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-300'
                        : 'bg-gray-100 border-gray-300 text-gray-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Target Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={selectedStock.target_price}
                    onChange={(e) => setSelectedStock({ ...selectedStock, target_price: e.target.value })}
                    className={`w-full px-3 py-3 text-base rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateModal(false);
                    setSelectedStock(null);
                  }}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Update Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Stock Modal */}
      {showViewModal && selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className={`w-full max-w-3xl p-6 rounded-2xl shadow-2xl ${
              theme === 'dark'
                ? 'bg-[#1f1f1f] border border-gray-600'
                : 'bg-white border border-gray-200'
            }`}
          >
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {selectedStock.name}
                </h3>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedStock.ticker} • Last updated {new Date(selectedStock.last_updated).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedStock(null);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Price Chart */}
            <div className={`mt-4 p-4 rounded-xl border-2 ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-600' 
                : 'bg-white border-gray-200'
            }`}>
              <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Price History
              </h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={priceHistory}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop 
                          offset="5%" 
                          stopColor={theme === 'dark' ? '#60A5FA' : '#3B82F6'} 
                          stopOpacity={0.3}
                        />
                        <stop 
                          offset="95%" 
                          stopColor={theme === 'dark' ? '#60A5FA' : '#3B82F6'} 
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} 
                    />
                    <XAxis 
                      dataKey="date" 
                      stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                      tick={{ fill: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}
                    />
                    <YAxis 
                      stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                      tick={{ fill: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}
                      domain={['dataMin', 'dataMax']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                        borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
                        color: theme === 'dark' ? '#FFFFFF' : '#000000',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke={theme === 'dark' ? '#60A5FA' : '#3B82F6'}
                      strokeWidth={2}
                      fill="url(#colorPrice)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stock Details */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border-2 ${
                  theme === 'dark'
                  ? 'bg-gray-800 border-gray-600' 
                  : 'bg-white border-gray-200'
              }`}>
                <h5 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Current Price
                </h5>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    ${parseFloat(selectedStock.current_price || 0).toFixed(2)}
                  </p>
                </div>
              <div className={`p-4 rounded-xl border-2 ${
                      theme === 'dark'
                  ? 'bg-gray-800 border-gray-600' 
                  : 'bg-white border-gray-200'
              }`}>
                <h5 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Target Price
                </h5>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  ${parseFloat(selectedStock.target_price || 0).toFixed(2)}
                </p>
                </div>
              </div>
              </div>
        </div>
      )}
    </motion.div>
  );
};

export default Watchlist; 