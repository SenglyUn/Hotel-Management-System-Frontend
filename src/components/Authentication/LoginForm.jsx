import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('token', data.token);
      redirectUser(data.role || 'guest');
      
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const redirectUser = (role) => {
    role === 'admin' ? navigate('/admin/dashboard') : navigate('/');
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5001/api/auth/google';
  };

  return (
    <div className="relative min-h-screen">
      {/* Background with overlay */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80" 
          alt="Luxury Hotel" 
          className="w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/30"></div>
      </div>

      {/* Scaled-up content container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden transform scale-105">
          {/* Larger header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-center">
            <h2 className="text-3xl font-bold text-white">Welcome to Moon Hotel</h2>
            <p className="text-blue-100 mt-2 text-lg">Sign in to your account</p>
          </div>

          {/* Expanded form area */}
          <div className="p-8 space-y-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-base">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field - Larger */}
              <div>
                <label htmlFor="email" className="block text-lg font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400 text-xl" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3 text-lg border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your@email.com"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password Field - Larger */}
              <div>
                <label htmlFor="password" className="block text-lg font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400 text-xl" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-12 py-3 text-lg border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? 
                      <FiEyeOff className="text-xl" /> : 
                      <FiEye className="text-xl" />
                    }
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password - Larger */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-3 block text-lg text-gray-700">
                    Remember me
                  </label>
                </div>
                <a
                  href="/forgot-password"
                  className="text-lg text-blue-600 hover:text-blue-800"
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit Button - Larger */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-lg shadow-md text-xl font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75 disabled:cursor-not-allowed transition-all transform hover:scale-[1.01]"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    <FiLogIn className="mr-3 text-2xl" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Divider - Larger */}
            <div className="mt-8 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-gray-500 text-lg">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In - Larger */}
            <div className="mt-8">
              <button
                onClick={handleGoogleLogin}
                className="w-full inline-flex justify-center items-center py-3 px-6 border-2 border-gray-300 rounded-lg shadow-sm bg-white text-xl font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.01]"
              >
                <FcGoogle className="mr-3 text-2xl" />
                Sign in with Google
              </button>
            </div>
          </div>

          {/* Footer - Larger */}
          <div className="bg-gray-50/70 px-8 py-6 text-center border-t-2 border-gray-200">
            <p className="text-lg text-gray-600">
              Don't have an account?{' '}
              <a href="/signup" className="font-medium text-blue-600 hover:text-blue-800">
                Create one
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;