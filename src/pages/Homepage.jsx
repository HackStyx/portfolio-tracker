import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineEye, HiOutlineEyeOff, HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlineChartBar, HiOutlineTrendingUp, HiOutlineBell, HiOutlineShieldCheck } from 'react-icons/hi';

const Homepage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [isStatusTooltipOpen, setIsStatusTooltipOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    overall: 'operational',
    api: 'operational',
    database: 'operational',
    lastChecked: new Date().toLocaleTimeString()
  });
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();

  // Initialize theme and redirect if user is already logged in
  useEffect(() => {
    // Initialize theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    
    // Redirect to dashboard if user is already logged in
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Close status tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isStatusTooltipOpen && !event.target.closest('.status-tooltip-container')) {
        setIsStatusTooltipOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStatusTooltipOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        // Sign in
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Successfully signed in!');
          navigate('/dashboard');
        }
      } else {
        // Sign up
        const { error } = await signUp(formData.email, formData.password, formData.name);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Account created successfully! Please check your email to verify your account.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    
    // Dispatch custom event for theme change
    window.dispatchEvent(new CustomEvent('themeChange', { 
      detail: { theme: newTheme } 
    }));
  };

  // Blog data
  const blogPosts = [
    {
      id: 1,
      title: "Building a Diversified Portfolio in 2024",
      category: "Investment Strategy",
      date: "Jan 15, 2024",
      author: "Sarah Johnson",
      readTime: "8 min read",
      image: "from-blue-400 to-purple-500",
      content: `
        <div class="space-y-6">
          <p class="text-lg leading-relaxed">
            In today's rapidly evolving financial landscape, building a diversified portfolio has never been more crucial. The traditional 60/40 stock-bond split that worked for decades is being challenged by new market dynamics, technological disruption, and changing economic policies.
          </p>
          
          <h3 class="text-2xl font-bold mt-8 mb-4">Understanding Modern Diversification</h3>
          <p class="leading-relaxed">
            Modern portfolio diversification goes beyond simply mixing stocks and bonds. It involves understanding correlation, risk factors, and the impact of global events on different asset classes. A truly diversified portfolio should include:
          </p>
          
          <ul class="list-disc list-inside space-y-2 ml-4">
            <li>Domestic and international equities</li>
            <li>Government and corporate bonds</li>
            <li>Real estate investment trusts (REITs)</li>
            <li>Commodities and precious metals</li>
            <li>Alternative investments (private equity, hedge funds)</li>
            <li>Cryptocurrencies (with proper risk management)</li>
          </ul>
          
          <h3 class="text-2xl font-bold mt-8 mb-4">The Role of Technology in Portfolio Management</h3>
          <p class="leading-relaxed">
            Technology has revolutionized how we approach portfolio diversification. AI-powered tools can now analyze thousands of data points to identify optimal asset allocations, while robo-advisors provide sophisticated portfolio management at a fraction of traditional costs.
          </p>
          
          <p class="leading-relaxed">
            However, it's important to remember that technology should enhance, not replace, fundamental investment principles. The core tenets of diversification—spreading risk across uncorrelated assets—remain unchanged.
          </p>
          
          <h3 class="text-2xl font-bold mt-8 mb-4">Risk Management in 2024</h3>
          <p class="leading-relaxed">
            With increased market volatility and geopolitical uncertainty, risk management has become paramount. Consider implementing:
          </p>
          
          <ul class="list-disc list-inside space-y-2 ml-4">
            <li>Regular portfolio rebalancing (quarterly or annually)</li>
            <li>Stress testing your portfolio against various scenarios</li>
            <li>Maintaining adequate cash reserves for opportunities</li>
            <li>Using stop-loss orders for individual positions</li>
          </ul>
          
          <p class="leading-relaxed">
            Remember, diversification is not about eliminating risk—it's about managing it intelligently while positioning your portfolio for long-term growth.
          </p>
        </div>
      `
    },
    {
      id: 2,
      title: "Understanding Market Volatility",
      category: "Market Analysis",
      date: "Jan 12, 2024",
      author: "Michael Chen",
      readTime: "6 min read",
      image: "from-green-400 to-blue-500",
      content: `
        <div class="space-y-6">
          <p class="text-lg leading-relaxed">
            Market volatility is often misunderstood and feared by investors. However, understanding volatility is crucial for making informed investment decisions and maintaining a long-term perspective during turbulent times.
          </p>
          
          <h3 class="text-2xl font-bold mt-8 mb-4">What is Volatility?</h3>
          <p class="leading-relaxed">
            Volatility measures the rate at which the price of a security or market index increases or decreases for a given set of returns. It's essentially a measure of risk and uncertainty in the market. Higher volatility means larger price swings, while lower volatility indicates more stable prices.
          </p>
          
          <h3 class="text-2xl font-bold mt-8 mb-4">Types of Volatility</h3>
          <p class="leading-relaxed">
            There are several types of volatility that investors should understand:
          </p>
          
          <ul class="list-disc list-inside space-y-2 ml-4">
            <li><strong>Historical Volatility:</strong> Based on past price movements</li>
            <li><strong>Implied Volatility:</strong> Market's expectation of future volatility</li>
            <li><strong>Realized Volatility:</strong> Actual volatility experienced over a period</li>
          </ul>
          
          <h3 class="text-2xl font-bold mt-8 mb-4">Causes of Market Volatility</h3>
          <p class="leading-relaxed">
            Market volatility can be caused by various factors:
          </p>
          
          <ul class="list-disc list-inside space-y-2 ml-4">
            <li>Economic data releases and policy changes</li>
            <li>Geopolitical events and conflicts</li>
            <li>Corporate earnings announcements</li>
            <li>Changes in interest rates and monetary policy</li>
            <li>Technological disruptions and innovations</li>
            <li>Natural disasters and global health crises</li>
          </ul>
          
          <h3 class="text-2xl font-bold mt-8 mb-4">Strategies for Volatile Markets</h3>
          <p class="leading-relaxed">
            During volatile periods, consider these strategies:
          </p>
          
          <ul class="list-disc list-inside space-y-2 ml-4">
            <li>Maintain a long-term perspective</li>
            <li>Dollar-cost averaging into positions</li>
            <li>Focus on quality companies with strong fundamentals</li>
            <li>Consider defensive sectors and dividend-paying stocks</li>
            <li>Keep adequate cash reserves for opportunities</li>
          </ul>
          
          <p class="leading-relaxed">
            Remember, volatility creates opportunities for disciplined investors. The key is to stay calm, stick to your investment plan, and use volatility to your advantage rather than letting it drive emotional decisions.
          </p>
        </div>
      `
    },
    {
      id: 3,
      title: "AI in Investment Management",
      category: "Technology",
      date: "Jan 10, 2024",
      author: "Dr. Emily Rodriguez",
      readTime: "10 min read",
      image: "from-purple-400 to-pink-500",
      content: `
        <div class="space-y-6">
          <p class="text-lg leading-relaxed">
            Artificial Intelligence is revolutionizing the investment management industry, from algorithmic trading to portfolio optimization and risk assessment. As we move further into 2024, AI technologies are becoming increasingly sophisticated and accessible to both institutional and individual investors.
          </p>
          
          <h3 class="text-2xl font-bold mt-8 mb-4">The Evolution of AI in Finance</h3>
          <p class="leading-relaxed">
            The integration of AI in investment management has evolved significantly over the past decade. What started with simple rule-based algorithms has now progressed to sophisticated machine learning models that can process vast amounts of data and identify patterns invisible to human analysts.
          </p>
          
          <h3 class="text-2xl font-bold mt-8 mb-4">Key Applications of AI in Investment Management</h3>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">1. Algorithmic Trading</h4>
          <p class="leading-relaxed">
            AI-powered trading algorithms can execute trades at optimal times based on market conditions, news sentiment, and technical indicators. These systems can process information in milliseconds and make decisions faster than any human trader.
          </p>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">2. Portfolio Optimization</h4>
          <p class="leading-relaxed">
            Machine learning algorithms can analyze historical data, market conditions, and individual preferences to create optimized portfolio allocations that maximize returns while minimizing risk.
          </p>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">3. Risk Assessment</h4>
          <p class="leading-relaxed">
            AI models can identify potential risks by analyzing market data, news sentiment, and economic indicators. This helps investors make more informed decisions about their investments.
          </p>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">4. Sentiment Analysis</h4>
          <p class="leading-relaxed">
            Natural language processing (NLP) algorithms can analyze news articles, social media posts, and earnings calls to gauge market sentiment and predict potential market movements.
          </p>
          
          <h3 class="text-2xl font-bold mt-8 mb-4">Benefits and Challenges</h3>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Benefits:</h4>
          <ul class="list-disc list-inside space-y-2 ml-4">
            <li>Improved decision-making through data-driven insights</li>
            <li>Reduced emotional bias in trading decisions</li>
            <li>24/7 market monitoring and analysis</li>
            <li>Cost-effective portfolio management</li>
            <li>Access to sophisticated strategies previously available only to institutions</li>
          </ul>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Challenges:</h4>
          <ul class="list-disc list-inside space-y-2 ml-4">
            <li>Over-reliance on historical data</li>
            <li>Potential for algorithmic bias</li>
            <li>Regulatory and ethical considerations</li>
            <li>Need for human oversight and interpretation</li>
          </ul>
          
          <h3 class="text-2xl font-bold mt-8 mb-4">The Future of AI in Investment Management</h3>
          <p class="leading-relaxed">
            As AI technology continues to advance, we can expect to see even more sophisticated applications in investment management. The key will be finding the right balance between automation and human judgment, ensuring that AI enhances rather than replaces human decision-making.
          </p>
          
          <p class="leading-relaxed">
            For individual investors, the democratization of AI-powered investment tools means access to strategies and insights that were once the exclusive domain of large financial institutions.
          </p>
        </div>
      `
    }
  ];

  const openBlogModal = (blog) => {
    setSelectedBlog(blog);
    setIsBlogModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeBlogModal = () => {
    setIsBlogModalOpen(false);
    setSelectedBlog(null);
    document.body.style.overflow = 'unset';
  };

  const toggleStatusTooltip = () => {
    setIsStatusTooltipOpen(!isStatusTooltipOpen);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
        return 'text-green-500';
      case 'degraded':
        return 'text-yellow-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational':
        return (
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'degraded':
        return (
          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
      {/* Clean Modern Navigation */}
      <nav className={`sticky top-0 z-50 backdrop-blur-sm transition-all duration-300 ${
        theme === 'dark' 
          ? 'bg-black shadow-lg shadow-black/10' 
          : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo Section */}
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                theme === 'dark' 
                  ? 'bg-gray-800 group-hover:bg-gray-700' 
                  : 'bg-gray-100 group-hover:bg-gray-200'
              }`}>
                <HiOutlineChartBar className={`w-5 h-5 transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'text-blue-400 group-hover:text-blue-300' 
                    : 'text-blue-600 group-hover:text-blue-500'
                }`} />
              </div>
              <span className={`text-xl font-bold transition-colors duration-200 ${
                theme === 'dark' 
                  ? 'text-white group-hover:text-blue-300' 
                  : 'text-gray-900 group-hover:text-blue-600'
              }`}>
                PortfolioTracker
              </span>
            </div>

            {/* Navigation Links - Center */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className={`text-sm font-medium transition-colors duration-200 ${
                theme === 'dark' 
                  ? 'text-gray-300 hover:text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}>
                Home
              </a>
              <div className="relative group">
                <a href="#features" className={`text-sm font-medium transition-colors duration-200 flex items-center space-x-1 ${
                  theme === 'dark' 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}>
                  <span>Features</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
              </div>
              <div className="relative group">
                <a href="#resources" className={`text-sm font-medium transition-colors duration-200 flex items-center space-x-1 ${
                  theme === 'dark' 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}>
                  <span>Resources</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
              </div>
              <a href="#pricing" className={`text-sm font-medium transition-colors duration-200 ${
                theme === 'dark' 
                  ? 'text-gray-300 hover:text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}>
                Pricing
              </a>
              <a href="#blog" className={`text-sm font-medium transition-colors duration-200 ${
                theme === 'dark' 
                  ? 'text-gray-300 hover:text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}>
                Blog
              </a>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Cool Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`relative p-2 rounded-xl transition-all duration-300 group overflow-hidden ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-800/50' 
                    : 'hover:bg-gray-100/50'
                }`}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {/* Background gradient effect */}
                <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 opacity-0 group-hover:opacity-100'
                    : 'bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-indigo-400/20 opacity-0 group-hover:opacity-100'
                }`}></div>
                
                {/* Icon container */}
                <div className="relative flex items-center justify-center">
                  {/* Sun icon for dark mode */}
                  <svg 
                    className={`w-5 h-5 transition-all duration-300 ${
                      theme === 'dark' 
                        ? 'text-yellow-400 rotate-0 scale-100' 
                        : 'text-gray-400 -rotate-90 scale-0'
                    }`}
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
                  </svg>
                  
                  {/* Moon icon for light mode */}
                  <svg 
                    className={`w-5 h-5 transition-all duration-300 absolute ${
                      theme === 'dark' 
                        ? 'text-gray-400 rotate-90 scale-0' 
                        : 'text-gray-600 rotate-0 scale-100'
                    }`}
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"/>
                  </svg>
                </div>
                
                {/* Ripple effect */}
                <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-yellow-400/10 scale-0 group-hover:scale-100'
                    : 'bg-blue-400/10 scale-0 group-hover:scale-100'
                }`}></div>
              </button>

              {/* Login Button */}
              <button 
                onClick={() => setIsLogin(true)}
                className={`hidden md:block px-4 py-2 rounded-lg font-medium transition-all duration-200 border hover:scale-105 ${
                  theme === 'dark'
                    ? 'bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                Log in
              </button>

              {/* Sign Up Button */}
              <button 
                onClick={() => setIsLogin(false)}
                className={`hidden md:block px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
                  theme === 'dark'
                    ? 'bg-white text-gray-900 hover:bg-gray-100'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                Sign up
              </button>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`md:hidden p-2 rounded-lg transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-800 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className={`px-6 py-4 space-y-4 border-t ${
            theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
          }`}>
            <a href="#home" className={`block text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Home
            </a>
            <a href="#features" className={`block text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Features
            </a>
            <a href="#resources" className={`block text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Resources
            </a>
            <a href="#pricing" className={`block text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Pricing
            </a>
            <a href="#blog" className={`block text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Blog
            </a>
                        <div className="pt-4 space-y-3">
              <button 
                onClick={() => setIsLogin(true)}
                className={`w-full px-4 py-2 rounded-lg font-medium border transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Log in
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-white text-gray-900 hover:bg-gray-100'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h1 className={`text-5xl lg:text-6xl font-bold leading-tight ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Track Your
                  <span className={`block ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                    Portfolio
                  </span>
                  Like a Pro
                </h1>
                <p className={`text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Monitor your investments, track performance, and make informed decisions with our comprehensive portfolio tracking platform.
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`flex items-center space-x-3 p-4 rounded-xl ${
                  theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'
                } shadow-sm`}>
                  <HiOutlineTrendingUp className={`w-6 h-6 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                  <div>
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Real-time Tracking
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Live stock prices and updates
                    </p>
                  </div>
                </div>

                <div className={`flex items-center space-x-3 p-4 rounded-xl ${
                  theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'
                } shadow-sm`}>
                  <HiOutlineBell className={`w-6 h-6 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`} />
                  <div>
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Smart Alerts
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Price alerts and notifications
                    </p>
                  </div>
                </div>

                <div className={`flex items-center space-x-3 p-4 rounded-xl ${
                  theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'
                } shadow-sm`}>
                  <HiOutlineChartBar className={`w-6 h-6 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                  <div>
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Analytics
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Detailed performance insights
                    </p>
                  </div>
                </div>

                <div className={`flex items-center space-x-3 p-4 rounded-xl ${
                  theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'
                } shadow-sm`}>
                  <HiOutlineShieldCheck className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                  <div>
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Secure
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Your data is protected
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Auth Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`p-8 rounded-2xl shadow-xl ${
                theme === 'dark' ? 'bg-[#1f1f1f] border border-gray-800' : 'bg-white border border-gray-200'
              }`}
            >
            <div className="text-center mb-8">
              <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {isLogin ? 'Sign in to your account' : 'Start tracking your portfolio today'}
              </p>
            </div>

            {/* Toggle Buttons */}
            <div className={`flex rounded-xl p-1 mb-6 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                  isLogin
                    ? 'bg-blue-600 text-white shadow-sm'
                    : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                  !isLogin
                    ? 'bg-blue-600 text-white shadow-sm'
                    : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div className={`p-4 rounded-xl border ${
                theme === 'dark'
                  ? 'bg-red-900/20 border-red-800 text-red-400'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {error}
              </div>
            )}
            
            {success && (
              <div className={`p-4 rounded-xl border ${
                theme === 'dark'
                  ? 'bg-green-900/20 border-green-800 text-green-400'
                  : 'bg-green-50 border-green-200 text-green-700'
              }`}>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Full Name
                  </label>
                  <div className="relative">
                    <HiOutlineUser className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
                      }`}
                      placeholder="Enter your full name"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Address
                </label>
                <div className="relative">
                  <HiOutlineMail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Password
                </label>
                <div className="relative">
                  <HiOutlineLockClosed className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-12 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded ${
                      theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                    }`}
                  >
                    {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className={`rounded border-2 ${
                        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                      } text-blue-600 focus:ring-blue-500`}
                    />
                    <span className={`ml-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Remember me
                    </span>
                  </label>
                  <button
                    type="button"
                    className={`text-sm ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl ${
                  isLoading
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {isLogin ? 'Signing In...' : 'Creating Account...'}
                  </div>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            <div className={`mt-6 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className={`font-semibold ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>

      {/* Features Section */}
      <section id="features" className={`py-20 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Powerful Features
            </h2>
            <p className={`text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Everything you need to manage your portfolio effectively
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
              }`}>
                <HiOutlineTrendingUp className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Real-time Tracking
              </h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Get live stock prices, real-time updates, and instant notifications for your portfolio.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
              }`}>
                <HiOutlineChartBar className={`w-6 h-6 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Advanced Analytics
              </h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Detailed performance insights, portfolio analysis, and investment recommendations.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'
              }`}>
                <HiOutlineBell className={`w-6 h-6 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Smart Alerts
              </h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Custom price alerts, news notifications, and portfolio milestone tracking.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                theme === 'dark' ? 'bg-yellow-500/20' : 'bg-yellow-100'
              }`}>
                <HiOutlineShieldCheck className={`w-6 h-6 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Secure & Private
              </h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Bank-level security, data encryption, and complete privacy protection.
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'
              }`}>
                <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Portfolio Insights
              </h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Comprehensive portfolio analysis, risk assessment, and performance metrics.
              </p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                theme === 'dark' ? 'bg-indigo-500/20' : 'bg-indigo-100'
              }`}>
                <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Stock News
              </h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Stay updated with the latest stock news, market updates, and financial insights.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section id="resources" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Resources & Learning
            </h2>
            <p className={`text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Learn, grow, and make better investment decisions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Resource 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
              }`}>
                <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Investment Guide
              </h3>
              <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Comprehensive guide to building and managing your investment portfolio.
              </p>
              <button className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}>
                Read More →
              </button>
            </motion.div>

            {/* Resource 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
              }`}>
                <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Video Tutorials
              </h3>
              <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Step-by-step video tutorials to help you master portfolio management.
              </p>
              <button className={`text-sm font-medium ${theme === 'dark' ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-500'}`}>
                Watch Now →
              </button>
            </motion.div>

            {/* Resource 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'
              }`}>
                <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                FAQ & Support
              </h3>
              <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Find answers to common questions and get expert support when needed.
              </p>
              <button className={`text-sm font-medium ${theme === 'dark' ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500'}`}>
                Get Help →
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className={`py-20 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Simple, Transparent Pricing
            </h2>
            <p className={`text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Choose the plan that fits your investment needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={`p-8 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Free
              </h3>
              <p className={`text-4xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                $0
                <span className={`text-lg font-normal ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  /month
                </span>
              </p>
              <ul className={`space-y-3 mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Up to 10 stocks
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Basic analytics
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Price alerts
                </li>
              </ul>
              <button className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}>
                Get Started
              </button>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`p-8 rounded-xl relative ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-600'} shadow-lg border-2 border-blue-500`}
            >
              <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-medium ${
                theme === 'dark' ? 'bg-yellow-400 text-gray-900' : 'bg-yellow-400 text-gray-900'
              }`}>
                Most Popular
              </div>
              <h3 className={`text-2xl font-bold mb-2 text-white`}>
                Pro
              </h3>
              <p className={`text-4xl font-bold mb-6 text-white`}>
                $9
                <span className={`text-lg font-normal text-blue-200`}>
                  /month
                </span>
              </p>
              <ul className={`space-y-3 mb-8 text-blue-100`}>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-white mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Unlimited stocks
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-white mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Advanced analytics
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-white mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Smart alerts
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-white mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Portfolio insights
                </li>
              </ul>
              <button className={`w-full py-3 px-4 rounded-lg font-medium bg-white text-blue-600 hover:bg-gray-100 transition-colors`}>
                Start Free Trial
              </button>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`p-8 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Enterprise
              </h3>
              <p className={`text-4xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                $29
                <span className={`text-lg font-normal ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  /month
                </span>
              </p>
              <ul className={`space-y-3 mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Everything in Pro
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Team collaboration
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Priority support
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Custom integrations
                </li>
              </ul>
              <button className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}>
                Contact Sales
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Latest Insights
            </h2>
            <p className={`text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Stay updated with the latest investment trends and strategies
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((blog, index) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                } cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                onClick={() => openBlogModal(blog)}
              >
                <div className={`h-48 bg-gradient-to-br ${blog.image}`}></div>
                <div className="p-6">
                  <div className={`text-sm font-medium mb-2 ${
                    blog.category === 'Investment Strategy' ? (theme === 'dark' ? 'text-blue-400' : 'text-blue-600') :
                    blog.category === 'Market Analysis' ? (theme === 'dark' ? 'text-green-400' : 'text-green-600') :
                    (theme === 'dark' ? 'text-purple-400' : 'text-purple-600')
                  }`}>
                    {blog.category}
                  </div>
                  <h3 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {blog.title}
                  </h3>
                  <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {blog.category === 'Investment Strategy' ? 'Learn the key principles of portfolio diversification and how to apply them in today\'s market.' :
                     blog.category === 'Market Analysis' ? 'A comprehensive guide to navigating market volatility and protecting your investments.' :
                     'How artificial intelligence is revolutionizing portfolio management and investment decisions.'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {blog.date}
                    </span>
                    <button className={`text-sm font-medium ${
                      blog.category === 'Investment Strategy' ? (theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500') :
                      blog.category === 'Market Analysis' ? (theme === 'dark' ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-500') :
                      (theme === 'dark' ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500')
                    }`}>
                      Read More →
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-16 ${theme === 'dark' ? 'bg-black border-t border-gray-800' : 'bg-gray-50 border-t border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                  <HiOutlineChartBar className={`w-5 h-5 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                </div>
                <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  PortfolioTracker
                </span>
              </div>
              <p className={`mb-6 max-w-md ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                The ultimate platform for tracking your investments, analyzing performance, and making informed financial decisions.
              </p>
              <div className="flex space-x-4">
                <a href="https://twitter.com/Hackstyx" target="_blank" rel="noopener noreferrer" className={`p-2 rounded-lg transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                }`}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="https://github.com/Hackstyx" target="_blank" rel="noopener noreferrer" className={`p-2 rounded-lg transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                }`}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a href="https://linkedin.com/in/princekumargupta" target="_blank" rel="noopener noreferrer" className={`p-2 rounded-lg transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                }`}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Product
              </h3>
              <ul className={`space-y-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <li><a href="#features" className="hover:text-blue-500 transition-colors duration-200">Features</a></li>
                <li><a href="#pricing" className="hover:text-blue-500 transition-colors duration-200">Pricing</a></li>
                <li><a href="#resources" className="hover:text-blue-500 transition-colors duration-200">Resources</a></li>
                <li><a href="#blog" className="hover:text-blue-500 transition-colors duration-200">Blog</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Support
              </h3>
              <ul className={`space-y-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <li><a href="#" className="hover:text-blue-500 transition-colors duration-200">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors duration-200">Contact Us</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors duration-200">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors duration-200">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className={`mt-12 pt-8 border-t ${
            theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
          }`}>
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                © 2024 PortfolioTracker. All rights reserved.
              </p>
              <div className="flex items-center space-x-6">
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    theme === 'dark' 
                      ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {theme === 'dark' ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"/>
                    </svg>
                  )}
                </button>
                <div className="relative status-tooltip-container">
                  <button
                    onClick={toggleStatusTooltip}
                    className={`text-sm ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-200`}
                  >
                    Status
                  </button>
                  
                  {/* Status Tooltip */}
                  {isStatusTooltipOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute bottom-full right-0 mb-2 w-80 p-4 rounded-xl shadow-2xl border ${
                        theme === 'dark' 
                          ? 'bg-gray-800 border-gray-700' 
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      {/* Arrow */}
                      <div className={`absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
                        theme === 'dark' ? 'border-t-gray-800' : 'border-t-white'
                      }`}></div>
                      
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          System Status
                        </h4>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(systemStatus.overall)}
                          <span className={`text-sm font-medium capitalize ${getStatusColor(systemStatus.overall)}`}>
                            {systemStatus.overall}
                          </span>
                        </div>
                      </div>
                      
                      {/* Status Items */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            API
                          </span>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(systemStatus.api)}
                            <span className={`text-sm font-medium capitalize ${getStatusColor(systemStatus.api)}`}>
                              {systemStatus.api}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            Database
                          </span>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(systemStatus.database)}
                            <span className={`text-sm font-medium capitalize ${getStatusColor(systemStatus.database)}`}>
                              {systemStatus.database}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Footer */}
                      <div className={`mt-4 pt-3 border-t ${
                        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Last checked: {systemStatus.lastChecked}
                          </span>
                          <button
                            onClick={() => {
                              setSystemStatus({
                                ...systemStatus,
                                lastChecked: new Date().toLocaleTimeString()
                              });
                            }}
                            className={`text-xs font-medium ${
                              theme === 'dark' 
                                ? 'text-blue-400 hover:text-blue-300' 
                                : 'text-blue-600 hover:text-blue-500'
                            } transition-colors duration-200`}
                          >
                            Refresh
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
                <a href="#" className={`text-sm ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-200`}>
                  Security
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Blog Modal */}
      {isBlogModalOpen && selectedBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeBlogModal}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl ${
              theme === 'dark' ? 'bg-gray-900' : 'bg-white'
            }`}
          >
            {/* Header */}
            <div className={`relative h-64 bg-gradient-to-br ${selectedBlog.image}`}>
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute inset-0 flex items-end p-8">
                <div className="w-full">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${
                    selectedBlog.category === 'Investment Strategy' ? 'bg-blue-500/20 text-blue-300' :
                    selectedBlog.category === 'Market Analysis' ? 'bg-green-500/20 text-green-300' :
                    'bg-purple-500/20 text-purple-300'
                  }`}>
                    {selectedBlog.category}
                  </div>
                  <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-white'}`}>
                    {selectedBlog.title}
                  </h1>
                  <div className={`flex items-center space-x-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-200'}`}>
                    <span>By {selectedBlog.author}</span>
                    <span>•</span>
                    <span>{selectedBlog.date}</span>
                    <span>•</span>
                    <span>{selectedBlog.readTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={closeBlogModal}
              className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 ${
                theme === 'dark' 
                  ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-16rem)]">
              <div 
                className={`prose prose-lg max-w-none ${
                  theme === 'dark' 
                    ? 'prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-li:text-gray-300' 
                    : 'prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-li:text-gray-700'
                }`}
                dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
              />
              
              {/* Author Bio */}
              <div className={`mt-12 p-6 rounded-xl ${
                theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
              }`}>
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <span className={`text-lg font-semibold ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {selectedBlog.author.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedBlog.author}
                    </h4>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Investment Expert & Financial Analyst
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={closeBlogModal}
                  className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-gray-800 text-white hover:bg-gray-700'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
                >
                  Close Article
                </button>
                <button className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  selectedBlog.category === 'Investment Strategy' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                  selectedBlog.category === 'Market Analysis' ? 'bg-green-600 text-white hover:bg-green-700' :
                  'bg-purple-600 text-white hover:bg-purple-700'
                }`}>
                  Share Article
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Homepage; 