import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  HiHome, 
  HiChartBar, 
  HiStar,
  HiNewspaper,
  HiCalendar,
  HiChevronLeft,
  HiChevronRight,
  HiSun,
  HiMoon,
  HiLogout
} from 'react-icons/hi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

// Loading overlay component
const LoadingOverlay = ({ message }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-700 dark:text-gray-300">{message}</p>
    </div>
  </div>
);

export default function Sidebar({ theme }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const navItems = [
    { path: '/dashboard', icon: HiHome, label: 'Dashboard' },
    { path: '/portfolio', icon: HiChartBar, label: 'Portfolio' },
    { path: '/watchlist', icon: HiStar, label: 'Watchlist' },
    { path: '/news', icon: HiNewspaper, label: 'News' },
    { path: '/calendar', icon: HiCalendar, label: 'Calendar' }
  ];



  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        setIsLoading(true);
        setLoadingMessage('Logging out...');
        
        const { error } = await signOut();
        if (error) {
          throw error;
        }
        
        // Navigate to homepage
        navigate('/');
      } catch (error) {
        console.error('Error during logout:', error);
        setLoadingMessage('Error occurred. Please try again.');
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsLoading(false);
        alert('Failed to logout. Please try again.');
      }
    }
  };

  const toggleTheme = () => {
    const newTheme = localStorage.getItem('theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    document.dispatchEvent(new CustomEvent('themeChanged', { detail: newTheme }));
  };

  return (
    <>
      {isLoading && <LoadingOverlay message={loadingMessage} />}
      <motion.div
        animate={{ width: isExpanded ? "240px" : "80px" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`relative min-h-screen border-r ${
          theme === 'dark' 
            ? 'bg-[#171717] border-white/10' 
            : 'bg-white border-gray-200'
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`absolute -right-3 top-8 p-1.5 rounded-full ${
            theme === 'dark' 
              ? 'bg-[#171717] text-white border border-white/10' 
              : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          {isExpanded ? (
            <HiChevronLeft className="w-4 h-4" />
          ) : (
            <HiChevronRight className="w-4 h-4" />
          )}
        </button>

        <div className="flex flex-col h-full p-4">
          {/* Logo Section */}
          <div className="flex items-center h-16 mb-8">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              theme === 'dark' ? 'bg-blue-600' : 'bg-blue-600'
            }`}>
              <HiChartBar className="h-6 w-6 text-white" />
            </div>
            <motion.div
              animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="ml-3 overflow-hidden"
            >
              {isExpanded && (
                <span className={`text-xl font-bold whitespace-nowrap ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  Stock Tracker
                </span>
              )}
            </motion.div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-2">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center h-12 px-3 rounded-lg transition-colors ${
                  location.pathname === path
                    ? theme === 'dark'
                      ? 'bg-white/10 text-white'
                      : 'bg-blue-600 text-white'
                    : theme === 'dark'
                    ? 'text-gray-400 hover:bg-white/5 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
                }`}
              >
                <div className="w-6 flex items-center justify-center">
                  <Icon className={`text-xl ${
                    location.pathname === path && theme !== 'dark'
                      ? 'text-white'
                      : ''
                  }`} />
                </div>
                <motion.span
                  animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="ml-3 whitespace-nowrap overflow-hidden"
                >
                  {isExpanded && label}
                </motion.span>
              </Link>
            ))}
          </nav>

          {/* Bottom Section with Theme Toggle and Logout */}
          <div className="pt-4 space-y-2">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`flex items-center w-full h-12 px-3 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'text-gray-400 hover:bg-white/5 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
              }`}
            >
              <div className="w-6 flex items-center justify-center">
                {theme === 'dark' ? (
                  <HiSun className="text-xl" />
                ) : (
                  <HiMoon className="text-xl" />
                )}
              </div>
              <motion.span
                animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="ml-3 whitespace-nowrap overflow-hidden"
              >
                {isExpanded && (theme === 'dark' ? 'Light Mode' : 'Dark Mode')}
              </motion.span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={`flex items-center w-full h-12 px-3 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'text-red-400 hover:bg-white/5 hover:text-red-300'
                  : 'text-red-600 hover:bg-gray-100 hover:text-red-700'
              }`}
            >
              <div className="w-6 flex items-center justify-center">
                <HiLogout className="text-xl" />
              </div>
              <motion.span
                animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="ml-3 whitespace-nowrap overflow-hidden"
              >
                {isExpanded && 'Logout'}
              </motion.span>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
} 