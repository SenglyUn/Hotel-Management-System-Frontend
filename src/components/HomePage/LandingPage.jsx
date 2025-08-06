import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBed, FaWifi, FaSwimmingPool, FaTv, 
  FaSnowflake, FaGlassMartiniAlt, FaUser, 
  FaSignInAlt, FaSignOutAlt, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaCalendarAlt, FaSearch, FaStar, FaRegSnowflake, FaRegStar,
  FaUtensils, FaConciergeBell, FaParking,
  FaCheck, FaTimes
} from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const API_BASE_URL = 'http://localhost:5000';

// Auth service functions
const authService = {
  // Register a new user
  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Get current user data
  getCurrentUser: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: 'include', // Important for cookies
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      return await response.json();
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      // Assuming you have a logout endpoint
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
};

// Improved image URL handler with better error handling
const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return 'https://source.unsplash.com/random/800x600/?hotel-room';
  }
  
  // Handle absolute URLs
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Handle local server paths
  if (imagePath.startsWith('/uploads') || imagePath.startsWith('uploads')) {
    const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${API_BASE_URL}${normalizedPath}`;
  }
  
  // Handle other relative paths
  return `${API_BASE_URL}/${imagePath.replace(/^\/+/, '')}`;
};

const LoadingSkeleton = () => (
  <div className="grid md:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse h-full">
        <div className="h-56 bg-gray-200"></div>
        <div className="p-5 space-y-4">
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  // Check auth status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const data = await authService.getCurrentUser();
        if (data.user) {
          setIsLoggedIn(true);
          setUserData(data.user);
          localStorage.setItem('userData', JSON.stringify(data.user));
        }
      } catch (error) {
        // Not logged in or error occurred
        setIsLoggedIn(false);
        setUserData(null);
        localStorage.removeItem('userData');
      }
    };

    checkAuthStatus();
  }, []);

  // Handle login
  const handleLogin = async (credentials) => {
    try {
      setLoading(true);
      const data = await authService.login(credentials);
      
      if (data.user) {
        setIsLoggedIn(true);
        setUserData(data.user);
        localStorage.setItem('userData', JSON.stringify(data.user));
        navigate('/');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle register
  const handleRegister = async (userData) => {
    try {
      setLoading(true);
      const data = await authService.register(userData);
      
      if (data.user) {
        // Auto-login after registration
        await handleLogin({
          email: userData.email,
          password: userData.password
        });
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsLoggedIn(false);
      setUserData(null);
      localStorage.removeItem('userData');
      navigate('/');
    } catch (error) {
      setError(error.message);
    }
  };

  // Fetch room types with proper error handling
  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/room-types`, {
          credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to fetch room types');
        
        const data = await response.json();
        const types = Array.isArray(data.data) ? data.data : 
                     Array.isArray(data.data?.items) ? data.data.items : 
                     [];
        
        // Process images with default fallback
        const processedTypes = types.map(type => ({
          ...type,
          image_url: type.image_url || 'https://source.unsplash.com/random/800x600/?hotel-room'
        }));
        
        setRoomTypes(processedTypes);
      } catch (err) {
        console.error('Error fetching room types:', err);
        setError(err.message);
        setRoomTypes([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoomTypes();
  }, []);

  // Check room availability when dates change
  useEffect(() => {
    if (startDate && endDate) {
      checkRoomAvailability();
    }
  }, [startDate, endDate, adults, children, selectedRoomType]);

  const checkRoomAvailability = async () => {
    if (!startDate || !endDate) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const checkIn = startDate.toISOString().split('T')[0];
      const checkOut = endDate.toISOString().split('T')[0];
      
      const url = new URL(`${API_BASE_URL}/api/Reservations/availability/rooms`);
      url.searchParams.append('check_in', checkIn);
      url.searchParams.append('check_out', checkOut);
      url.searchParams.append('adults', adults);
      url.searchParams.append('children', children);
      
      if (selectedRoomType) {
        url.searchParams.append('type_id', selectedRoomType);
      }
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to check room availability');
      
      const data = await response.json();
      
      // Process room images with proper fallback
      const processedRooms = (data.data?.available_rooms || []).map(room => {
        const roomType = room.type || {};
        return {
          ...room,
          type: {
            ...roomType,
            image_url: roomType.image_url || 'https://source.unsplash.com/random/800x600/?hotel-room'
          }
        };
      });
      
      setAvailableRooms(processedRooms);
    } catch (err) {
      console.error('Error checking room availability:', err);
      setError(err.message || 'Failed to check availability');
      setAvailableRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const RoomCard = ({ room }) => {
    const roomType = room.type || {};
    const amenities = room.amenities || [];
    const nights = calculateNights(room.check_in, room.check_out) || 1;
    const totalPrice = parseFloat(room.total_price) || parseFloat(roomType.base_price) * nights;
    
    // State for image handling with fallback
    const [imageSrc, setImageSrc] = useState(
      getImageUrl(roomType.image_url)
    );

    const handleImageError = () => {
      setImageSrc('https://source.unsplash.com/random/800x600/?hotel-room');
    };

    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        <div className="relative h-56 overflow-hidden">
          <img 
            src={imageSrc}
            alt={`${roomType.name || 'Hotel'} Room`}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            loading="lazy"
            onError={handleImageError}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-white font-bold text-xl">Room {room.room_number || 'N/A'}</h3>
                <p className="text-white/90">{roomType.name || 'Standard Room'}</p>
              </div>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Available
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-5 flex-grow flex flex-col">
          <div className="flex-grow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-gray-600 text-sm">{roomType.description || 'Comfortable room'}</p>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <FaUser className="mr-1" />
                  <span>Capacity: {roomType.capacity || 2}</span>
                </div>
              </div>
              <p className="text-blue-600 font-bold text-xl whitespace-nowrap">
                ${roomType.base_price || '0'}
                <span className="text-sm font-normal text-gray-500"> /night</span>
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Floor: {room.floor || 'N/A'}
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Nights: {nights}
              </div>
            </div>
            
            {amenities.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Amenities:</p>
                <div className="flex flex-wrap gap-1">
                  {amenities.map(amenity => (
                    <span key={amenity.amenity_id} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                      {amenity.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-600">Total for {nights} night{nights !== 1 ? 's' : ''}:</p>
              <p className="text-lg font-bold text-blue-600">${totalPrice.toFixed(2)}</p>
            </div>
            <button 
              onClick={() => navigate(`/book?room=${room.room_id}&check_in=${startDate.toISOString()}&check_out=${endDate.toISOString()}`)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    );
  };

  function calculateNights(checkIn, checkOut) {
    if (!checkIn || !checkOut) return 0;
    const oneDay = 24 * 60 * 60 * 1000;
    const firstDate = new Date(checkIn);
    const secondDate = new Date(checkOut);
    return Math.round(Math.abs((firstDate - secondDate) / oneDay));
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-800 flex items-center">
            <FaBed className="mr-2" />
            MOON HOTEL
          </h1>
          
          <nav className="flex items-center space-x-6">
            <a href="#rooms" className="text-gray-700 hover:text-blue-600 transition">Rooms</a>
            <a href="#amenities" className="text-gray-700 hover:text-blue-600 transition">Amenities</a>
            <a href="#contact" className="text-gray-700 hover:text-blue-600 transition">Contact</a>
            
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-blue-700">
                  <FaUser className="text-lg" />
                  <span>{userData?.firstName || 'User'}</span>
                </div>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  Dashboard
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-800"
                >
                  <FaSignOutAlt className="text-lg" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => navigate('/login')}
                  className="flex items-center space-x-1 text-blue-700 hover:text-blue-900"
                >
                  <FaSignInAlt className="text-lg" />
                  <span>Login</span>
                </button>
                <button 
                  onClick={() => navigate('/signup')}
                  className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
                >
                  Sign Up
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white h-96 md:h-[500px]">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-blue-800/50"></div>
        <img 
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&h=900"
          alt="Luxury hotel rooms" 
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://source.unsplash.com/random/1600x900/?hotel';
          }}
        />
        <div className="container mx-auto px-4 absolute inset-0 flex flex-col justify-center items-center text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Experience Luxury Redefined</h2>
          <p className="text-xl mb-8 max-w-2xl">Discover unparalleled comfort in our meticulously designed accommodations</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => navigate(isLoggedIn ? '/book' : '/signup')}
              className="px-8 py-3 bg-white text-blue-700 rounded-lg hover:bg-gray-100 transition font-medium"
            >
              Book Your Stay
            </button>
            <button 
              onClick={() => document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3 border-2 border-white rounded-lg hover:bg-white/10 transition font-medium"
            >
              Explore Rooms
            </button>
          </div>
        </div>
      </section>

      <main className="flex-grow container mx-auto px-4 py-12">
        {/* Room Filter Section */}
        <section className="mb-12 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check In - Check Out</label>
                <DatePicker
                  selectsRange
                  startDate={startDate}
                  endDate={endDate}
                  onChange={setDateRange}
                  minDate={new Date()}
                  placeholderText="Select dates"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                <select
                  value={selectedRoomType || ''}
                  onChange={(e) => setSelectedRoomType(e.target.value || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Room Types</option>
                  {Array.isArray(roomTypes) && roomTypes.map(type => (
                    <option key={type.type_id} value={type.type_id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adults</label>
                <select
                  value={adults}
                  onChange={(e) => setAdults(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num} Adult{num !== 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
                <select
                  value={children}
                  onChange={(e) => setChildren(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[0, 1, 2, 3, 4].map(num => (
                    <option key={num} value={num}>{num} Child{num !== 1 ? 'ren' : ''}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <button
              onClick={checkRoomAvailability}
              disabled={!startDate || !endDate}
              className={`px-6 py-3 text-white rounded-lg font-medium flex items-center gap-2 ${
                !startDate || !endDate 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <FaSearch />
              Check Availability
            </button>
          </div>
        </section>

        {/* Available Rooms Section */}
        <section id="rooms" className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Available Rooms</h2>
              <p className="text-gray-600">
                {availableRooms.length} room{availableRooms.length !== 1 ? 's' : ''} available
                {selectedRoomType && ` in ${roomTypes.find(t => t.type_id === parseInt(selectedRoomType))?.name} category`}
                {startDate && endDate && ` for ${calculateNights(startDate, endDate)} night${calculateNights(startDate, endDate) !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <p className="text-lg">Error loading rooms: {error}</p>
              <button 
                onClick={checkRoomAvailability}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : availableRooms.length === 0 && startDate && endDate ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No rooms available for the selected dates and filters</p>
              <button 
                onClick={() => {
                  setSelectedRoomType(null);
                  setDateRange([null, null]);
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableRooms.map((room) => (
                <RoomCard key={room.room_id} room={room} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <FaBed className="mr-2" />
                MOON HOTEL
              </h3>
              <p className="mb-4">Luxury redefined in the heart of Phnom Penh</p>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-blue-300 transition">Facebook</a>
                <a href="#" className="hover:text-blue-300 transition">Instagram</a>
                <a href="#" className="hover:text-blue-300 transition">Twitter</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#rooms" className="hover:text-blue-300 transition">Rooms & Suites</a></li>
                <li><a href="#amenities" className="hover:text-blue-300 transition">Amenities</a></li>
                <li><a href="#contact" className="hover:text-blue-300 transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-blue-300 transition">Special Offers</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Information</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-blue-300 transition">About Us</a></li>
                <li><a href="#" className="hover:text-blue-300 transition">Careers</a></li>
                <li><a href="#" className="hover:text-blue-300 transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-300 transition">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Newsletter</h4>
              <p className="mb-4">Subscribe for exclusive offers and updates</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="px-4 py-2 rounded-l-lg w-full focus:outline-none text-gray-800" 
                />
                <button className="bg-blue-600 px-4 py-2 rounded-r-lg hover:bg-blue-700 transition">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Moon Hotel. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;