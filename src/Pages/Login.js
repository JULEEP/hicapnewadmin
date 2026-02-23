import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiLock, FiMail, FiLogIn, FiShield, FiUser } from 'react-icons/fi';
import discountLogo from '../Images/logo.png';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.techsterker.com/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('adminToken', data.data.token);
      localStorage.setItem('adminId', data.data.adminId);
      localStorage.setItem('adminName', data.data.name);

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load remembered email on component mount
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Animated Background Elements - CSS only */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-500"></div>
      </div>

      <div className="relative bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl w-full max-w-6xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 border border-white/20 animate-fade-in">
        
        {/* Left Side - Login Form */}
        <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center relative">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-purple-100 to-transparent rounded-full translate-x-20 translate-y-20"></div>

          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4 transform transition-transform duration-300 hover:scale-105">
                <FiShield className="text-2xl text-white" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text">
                Techsterker
              </h1>
              
              <div className="flex items-center justify-center gap-2 mt-3">
                <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                <p className="text-gray-600 text-sm font-medium">Admin Portal</p>
                <div className="w-16 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
              </div>
              
              <p className="text-gray-500 text-sm mt-4 max-w-md mx-auto">
                Secure access to your admin dashboard
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 mb-6 text-red-600 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100 shadow-sm animate-slide-down">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                    <FiShield className="text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium">Login Failed</p>
                    <p className="text-sm opacity-90">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2 ml-1" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@techsterker.com"
                    className="w-full pl-10 pr-4 py-4 text-base bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 shadow-sm hover:border-gray-300"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2 ml-1" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-300" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-4 text-base bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 shadow-sm hover:border-gray-300"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center transition-transform duration-300 hover:scale-110"
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-purple-500 transition-colors duration-300" />
                    ) : (
                      <FiEye className="h-5 w-5 text-gray-400 hover:text-purple-500 transition-colors duration-300" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 border-2 rounded transition-all duration-200 ${rememberMe ? 'bg-blue-500 border-blue-500' : 'border-gray-300 group-hover:border-blue-400'}`}>
                      {rememberMe && (
                        <svg className="w-4 h-4 text-white mx-auto mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-200">Remember me</span>
                </label>
                
             
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 px-6 text-white text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-[0.98] ${
                  isLoading ? 'opacity-80 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <FiLogIn className="text-lg" />
                    <span>Login to Dashboard</span>
                  </>
                )}
              </button>

              {/* Security Note */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-500">
                  <FiShield className="mr-2 text-green-500" />
                  <span>Your credentials are encrypted and securely transmitted</span>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Branding & Logo */}
        <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 md:p-12 lg:p-16 flex flex-col items-center justify-center text-white overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full translate-y-48 -translate-x-48"></div>
          </div>

          <div className="relative z-10 text-center">
            {/* Logo Container */}
            <div className="mb-8 transform transition-transform duration-500 hover:scale-105">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 inline-block border border-white/20">
                <img
                  src={discountLogo}
                  alt="Techsterker Logo"
                  className="w-64 h-auto object-contain drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Welcome Message */}
            <div className="max-w-md animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Welcome Back!</h2>
              <p className="text-blue-100 text-lg mb-6">
                Access your admin dashboard to manage users, monitor analytics, and oversee platform operations.
              </p>
              
              {/* Features List */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 transform transition-transform duration-300 hover:scale-105">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <FiUser className="text-xl" />
                  </div>
                  <p className="font-medium">User Management</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 transform transition-transform duration-300 hover:scale-105">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <FiShield className="text-xl" />
                  </div>
                  <p className="font-medium">Secure Access</p>
                </div>
              </div>

              {/* Admin Stats */}
              <div className="mt-10 pt-6 border-t border-white/20">
                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="text-center transform transition-transform duration-300 hover:scale-110">
                    <div className="text-2xl font-bold">24/7</div>
                    <div className="text-blue-200">Support</div>
                  </div>
                  <div className="h-8 w-px bg-white/30"></div>
                  <div className="text-center transform transition-transform duration-300 hover:scale-110">
                    <div className="text-2xl font-bold">99.9%</div>
                    <div className="text-blue-200">Uptime</div>
                  </div>
                  <div className="h-8 w-px bg-white/30"></div>
                  <div className="text-center transform transition-transform duration-300 hover:scale-110">
                    <div className="text-2xl font-bold">256-bit</div>
                    <div className="text-blue-200">Encryption</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="absolute bottom-6 left-0 right-0 text-center">
            <p className="text-sm text-blue-200/80">
              © {new Date().getFullYear()} Techsterker Admin Portal
            </p>
          </div>
        </div>
      </div>

      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
        .animation-delay-500 {
          animation-delay: 0.5s;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;