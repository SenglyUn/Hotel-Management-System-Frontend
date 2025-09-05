// src/components/LandingPage/Header.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiSearch, 
  FiBell, 
  FiUser, 
  FiLogOut, 
  FiSettings, 
  FiBookmark,
  FiHome,
  FiStar,
  FiMap,
  FiHeart,
  FiMenu,
  FiX,
  FiFileText,
  FiCalendar,
  FiLoader
} from 'react-icons/fi';
import axios from 'axios';

const Header = ({ toggleAuthModal, handleLogout }) => {
  const { user: userData, loading: authLoading, logout: authLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNav, setActiveNav] = useState('home');
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const isLoggedIn = !!userData;
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  // Create axios instance with proper authentication
  const createApiInstance = () => {
    const instance = axios.create({
      baseURL: API_BASE,
      withCredentials: true,
    });

    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    return instance;
  };

  // Fetch user profile data
  const fetchProfile = async () => {
    if (!isLoggedIn) return;
    
    try {
      setProfileLoading(true);
      const api = createApiInstance();
      const response = await api.get("/api/auth/me");
      
      if (response.data) {
        setProfileData(response.data);
      }
    } catch (err) {
      console.error("Fetch profile failed", err);
      // Don't show error for header, just fail silently
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchProfile();
    }
  }, [isLoggedIn]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSectionNavigation = (sectionId, navItem) => {
    setActiveNav(navItem);
    setShowDropdown(false);
    setShowMobileMenu(false);
    
    if (location.pathname === '/landing') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/landing', { 
        state: { scrollTo: sectionId },
        replace: true
      });
      
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handlePageNavigation = (path, navItem) => {
    setActiveNav(navItem);
    setShowDropdown(false);
    setShowMobileMenu(false);
    navigate(path);
  };

  const handleLogoutClick = async () => {
    try {
      if (handleLogout) {
        await handleLogout();
      } else {
        await authLogout();
        navigate('/login');
      }
      setShowDropdown(false);
      setShowMobileMenu(false);
      setProfileData(null); // Clear profile data on logout
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Function to handle navigation to booking history
  const handleViewBookingHistory = () => {
    setShowDropdown(false);
    setShowMobileMenu(false);
    navigate('/booking-history');
  };

  // Function to handle navigation to specific booking confirmation
  const handleViewInvoice = (bookingId = null) => {
    setShowDropdown(false);
    setShowMobileMenu(false);
    
    if (bookingId) {
      // Navigate to specific booking confirmation
      navigate('/booking-confirmation', { state: { bookingId } });
    } else {
      // Navigate to booking history to select a booking
      navigate('/booking-history');
    }
  };

  // Get user display name with fallbacks
  const getUserDisplayName = () => {
    if (profileData?.user?.firstName && profileData?.user?.lastName) {
      return `${profileData.user.firstName} ${profileData.user.lastName}`;
    } else if (profileData?.user?.firstName) {
      return profileData.user.firstName;
    } else if (userData?.firstName && userData?.lastName) {
      return `${userData.firstName} ${userData.lastName}`;
    } else if (userData?.firstName) {
      return userData.firstName;
    } else if (userData?.username) {
      return userData.username;
    }
    return 'Guest User';
  };

  // Get user email with fallback
  const getUserEmail = () => {
    return profileData?.user?.email || userData?.email || 'No email';
  };

  // Get user avatar with fallback
  const getUserAvatar = () => {
    return profileData?.profile?.avatar || null;
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    const name = getUserDisplayName();
    if (name === 'Guest User') return 'G';
    
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return `${names[0].charAt(0).toUpperCase()}${names[names.length - 1].charAt(0).toUpperCase()}`;
  };

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between fixed top-0 z-50 shadow-sm w-full">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-blue-800">Moon Hotel</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="animate-pulse bg-gray-200 rounded-full w-10 h-10"></div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between fixed top-0 z-50 shadow-sm w-full">
        {/* Logo and Mobile Menu Button */}
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
          </button>
          
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => handlePageNavigation('/landing', 'home')}
          >
            <h1 className="text-xl font-bold text-blue-800">Moon Hotel</h1>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <button 
            onClick={() => handleSectionNavigation('rooms', 'rooms')}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeNav === 'rooms' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            <FiHome className="inline mr-2 h-4 w-4" />
            Rooms
          </button>
          <button 
            onClick={() => handleSectionNavigation('amenities', 'amenities')}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeNav === 'amenities' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            <FiStar className="inline mr-2 h-4 w-4" />
            Amenities
          </button>
          <button 
            onClick={() => handleSectionNavigation('contact', 'contact')}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeNav === 'contact' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            <FiMap className="inline mr-2 h-4 w-4" />
            Contact
          </button>
        </nav>

        {/* Search Bar */}
        <div className="hidden md:block relative flex-1 max-w-xl mx-6">
          <form onSubmit={handleSearch} className="bg-gray-100 rounded-lg px-4 py-2 flex items-center">
            <FiSearch className="text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Search rooms, amenities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent focus:outline-none w-full text-sm text-gray-700 placeholder-gray-400"
            />
          </form>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          {/* Mobile Search */}
          <button 
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors"
            onClick={() => {
              const searchInput = prompt("What are you looking for?");
              if (searchInput) {
                setSearchQuery(searchInput);
                navigate(`/search?q=${encodeURIComponent(searchInput)}`);
              }
            }}
          >
            <FiSearch className="h-5 w-5" />
          </button>

          {/* Notifications - Only show if logged in */}
          {isLoggedIn && (
            <div className="relative w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
              <FiBell className="text-gray-600" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </div>
          )}

          {/* User Profile with Dropdown */}
          {isLoggedIn ? (
            <div 
              className="flex items-center gap-3 bg-gray-100 rounded-full px-3 py-1 cursor-pointer hover:bg-gray-200 transition-colors relative"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {profileLoading ? (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <FiLoader className="h-4 w-4 text-gray-400 animate-spin" />
                </div>
              ) : getUserAvatar() ? (
                <img
                  src={getUserAvatar()}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {getUserInitials()}
                  </span>
                </div>
              )}
              
              <div className="leading-tight hidden md:block">
                <p className="font-medium text-gray-800 text-sm">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {userData?.role || 'guest'}
                </p>
              </div>
              
              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {getUserDisplayName()}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{getUserEmail()}</p>
                  </div>
                  
                  <div className="py-2">
                    <button 
                      onClick={() => handlePageNavigation('/profile', 'profile')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <FiUser className="h-4 w-4 mr-3" />
                      Profile
                    </button>
                    <button 
                      onClick={handleViewBookingHistory}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <FiCalendar className="h-4 w-4 mr-3" />
                      My Bookings
                    </button>
                    <button 
                      onClick={() => handleViewInvoice()}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <FiFileText className="h-4 w-4 mr-3" />
                      My Invoices
                    </button>
                    <button 
                      onClick={() => handlePageNavigation('/wishlist', 'wishlist')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <FiHeart className="h-4 w-4 mr-3" />
                      Wishlist
                    </button>
                  </div>
                  
                  <div className="border-t border-gray-100"></div>
                  
                  <button 
                    onClick={handleLogoutClick}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FiLogOut className="h-4 w-4 mr-3" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => toggleAuthModal ? toggleAuthModal('login') : handlePageNavigation('/login', 'login')}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 transition"
              >
                Login
              </button>
              <button 
                onClick={() => toggleAuthModal ? toggleAuthModal('register') : handlePageNavigation('/signup', 'signup')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="fixed top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40 md:hidden">
          <div className="px-6 py-4">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Navigation</h2>
              <div className="space-y-2">
                <button 
                  onClick={() => handleSectionNavigation('rooms', 'rooms')}
                  className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeNav === 'rooms' 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <FiHome className="inline mr-2 h-4 w-4" />
                  Rooms
                </button>
                <button 
                  onClick={() => handleSectionNavigation('amenities', 'amenities')}
                  className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeNav === 'amenities' 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <FiStar className="inline mr-2 h-4 w-4" />
                  Amenities
                </button>
                <button 
                  onClick={() => handleSectionNavigation('contact', 'contact')}
                  className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeNav === 'contact' 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <FiMap className="inline mr-2 h-4 w-4" />
                  Contact
                </button>
              </div>
            </div>
            
            {isLoggedIn ? (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Account</h2>
                <div className="space-y-2">
                  <button 
                    onClick={() => handlePageNavigation('/profile', 'profile')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <FiUser className="inline mr-2 h-4 w-4" />
                    Profile
                  </button>
                  <button 
                    onClick={handleViewBookingHistory}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <FiCalendar className="inline mr-2 h-4 w-4" />
                    My Bookings
                  </button>
                  <button 
                    onClick={() => handleViewInvoice()}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <FiFileText className="inline mr-2 h-4 w-4" />
                    My Invoices
                  </button>
                  <button 
                    onClick={() => handlePageNavigation('/wishlist', 'wishlist')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <FiHeart className="inline mr-2 h-4 w-4" />
                    Wishlist
                  </button>
                  <button 
                    onClick={handleLogoutClick}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <FiLogOut className="inline mr-2 h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Account</h2>
                <div className="space-y-2">
                  <button 
                    onClick={() => toggleAuthModal ? toggleAuthModal('login') : handlePageNavigation('/login', 'login')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                    Login
                  </button>
                  <button 
                    onClick={() => toggleAuthModal ? toggleAuthModal('register') : handlePageNavigation('/signup', 'signup')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Register
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add a spacer to prevent content from being hidden behind fixed header */}
      <div className="h-16"></div>
    </>
  );
};

export default Header;