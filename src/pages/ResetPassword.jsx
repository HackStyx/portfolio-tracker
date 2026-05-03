import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineChartBar } from 'react-icons/hi';

const ResetPassword = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [step, setStep] = useState('loading'); // loading | form | success | error
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [sessionError, setSessionError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  useEffect(() => {
    // Supabase processes the #access_token fragment from the reset email link
    // and fires PASSWORD_RECOVERY via onAuthStateChange.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStep('form');
      } else if (event === 'SIGNED_IN' && step === 'loading') {
        // User might already have a session — still show form
        setStep('form');
      }
    });

    // Give Supabase a moment to process the URL hash (it may fire before listener is attached)
    const timer = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setStep('form');
      } else if (step === 'loading') {
        setSessionError('This reset link is invalid or has expired. Please request a new one.');
        setStep('error');
      }
    }, 800);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const map = [
      { label: 'Too short', color: 'bg-red-500' },
      { label: 'Weak', color: 'bg-red-400' },
      { label: 'Fair', color: 'bg-yellow-400' },
      { label: 'Good', color: 'bg-blue-400' },
      { label: 'Strong', color: 'bg-emerald-500' },
    ];
    return { score, ...map[score] };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setFormError(error.message || 'Failed to update password. Please try again.');
      } else {
        // Sign out after password update so user logs in fresh
        await supabase.auth.signOut();
        setStep('success');
      }
    } catch {
      setFormError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-4 py-12 ${
      isDark ? 'bg-black' : 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30'
    }`}>
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-2.5 mb-8 cursor-pointer"
        onClick={() => navigate('/')}
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
          isDark ? 'bg-gray-800' : 'bg-blue-100'
        }`}>
          <HiOutlineChartBar className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
        </div>
        <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          PortfolioTracker
        </span>
      </motion.div>

      {/* ── Loading ── */}
      {step === 'loading' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-14 h-14 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Verifying reset link…
          </p>
        </motion.div>
      )}

      {/* ── Invalid link error ── */}
      {step === 'error' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden ${
            isDark ? 'bg-[#111827] border border-gray-700/60' : 'bg-white border border-gray-200'
          }`}
        >
          <div className="h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-red-400" />
          <div className="px-8 py-10 text-center">
            <div className="flex justify-center mb-6">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
                isDark ? 'bg-red-900/25 border border-red-700/40' : 'bg-red-50 border border-red-100'
              }`}>
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Link Expired or Invalid
            </h2>
            <p className={`text-sm mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {sessionError}
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-[1.01] shadow-lg shadow-blue-500/20"
            >
              Back to Sign In
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Password form ── */}
      {step === 'form' && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden ${
            isDark ? 'bg-[#111827] border border-gray-700/60' : 'bg-white border border-gray-200'
          }`}
        >
          {/* Top gradient strip */}
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500" />
          {/* Glow */}
          <div className="absolute top-32 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

          <div className="px-8 pt-10 pb-8">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${
                isDark
                  ? 'bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-blue-500/30'
                  : 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100'
              }`}>
                <HiOutlineLockClosed className="w-10 h-10 text-blue-500" />
              </div>
            </div>

            <h2 className={`text-2xl font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Set a new password
            </h2>
            <p className={`text-sm text-center mb-7 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Choose a strong password — at least 6 characters.
            </p>

            {/* Error */}
            {formError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-3 p-4 rounded-xl mb-5 text-sm ${
                  isDark
                    ? 'bg-red-900/25 border border-red-700/50 text-red-400'
                    : 'bg-red-50 border border-red-200 text-red-600'
                }`}
              >
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {formError}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New password */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  New password
                </label>
                <div className="relative">
                  <HiOutlineLockClosed className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    autoFocus
                    className={`w-full pl-11 pr-11 py-3.5 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 text-sm ${
                      isDark
                        ? 'bg-gray-800/80 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/15 focus:bg-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors ${
                      isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password strength bar */}
                {password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2.5"
                  >
                    <div className="flex gap-1.5 mb-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            i <= strength.score ? strength.color : (isDark ? 'bg-gray-700' : 'bg-gray-200')
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs ${
                      strength.score <= 1 ? 'text-red-400' :
                      strength.score === 2 ? 'text-yellow-400' :
                      strength.score === 3 ? 'text-blue-400' : 'text-emerald-500'
                    }`}>
                      {strength.label}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Confirm password
                </label>
                <div className="relative">
                  <HiOutlineLockClosed className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className={`w-full pl-11 pr-11 py-3.5 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 text-sm ${
                      confirmPassword && confirmPassword !== password
                        ? (isDark
                            ? 'bg-gray-800/80 border-red-600 text-white placeholder-gray-500 focus:border-red-500 focus:ring-red-500/20'
                            : 'bg-gray-50 border-red-400 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:ring-red-500/15')
                        : confirmPassword && confirmPassword === password
                          ? (isDark
                              ? 'bg-gray-800/80 border-emerald-600 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20'
                              : 'bg-gray-50 border-emerald-400 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500/15 focus:bg-white')
                          : (isDark
                              ? 'bg-gray-800/80 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
                              : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/15 focus:bg-white')
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors ${
                      isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {showConfirm ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                  </button>
                  {/* Match indicator */}
                  {confirmPassword && (
                    <div className={`absolute right-11 top-1/2 -translate-y-1/2`}>
                      {confirmPassword === password ? (
                        <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg mt-2 ${
                  isLoading
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:scale-[1.02] active:scale-[0.98] hover:shadow-blue-500/25'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Updating password…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <HiOutlineLockClosed className="w-4 h-4" />
                    Update Password
                  </span>
                )}
              </button>
            </form>

            <button
              onClick={() => navigate('/')}
              className={`mt-5 w-full text-sm text-center transition-colors duration-200 ${
                isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              ← Back to Sign In
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Success ── */}
      {step === 'success' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden ${
            isDark ? 'bg-[#111827] border border-gray-700/60' : 'bg-white border border-gray-200'
          }`}
        >
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-green-400 to-teal-500" />
          <div className="px-8 py-10 text-center">
            {/* Animated checkmark */}
            <div className="flex justify-center mb-7">
              <div className="relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-2xl shadow-emerald-500/40"
                >
                  <motion.svg
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.35 }}
                    className="w-12 h-12 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <motion.path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </motion.svg>
                </motion.div>
                {/* Pulse ring */}
                <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
              </div>
            </div>

            <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Password updated!
            </h2>
            <p className={`text-sm mb-8 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Your password has been reset successfully.
              <br />Sign in with your new password to continue.
            </p>

            <button
              onClick={() => navigate('/')}
              className="w-full py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In Now
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ResetPassword;
