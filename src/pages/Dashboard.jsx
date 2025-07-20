import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Card, Title, Badge, TabGroup, TabList, Tab } from '@tremor/react';
import { HiTrendingUp, HiTrendingDown, HiCurrencyDollar, HiChartPie, HiClock } from 'react-icons/hi';
import PortfolioAnalytics from '../components/dashboard/PortfolioAnalytics';
import StockDetail from '../components/dashboard/StockDetail';
import api from '../services/api';



const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

export default function Dashboard({ theme: propTheme }) {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(propTheme || localStorage.getItem('theme') || 'light');
  const [selectedPeriod, setSelectedPeriod] = useState('1W');
  const [selectedStock, setSelectedStock] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Add market status calculation function
  const getMarketStatus = () => {
    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTimeInMinutes = hours * 60 + minutes;
    
    // Market is closed on weekends (Saturday = 6, Sunday = 0)
    if (day === 0 || day === 6) {
      return { status: 'Closed', color: 'red' };
    }

    // Market hours in IST: 7:00 PM - 2:30 AM (next day)
    const marketOpen = 19 * 60;     // 7:00 PM IST
    const marketClose = 26 * 60 + 30; // 2:30 AM IST (next day)
    const currentTime = currentTimeInMinutes;
    
    // Handle time across midnight
    if (hours < 3) { // Before 3 AM
      if (currentTime <= marketClose % (24 * 60)) {
        return { status: 'Open', color: 'green' };
      }
    } else if (hours >= 19) { // After 7 PM
      if (currentTime >= marketOpen) {
        return { status: 'Open', color: 'green' };
      }
    }

    // Pre-market in IST (5:30 PM - 7:00 PM)
    if (hours === 17 && minutes >= 30 || hours === 18) {
      return { status: 'Pre-Market', color: 'yellow' };
    }

    return { status: 'After Hours', color: 'red' };
  };

  useEffect(() => {
    // Update theme when prop changes
    if (propTheme) {
      setTheme(propTheme);
    }
  }, [propTheme]);

  useEffect(() => {
    const handleThemeChange = (e) => {
      console.log('Dashboard: Theme change event received:', e.detail.theme);
      setTheme(e.detail.theme);
    };

    const handleStorageChange = () => {
      const currentTheme = localStorage.getItem('theme') || 'light';
      console.log('Dashboard: Storage change detected, new theme:', currentTheme);
      setTheme(currentTheme);
    };

    window.addEventListener('themeChange', handleThemeChange);
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('themeChanged', handleThemeChange);

    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);

  useEffect(() => {
    console.log('Dashboard: Current theme:', theme);
  }, [theme]);

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(fetchStocks, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchStocks = async () => {
    try {
      console.log('Fetching stocks from API');
      const response = await api.get('/stocks');
      console.log('Stocks fetched successfully:', response.data);
      setStocks(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching stocks:', err);
      setError('Failed to fetch stocks');
      setLoading(false);
    }
  };

  const generateChartData = () => {
    if (!stocks.length) return [];

    const currentTotalValue = stocks.reduce((sum, stock) => sum + (stock.current_price * stock.shares), 0);
    const data = [];
    
    // Calculate daily percentage changes for each stock
    const stockChanges = stocks.map(stock => {
      const dailyChange = ((stock.current_price - stock.buy_price) / stock.buy_price) / 30; // Approximate daily change
      return {
        shares: stock.shares,
        buyPrice: stock.buy_price,
        dailyChange
      };
    });

    const points = {
      '1D': 24,
      '1W': 7,
      '1M': 30,
      '3M': 90,
      '1Y': 365,
      'ALL': 365
    }[selectedPeriod] || 7;

    // Generate historical data points
    for (let i = points - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Calculate portfolio value for this date
      let portfolioValue = stockChanges.reduce((sum, stock) => {
        const daysAgo = i;
        const historicalPrice = stock.buyPrice * (1 + (stock.dailyChange * (points - daysAgo)));
        return sum + (historicalPrice * stock.shares);
      }, 0);

      // Add some minor realistic variation (+/- 0.5%)
      const variation = (Math.random() * 0.01 - 0.005) * portfolioValue;
      portfolioValue += variation;

      data.push({
        date: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          ...(selectedPeriod === '1D' && { hour: '2-digit' })
        }),
        "Portfolio Value": Number(portfolioValue.toFixed(2))
      });
    }

    // Ensure the last point matches the current total value
    if (data.length > 0) {
      data[data.length - 1]["Portfolio Value"] = currentTotalValue;
    }
    
    return data;
  };

  const chartdata = generateChartData();

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${
        theme === 'dark' ? 'bg-[#171717]' : 'bg-white'
      }`}>
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const totalValue = stocks.reduce((sum, stock) => sum + (stock.current_price * stock.shares), 0);
  const totalGain = stocks.reduce((sum, stock) => sum + ((stock.current_price - stock.buy_price) * stock.shares), 0);
  const percentageGain = (totalGain / (totalValue - totalGain)) * 100;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`p-6 min-h-screen ${theme === 'dark' ? 'bg-[#171717] text-white' : 'bg-white text-gray-800'}`}
    >
      {/* Welcome Section */}
      <motion.div 
        variants={itemVariants}
        className={`p-6 rounded-2xl mb-6 ${
          theme === 'dark' 
            ? 'bg-[#1f1f1f] border border-white/10' 
            : 'bg-white border border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Portfolio Overview
            </h1>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Track your investments and market performance
            </p>
          </div>
          <div className={`p-4 rounded-xl ${
            theme === 'dark' ? 'bg-white/10' : 'bg-gray-50'
          }`}>
            <div className="flex items-center space-x-2">
              <HiClock className={`w-5 h-5 ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <div className="flex flex-col">
                <span className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {currentTime.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
                <span className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  {currentTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
      >
        {/* Total Value Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`p-6 rounded-2xl relative overflow-hidden ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-[#1f1f1f] to-[#171717] border border-white/10'
              : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
            <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 ${
              theme === 'dark' ? 'bg-blue-500' : 'bg-blue-400'
            }`}></div>
          </div>
          <div className="relative">
            <HiCurrencyDollar className={`h-8 w-8 ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            } mb-4`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>Total Value</h3>
            <div className="flex flex-col gap-2">
              <span className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}>
                ${totalValue.toLocaleString()}
              </span>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Avg. Cost Basis: ${(stocks.reduce((sum, stock) => sum + (stock.buy_price * stock.shares), 0) / 
                                 stocks.reduce((sum, stock) => sum + stock.shares, 0)).toFixed(2)}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Gain/Loss Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`p-6 rounded-2xl relative overflow-hidden ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-[#1f1f1f] to-[#171717] border border-white/10'
              : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
            <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 ${
              percentageGain >= 0
                ? theme === 'dark' ? 'bg-green-500' : 'bg-green-400'
                : theme === 'dark' ? 'bg-red-500' : 'bg-red-400'
            }`}></div>
          </div>
          <div className="relative">
            {percentageGain >= 0 ? (
              <HiTrendingUp className={`h-8 w-8 ${
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              } mb-4`} />
            ) : (
              <HiTrendingDown className={`h-8 w-8 ${
                theme === 'dark' ? 'text-red-400' : 'text-red-600'
              } mb-4`} />
            )}
            <h3 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>Total Gain/Loss</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center">
                <span className={`text-2xl font-bold ${
                  percentageGain >= 0
                    ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    : theme === 'dark' ? 'text-red-400' : 'text-red-600'
                }`}>
                  {percentageGain >= 0 ? '+' : ''}{percentageGain.toFixed(2)}%
                </span>
                <span className={`ml-2 text-lg ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  (${totalGain.toLocaleString()})
                </span>
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Daily Change: {stocks.reduce((sum, stock) => sum + (stock.current_price - stock.buy_price), 0).toFixed(2)}%
              </div>
            </div>
          </div>
        </motion.div>

        {/* Portfolio Analytics Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`p-6 rounded-2xl relative overflow-hidden ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-[#1f1f1f] to-[#171717] border border-white/10'
              : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
            <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 ${
              theme === 'dark' ? 'bg-purple-500' : 'bg-purple-400'
            }`}></div>
          </div>
          <div className="relative">
            <HiChartPie className={`h-8 w-8 ${
              theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
            } mb-4`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>Portfolio Analytics</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  Holdings
                </span>
                <span className={`font-bold ${
                  theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                }`}>
                  {stocks.length} stocks
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  Top Performer
                </span>
                <span className={`font-bold ${
                  theme === 'dark' ? 'text-green-400' : 'text-green-600'
                }`}>
                  {stocks.reduce((best, stock) => {
                    const gain = ((stock.current_price - stock.buy_price) / stock.buy_price) * 100;
                    return gain > best.gain ? { ticker: stock.ticker, gain } : best;
                  }, { ticker: '', gain: -Infinity }).ticker}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Market Overview Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`p-6 rounded-2xl relative overflow-hidden ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-[#1f1f1f] to-[#171717] border border-white/10'
              : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
            <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 ${
              theme === 'dark' ? 'bg-orange-500' : 'bg-orange-400'
            }`}></div>
          </div>
          <div className="relative">
            <HiClock className={`h-8 w-8 ${
              theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
            } mb-4`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>Market Overview</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  Market Status
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  getMarketStatus().status === 'Open'
                    ? theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                    : getMarketStatus().status === 'Pre-Market'
                    ? theme === 'dark' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                    : theme === 'dark' ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
                }`}>
                  {getMarketStatus().status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  Trading Hours (IST)
                </span>
                <span className={`font-medium ${
                  theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                }`}>
                  7:00 PM - 2:30 AM
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Charts Section */}
      <div className="flex flex-col gap-6 mb-6">
        <motion.div
          variants={itemVariants}
          className={`p-6 rounded-2xl ${
            theme === 'dark'
              ? 'bg-[#1f1f1f] border border-white/10'
              : 'bg-white border border-gray-200'
          }`}
        >
          <h3 className={`text-xl font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>Portfolio Value Over Time</h3>
          <div className="flex justify-between items-center mb-4">
            <TabGroup 
              defaultIndex={1}
              className="mb-4 [&>div]:border-none"
              onIndexChange={(index) => {
                const periods = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];
                setSelectedPeriod(periods[index]);
              }}
            >
              <TabList className={theme === 'dark' ? 'text-white' : ''}>
                <Tab className={`px-3 py-1 text-sm font-medium transition-all ${
                  selectedPeriod === '1D'
                    ? theme === 'dark' 
                      ? 'text-blue-400 font-semibold' 
                      : 'text-blue-600 font-semibold'
                    : theme === 'dark'
                      ? 'text-gray-300 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                }`}>1D</Tab>
                <Tab className={`px-3 py-1 text-sm font-medium transition-all ${
                  selectedPeriod === '1W'
                    ? theme === 'dark' 
                      ? 'text-blue-400 font-semibold' 
                      : 'text-blue-600 font-semibold'
                    : theme === 'dark'
                      ? 'text-gray-300 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                }`}>1W</Tab>
                <Tab className={`px-3 py-1 text-sm font-medium transition-all ${
                  selectedPeriod === '1M'
                    ? theme === 'dark' 
                      ? 'text-blue-400 font-semibold' 
                      : 'text-blue-600 font-semibold'
                    : theme === 'dark'
                      ? 'text-gray-300 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                }`}>1M</Tab>
                <Tab className={`px-3 py-1 text-sm font-medium transition-all ${
                  selectedPeriod === '3M'
                    ? theme === 'dark' 
                      ? 'text-blue-400 font-semibold' 
                      : 'text-blue-600 font-semibold'
                    : theme === 'dark'
                      ? 'text-gray-300 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                }`}>3M</Tab>
                <Tab className={`px-3 py-1 text-sm font-medium transition-all ${
                  selectedPeriod === '1Y'
                    ? theme === 'dark' 
                      ? 'text-blue-400 font-semibold' 
                      : 'text-blue-600 font-semibold'
                    : theme === 'dark'
                      ? 'text-gray-300 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                }`}>1Y</Tab>
                <Tab className={`px-3 py-1 text-sm font-medium transition-all ${
                  selectedPeriod === 'ALL'
                    ? theme === 'dark' 
                      ? 'text-blue-400 font-semibold' 
                      : 'text-blue-600 font-semibold'
                    : theme === 'dark'
                      ? 'text-gray-300 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                }`}>ALL</Tab>
              </TabList>
            </TabGroup>
            <div className={`flex flex-col items-end ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <span className="text-sm font-medium">Net Value</span>
              <span className={`text-2xl font-bold ${
                percentageGain >= 0
                  ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  : theme === 'dark' ? 'text-red-400' : 'text-red-600'
              }`}>
                ${totalValue.toLocaleString()}
              </span>
              <div className="flex items-center gap-1">
                <span className={`text-sm font-medium ${
                  percentageGain >= 0
                    ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    : theme === 'dark' ? 'text-red-400' : 'text-red-600'
                }`}>
                  {percentageGain >= 0 ? '+' : ''}{percentageGain.toFixed(2)}%
                </span>
                <span className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  (${totalGain.toLocaleString()})
                </span>
              </div>
            </div>
          </div>
          <AreaChart
            className={`h-96 mt-4 ${theme === 'dark' ? 'text-white' : ''}`}
            data={chartdata}
            index="date"
            categories={["Portfolio Value"]}
            colors={theme === 'dark' ? ["blue-500"] : ["indigo-500"]}
            showLegend={false}
            showAnimation={true}
            valueFormatter={(number) => `$${number.toLocaleString()}`}
            showGridLines={true}
            startEndOnly={selectedPeriod === '1D'}
            showXAxis={true}
            showYAxis={true}
            yAxisWidth={70}
            curveType="natural"
            connectNulls={true}
            enableLegendSlider={true}
            gridProps={{
              strokeDasharray: "3 3",
              strokeOpacity: theme === 'dark' ? 0.4 : 0.3,
              stroke: theme === 'dark' ? '#374151' : '#E5E7EB'
            }}
            style={{
              marginTop: "1rem",
              ["--tremor-grid-line-vertical"]: theme === 'dark' ? '#374151' : '#E5E7EB',
              ["--tremor-grid-line-horizontal"]: theme === 'dark' ? '#374151' : '#E5E7EB',
              ["--tremor-brand"]: theme === 'dark' ? '#3B82F6' : '#4F46E5',
              ["--tremor-brand-emphasis"]: theme === 'dark' ? '#60A5FA' : '#6366F1',
              ["--tremor-brand-inverted"]: theme === 'dark' ? '#1F2937' : '#F9FAFB',
              ["--tremor-brand-muted"]: theme === 'dark' ? '#1F2937' : '#F3F4F6',
              ["--tremor-background-emphasis"]: theme === 'dark' ? '#374151' : '#F3F4F6'
            }}
            onValueChange={(v) => {
              if (!v) return null;
              // Handle value change if needed
            }}
            showTooltip={true}
            showGradient={true}
            enableCrosshair={true}
            crosshairBehavior="snap"
            customTooltip={({ payload }) => {
              if (!payload[0]) return null;
              const data = payload[0].payload;
              return (
                <div className={`rounded-tremor-default text-tremor-default ${
                  theme === 'dark' 
                    ? 'bg-gray-800 text-white border border-gray-700 shadow-lg'
                    : 'bg-white text-gray-900 border border-gray-200 shadow-lg'
                } p-2`}>
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">{data.date}</p>
                    <p className={`font-semibold ${
                      theme === 'dark' ? 'text-blue-400' : 'text-indigo-600'
                    }`}>
                      ${data["Portfolio Value"].toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            }}
            areaStyle={{
              fill: `url(#${theme === 'dark' ? 'dark-gradient' : 'light-gradient'})`,
            }}
          >
            <defs>
              <linearGradient id="dark-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="light-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(79, 70, 229)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="rgb(79, 70, 229)" stopOpacity="0.05" />
              </linearGradient>
              <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M 8 0 L 0 0 0 8" fill="none" 
                      stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} 
                      strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" opacity="0.1" />
          </AreaChart>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className={`p-6 rounded-2xl ${
            theme === 'dark'
              ? 'bg-[#1f1f1f] border border-white/10'
              : 'bg-white border border-gray-200'
          }`}
        >
          <h3 className={`text-xl font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>Portfolio Allocation</h3>
          <PortfolioAnalytics stocks={stocks} theme={theme} />
        </motion.div>
      </div>

      {/* Stock List */}
      <motion.div
        variants={itemVariants}
        className={`p-6 rounded-2xl ${
          theme === 'dark'
            ? 'bg-[#1f1f1f] border border-white/10'
            : 'bg-white border border-gray-200'
        }`}
      >
        <h3 className={`text-xl font-semibold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>Your Holdings</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <th className={`text-left py-3 px-4 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Stock</th>
                <th className={`text-left py-3 px-4 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Current Price</th>
                <th className={`text-left py-3 px-4 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Holdings</th>
                <th className={`text-left py-3 px-4 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Value</th>
                <th className={`text-left py-3 px-4 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Gain/Loss</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => {
                const value = stock.current_price * stock.shares;
                const gain = ((stock.current_price - stock.buy_price) / stock.buy_price) * 100;
                
                return (
                  <tr 
                    key={stock.id}
                    onClick={() => setSelectedStock(stock)}
                    className={`border-b cursor-pointer transition-colors ${
                      theme === 'dark' 
                        ? 'border-gray-700 hover:bg-white/5' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div>
                        <div className={`font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>{stock.name}</div>
                        <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                          {stock.ticker}
                        </div>
                      </div>
                    </td>
                    <td className={`py-3 px-4 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      ${stock.current_price.toLocaleString()}
                    </td>
                    <td className={`py-3 px-4 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {stock.shares.toLocaleString()} shares
                    </td>
                    <td className={`py-3 px-4 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      ${value.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        gain >= 0
                          ? theme === 'dark'
                            ? 'bg-green-900/30 text-green-400'
                            : 'bg-green-100 text-green-800'
                          : theme === 'dark'
                            ? 'bg-red-900/30 text-red-400'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {gain >= 0 ? '+' : ''}{gain.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Stock Detail Modal */}
      {selectedStock && (
        <StockDetail
          stock={selectedStock}
          onClose={() => setSelectedStock(null)}
          theme={theme}
        />
      )}
    </motion.div>
  );
} 