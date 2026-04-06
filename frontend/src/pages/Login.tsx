import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaUser, FaLock, FaEnvelope } from 'react-icons/fa';
import { authApi } from '../services/auth';
import api from '../services/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if already logged in and token is valid
    const token = authApi.getToken();
    if (token) {
      // Verify token is still valid before redirecting
      api.get('/auth/me')
        .then(() => {
          navigate('/');
        })
        .catch(() => {
          // Token invalid, clear it
          authApi.logout();
        });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.login(email, password);
      console.log('Login response:', response);

      if (response.success && response.token) {
        // Verify token was saved
        const savedToken = authApi.getToken();
        console.log('Token saved:', !!savedToken);

        if (!savedToken) {
          console.error('Token was not saved to localStorage');
          setError('Failed to save authentication token');
          toast.error('Failed to save authentication token');
          return;
        }

        // Update API headers with new token immediately
        api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;

        toast.success('Login successful! Welcome back!');
        // Navigate immediately - token is saved
        navigate('/');
      } else {
        setError(response.message || 'Login failed');
        toast.error(response.message || 'Login failed');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMsg = err.response?.data?.error || err.message || 'An error occurred during login';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan via-cyan-500 to-cyan-600 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-6 sm:mb-8 animate-fade-in">
          <div className="inline-block mb-3 sm:mb-4 animate-bounce-slow">
            <img src="/book.png" alt="Tech Tales Logo" className="w-20 sm:w-24 h-20 sm:h-24" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Tech Tales</h1>
          <p className="text-white opacity-90 text-sm sm:text-base">Welcome back! Please login to continue</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded animate-shake">
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaEnvelope className="text-sky-400 text-lg animate-pulse" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border-2 border-sky-200 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-300 outline-none transition-all duration-300 text-sm sm:text-base min-h-[44px]"
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaLock className="text-sky-400 text-lg animate-pulse" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border-2 border-sky-200 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-300 outline-none transition-all duration-300 text-sm sm:text-base min-h-[44px]"
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan to-cyan-500 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold hover:from-cyan-500 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl min-h-[44px] text-sm sm:text-base"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <FaUser className="mr-2" />
                  Login
                </span>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-cyan font-semibold hover:text-cyan-500 transition-colors duration-200 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

