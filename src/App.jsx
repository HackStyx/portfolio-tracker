import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Homepage from './pages/Homepage';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Watchlist from './pages/Watchlist';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import StockDetail from './pages/StockDetail';
import News from './pages/News';
import MarketCalendar from './pages/MarketCalendar';

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const handleThemeChange = (e) => {
      const newTheme = e.detail.theme || e.detail || localStorage.getItem('theme') || 'light';
      console.log('App: Theme change detected:', newTheme);
      setTheme(newTheme);
      
      // Dispatch a global event for all components
      window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: newTheme } }));
    };

    // Listen to both custom events and storage changes
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

  useEffect(() => {
    // Update document class when theme changes
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Homepage />} />
          
          {/* Protected dashboard routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout theme={theme}>
                <Dashboard theme={theme} />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/portfolio" element={
            <ProtectedRoute>
              <DashboardLayout theme={theme}>
                <Portfolio theme={theme} />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/watchlist" element={
            <ProtectedRoute>
              <DashboardLayout theme={theme}>
                <Watchlist theme={theme} />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <DashboardLayout theme={theme}>
                <Profile theme={theme} />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <DashboardLayout theme={theme}>
                <Settings theme={theme} />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/stock/:id" element={
            <ProtectedRoute>
              <DashboardLayout theme={theme}>
                <StockDetail theme={theme} />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/news" element={
            <ProtectedRoute>
              <DashboardLayout theme={theme}>
                <News theme={theme} />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/calendar" element={
            <ProtectedRoute>
              <DashboardLayout theme={theme}>
                <MarketCalendar theme={theme} />
              </DashboardLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
