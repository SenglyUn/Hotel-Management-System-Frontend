import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBed, FaWifi, FaSwimmingPool, FaUtensils, 
  FaParking, FaConciergeBell, FaUser, 
  FaSignInAlt, FaSignOutAlt, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaCalendarAlt, FaSearch, FaStar
} from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Define API base URL
const API_BASE_URL = 'http://localhost:5000'; // Update with your actual API URL

const LandingPage = () => {
  const navigate = useNavigate();
  const [roomTypes, setRoomTypes] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [showAvailabilityResults, setShowAvailabilityResults] = useState(false);
  const [amenities, setAmenities] = useState([]);
  const [apiStatus, setApiStatus] = useState({
    roomTypes: true,
    availability: false, // Set to true when available
    amenities: true
  });

  // Constants
  const HERO_IMAGE = "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80";
  const FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1566669437685-2c5a585aded5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
  ];

  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('userData');
      
      if (token && storedUser) {
        setIsLoggedIn(true);
        setUserData(JSON.parse(storedUser));
      }
    };

    checkAuthStatus();
  }, []);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch room types if API is available
        if (apiStatus.roomTypes) {
          const response = await fetch(`${API_BASE_URL}/api/room-types`);
          if (!response.ok) throw new Error('Failed to fetch room types');
          const data = await response.json();
          setRoomTypes(data.data || []);
        }
        
        // Fetch amenities if API is available
        if (apiStatus.amenities) {
          const response = await fetch(`${API_BASE_URL}/api/amenities`);
          if (!response.ok) throw new Error('Failed to fetch amenities');
          const data = await response.json();
          setAmenities(data.data || []);
        }
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [apiStatus]);

  const checkRoomAvailability = async () => {
    if (!startDate || !endDate || !apiStatus.availability) return;
    
    try {
      setLoading(true);
      setError(null);
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      
      const response = await fetch(
        `${API_BASE_URL}/api/rooms/availability/check?from=${from}&to=${to}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch available rooms');
      const data = await response.json();
      setAvailableRooms(data.data || []);
      setShowAvailabilityResults(true);
    } catch (err) {
      setError(err.message);
      setAvailableRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setIsLoggedIn(false);
    setUserData(null);
    navigate('/');
  };

  const handleBookNow = (roomId) => {
    navigate(isLoggedIn ? `/book?room=${roomId}` : '/login', {
      state: { 
        redirectAfterLogin: `/book?room=${roomId}`,
        dateRange: dateRange 
      }
    });
  };

  const getImageUrl = (imagePath, index) => {
    if (!imagePath) return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
    if (imagePath.startsWith('http')) return imagePath;
    
    const normalizedPath = imagePath.replace(/\\/g, '/');
    const cleanPath = normalizedPath.replace(/^\/+/, '');
    return `${API_BASE_URL}/${cleanPath}`;
  };

  const showAllRooms = () => {
    setShowAvailabilityResults(false);
    setDateRange([null, null]);
  };

  // Helper Components
  const LoadingSkeleton = () => (
    <div className="grid md:grid-cols-3 gap-8">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-200"></div>
          <div className="p-6 space-y-4">
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const ErrorMessage = ({ error }) => (
    <div className="text-center py-12 text-red-500">
      <p className="text-lg">Error loading data: {error}</p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  );

  const RoomCard = ({ room, index }) => {
    const imageUrl = getImageUrl(room.image_url || room.image, index);
    const roomType = room.type || {};
    
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={imageUrl}
            alt={room.room_number || room.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.src = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <p className="text-white font-semibold text-lg">
              {room.room_number ? `Room ${room.room_number}` : room.name}
            </p>
            {roomType.name && <p className="text-white text-sm">{roomType.name}</p>}
          </div>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-blue-600 font-bold text-lg">
              ${roomType.base_price || room.price}
              <span className="text-sm font-normal text-gray-500">/night</span>
            </p>
            <div className="flex items-center text-sm text-gray-500">
              <FaBed className="mr-1" />
              <span>{roomType.bed_type || room.bed || 'Standard Bed'}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-4 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              {roomType.size || room.size || 'N/A'}
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Sleeps {roomType.capacity || room.capacity || 2}
            </div>
          </div>
          
          {room.status && (
            <div className="mb-4">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                room.status === 'available' ? 'bg-green-100 text-green-800' :
                room.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                room.status === 'maintenance' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
              </span>
            </div>
          )}
          
          <button 
            onClick={() => handleBookNow(room.room_id || room.id)}
            className={`w-full py-2 rounded-md transition ${
              (!room.status || room.status === 'available') 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={room.status && room.status !== 'available'}
          >
            {(!room.status || room.status === 'available') ? 'Reserve Now' : 'Not Available'}
          </button>
        </div>
      </div>
    );
  };

  const SectionHeader = ({ title, subtitle }) => (
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">{title}</h2>
      {subtitle && <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  );

  const DateRangeSelector = () => (
    <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
        <FaCalendarAlt className="mr-2 text-blue-600" />
        Check Availability
      </h3>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Dates</label>
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => {
              setDateRange(update);
              setShowAvailabilityResults(false);
            }}
            minDate={new Date()}
            placeholderText="Check-in — Check-out"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!apiStatus.availability}
          />
        </div>
        <div className="w-full md:w-auto flex items-end">
          <button
            onClick={checkRoomAvailability}
            disabled={!startDate || !endDate || !apiStatus.availability}
            className={`px-6 py-2 rounded-md w-full md:w-auto flex items-center justify-center gap-2 ${
              !startDate || !endDate || !apiStatus.availability
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <FaSearch />
            Check Availability
          </button>
        </div>
      </div>
      {!apiStatus.availability && (
        <div className="mt-4 text-sm text-yellow-600">
          Note: The availability check feature is currently under development
        </div>
      )}
      {startDate && endDate && showAvailabilityResults && (
        <p className="mt-2 text-sm text-gray-600">
          Showing availability from {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}
        </p>
      )}
    </div>
  );

  // Determine which rooms to display
  const roomsToDisplay = showAvailabilityResults ? availableRooms : roomTypes;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-800 flex items-center">
            <FaBed className="mr-2" />
            MOON HOTEL
            {isLoggedIn && (
              <span className="text-sm ml-2 font-normal text-gray-600">
                Welcome, {userData?.firstName}
              </span>
            )}
          </h1>
          
          <nav className="flex items-center space-x-6">
            <a href="#rooms" className="text-gray-700 hover:text-blue-600 transition">Rooms</a>
            <a href="#amenities" className="text-gray-700 hover:text-blue-600 transition">Amenities</a>
            <a href="#contact" className="text-gray-700 hover:text-blue-600 transition">Contact</a>
            
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center space-x-1 text-blue-700 hover:text-blue-900"
                >
                  <FaUser className="text-lg" />
                  <span>Account</span>
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
                  className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition"
                >
                  Sign Up
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white h-[500px]">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-blue-800/50"></div>
        <img 
          src={HERO_IMAGE} 
          alt="Luxury hotel rooms" 
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="container mx-auto px-4 absolute inset-0 flex flex-col justify-center items-center text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Elegant Comfort Awaits</h2>
          <p className="text-xl mb-8 max-w-2xl">Discover your perfect retreat with our premium accommodations</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => navigate(isLoggedIn ? '/book' : '/signup')}
              className="px-8 py-3 bg-white text-blue-700 rounded-md hover:bg-gray-100 transition font-medium"
            >
              Book Your Stay
            </button>
            <button 
              onClick={() => navigate('/explore')}
              className="px-8 py-3 border-2 border-white rounded-md hover:bg-white/10 transition font-medium"
            >
              Explore Rooms
            </button>
          </div>
        </div>
      </section>

      <main className="flex-grow container mx-auto px-4 py-12">
        {/* Room Types */}
        <section id="rooms" className="mb-16">
          <SectionHeader 
            title={showAvailabilityResults ? "Available Rooms" : "Our Accommodations"} 
            subtitle={showAvailabilityResults ? 
              "Rooms available for your selected dates" : 
              "Carefully designed spaces blending comfort with sophistication"} 
          />
          
          <DateRangeSelector />
          
          {showAvailabilityResults && (
            <div className="flex justify-end mb-4">
              <button 
                onClick={showAllRooms}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ← Show all room types
              </button>
            </div>
          )}
          
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorMessage error={error} />
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {roomsToDisplay.length > 0 ? (
                roomsToDisplay.map((room, index) => (
                  <RoomCard key={room.room_id || room.id || index} room={room} index={index} />
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <p className="text-lg text-gray-600">
                    {showAvailabilityResults ? 
                      "No rooms available for the selected dates. Please try different dates." : 
                      "No rooms available at the moment."}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Amenities */}
        <section id="amenities" className="mb-16">
          <SectionHeader 
            title="Our Amenities" 
            subtitle="Thoughtful services designed for your comfort" 
          />
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {amenities.length > 0 ? (
              amenities.map((amenity) => (
                <div key={amenity.amenity_id} className="bg-white p-4 rounded-lg shadow-sm text-center border border-gray-100 hover:shadow-md transition hover:-translate-y-1">
                  <div className="text-blue-600 mb-2 flex justify-center">
                    {amenity.icon_url ? (
                      <img 
                        src={getImageUrl(amenity.icon_url)} 
                        alt={amenity.name} 
                        className="h-8 w-8 object-contain"
                        onError={(e) => {
                          e.target.src = FALLBACK_IMAGES[0];
                          e.target.className = "h-8 w-8 object-contain";
                        }}
                      />
                    ) : (
                      <FaStar className="text-2xl" />
                    )}
                  </div>
                  <h3 className="font-medium text-gray-700">{amenity.name}</h3>
                  {amenity.category && (
                    <p className="text-xs text-gray-500 mt-1">{amenity.category}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-6 text-center py-8">
                <p className="text-gray-500">Amenities information coming soon</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="mb-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Begin Your Experience</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Reserve your stay today and discover unparalleled hospitality
          </p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => navigate(isLoggedIn ? '/book' : '/signup')} 
              className="px-8 py-3 bg-white text-blue-700 rounded-md font-bold hover:bg-gray-100 transition"
            >
              Book Now
            </button>
            <button 
              onClick={() => navigate('/contact')}
              className="px-8 py-3 border-2 border-white rounded-md hover:bg-white/10 transition font-medium"
            >
              Contact Us
            </button>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="mb-16">
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8">
            <SectionHeader 
              title="Get in Touch" 
              subtitle="Our team is ready to assist you" 
              center
            />
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <FaMapMarkerAlt className="text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-800">Address</h3>
                    <p className="text-gray-600">123 Phnom Penh, City Center</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <FaPhone className="text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-800">Phone</h3>
                    <p className="text-gray-600">(+855) 92474158</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <FaEnvelope className="text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-800">Email</h3>
                    <p className="text-gray-600">info@moonhotel.com</p>
                  </div>
                </div>
              </div>
              
              <form className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-gray-700 mb-2">Name</label>
                    <input 
                      id="name"
                      type="text" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
                    <input 
                      id="email"
                      type="email" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="Your email"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-gray-700 mb-2">Message</label>
                    <textarea 
                      id="message"
                      rows="4" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="How can we help?"
                    ></textarea>
                  </div>
                  <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition w-full">
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
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
              <p className="mb-4">Luxury accommodations in the heart of Phnom Penh</p>
              <p>&copy; {new Date().getFullYear()} Moon Hotel. All rights reserved.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#rooms" className="hover:text-blue-300 transition">Rooms & Suites</a></li>
                <li><a href="#amenities" className="hover:text-blue-300 transition">Amenities</a></li>
                <li><a href="#contact" className="hover:text-blue-300 transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-blue-300 transition">Gallery</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-blue-300 transition">FAQs</a></li>
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
                  placeholder="Your email" 
                  className="px-4 py-2 rounded-l-md w-full focus:outline-none text-gray-800" 
                />
                <button className="bg-blue-600 px-4 py-2 rounded-r-md hover:bg-blue-700 transition">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;