// src/components/LandingPage/LandingPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Components
import Header from './Header';
import HeroSection from './HeroSection';
import RoomFilter from './RoomFilter';
import RoomCard from './RoomCard';
import LoadingSkeleton from './LoadingSkeleton';
import AmenitiesSection from './AmenitiesSection';
import ContactSection from './ContactSection';
import Footer from './Footer';
import AuthModal from '../AuthModal/AuthModal';

// Services
import { authService } from '../Common/authService';

const API_BASE_URL = 'http://localhost:5000';

const getImageUrl = (imagePath) => {
  if (!imagePath) return "https://picsum.photos/800/600?hotel";
  
  if (imagePath.startsWith("http://uploads/")) {
    const filename = imagePath.replace('http://uploads/', '');
    return `${API_BASE_URL}/uploads/${filename}`;
  }
  
  if (imagePath.startsWith("https://uploads/")) {
    const filename = imagePath.replace('https://uploads/', '');
    return `${API_BASE_URL}/uploads/${filename}`;
  }
  
  if (imagePath.startsWith("http")) return imagePath;
  
  const normalizedPath = imagePath.replace(/\\/g, "/");
  const cleanPath = normalizedPath.replace(/^\/+/, "");
  return `${API_BASE_URL}/${cleanPath}`;
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const isLoggedIn = !!user;
  const userData = user;

  const [state, setState] = useState({
    availableRooms: [],
    loading: false,
    error: null,
    dateRange: [null, null],
    selectedRoomType: null,
    roomTypes: [],
    adults: 1,
    children: 0,
    showAuthModal: false,
    authMode: 'login',
    hasSearched: false
  });

  const {
    availableRooms, loading, error,
    dateRange, selectedRoomType, roomTypes, adults, children,
    showAuthModal, authMode, hasSearched
  } = state;

  const [startDate, endDate] = dateRange;

  // Helper function to update state
  const updateState = (newState) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  // Fetch room types only
  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        updateState({ loading: true });
        const response = await fetch(`${API_BASE_URL}/api/room-types?page=1&limit=100`, {
          credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to fetch room types');
        
        const data = await response.json();
        
        let types = [];
        if (data.success && data.data && Array.isArray(data.data.items)) {
          types = data.data.items;
        } else if (Array.isArray(data.data)) {
          types = data.data;
        } else if (Array.isArray(data)) {
          types = data;
        }
        
        const formattedTypes = types.map(type => ({
          id: type.type_id || type.id,
          name: type.name,
          description: type.description,
          capacity: type.capacity,
          base_price: type.base_price,
          image_url: getImageUrl(type.image_url)
        }));
        
        updateState({
          roomTypes: formattedTypes,
          loading: false
        });
      } catch (err) {
        console.error('Error fetching room types:', err);
        updateState({
          error: err.message,
          roomTypes: [],
          loading: false
        });
      }
    };
    
    fetchRoomTypes();
  }, []);

  const validateDates = () => {
    if (!startDate || !endDate) {
      toast.error('Please select both check-in and check-out dates');
      return false;
    }
    
    // Create today's date without time component for accurate comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Reset time components for selected dates to avoid timezone issues
    const checkInDate = new Date(startDate);
    checkInDate.setHours(0, 0, 0, 0);
    
    const checkOutDate = new Date(endDate);
    checkOutDate.setHours(0, 0, 0, 0);
    
    // Compare dates
    if (checkInDate < today) {
      toast.error('Check-in date cannot be in the past');
      return false;
    }
    
    if (checkOutDate < today) {
      toast.error('Check-out date cannot be in the past');
      return false;
    }
    
    if (checkOutDate <= checkInDate) {
      toast.error('Check-out date must be after check-in date');
      return false;
    }
    
    return true;
  };

  const checkRoomAvailability = async () => {
    // Validate dates before making API call
    if (!validateDates()) {
      return;
    }
    
    try {
      updateState({ loading: true, error: null, hasSearched: true });
      
      // Format dates correctly for API (YYYY-MM-DD)
      const formatDateForAPI = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const checkIn = formatDateForAPI(startDate);
      const checkOut = formatDateForAPI(endDate);
      
      console.log('Sending dates to API:', checkIn, checkOut);
      
      const url = new URL(`${API_BASE_URL}/api/reservations/availability/rooms`);
      url.searchParams.append('check_in', checkIn);
      url.searchParams.append('check_out', checkOut);
      url.searchParams.append('adults', adults);
      url.searchParams.append('children', children);
      
      if (selectedRoomType) {
        url.searchParams.append('type_id', selectedRoomType);
      }
      
      const response = await fetch(url, { 
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      const data = await response.json();
      console.log('API Response:', data);
      
      if (!response.ok) {
        const errorMessage = data.message || data.error || 'Failed to check availability';
        throw new Error(errorMessage);
      }
      
      // Process the API response correctly
      let availableRoomsData = [];
      if (data.success && data.data && Array.isArray(data.data.rooms)) {
        availableRoomsData = data.data.rooms;
      } else if (Array.isArray(data.rooms)) {
        availableRoomsData = data.rooms;
      } else if (Array.isArray(data)) {
        availableRoomsData = data;
      } else {
        throw new Error('Invalid response format from server');
      }
      
      // Enrich room data with room type information
      const enrichedRooms = availableRoomsData.map(room => {
        const roomTypeId = room.type?.id || room.room_type_id;
        const roomTypeInfo = roomTypes.find(type => type.id === roomTypeId);
        
        return {
          id: room.id || room.room_id,
          room_number: room.number || room.room_number,
          floor: room.floor,
          status: 'available',
          type: {
            type_id: roomTypeId,
            name: room.type?.name || roomTypeInfo?.name || 'Unknown',
            base_price: room.pricing?.base_price || roomTypeInfo?.base_price || '0.00',
            description: roomTypeInfo?.description || '',
            capacity: room.type?.capacity || roomTypeInfo?.capacity || 0,
            image_url: roomTypeInfo?.image_url ? getImageUrl(roomTypeInfo.image_url) : 'https://picsum.photos/800/600?hotel'
          },
          pricing: room.pricing || { base_price: '0.00', total: '0.00', currency: 'USD' },
          amenities: room.amenities || []
        };
      });
      
      updateState({
        availableRooms: enrichedRooms,
        loading: false
      });
      
    } catch (err) {
      console.error('Availability check error:', err);
      const errorMessage = err.message || 'Failed to check availability. Please try again.';
      updateState({
        error: errorMessage,
        availableRooms: [],
        loading: false
      });
      toast.error(errorMessage);
    }
  };

  const calculateNights = (checkIn, checkOut) => {
      if (!checkIn || !checkOut) return 0;
      const oneDay = 24 * 60 * 60 * 1000;
      return Math.round(Math.abs((new Date(checkOut)) - (new Date(checkIn))) / oneDay);
  };

  const toggleAuthModal = (mode = 'login') => {
    updateState({
      showAuthModal: !showAuthModal,
      authMode: mode
    });
  };

  const getRoomTypeName = () => {
    if (!selectedRoomType) return null;
    const roomType = roomTypes.find(t => t.id === parseInt(selectedRoomType));
    return roomType ? roomType.name : null;
  };

  const handleAuth = async (credentials, isRegister = false) => {
    try {
      updateState({ loading: true });
      
      const data = isRegister 
        ? await authService.register(credentials)
        : await authService.login(credentials);

      if (data.user) {
        updateState({
          showAuthModal: false,
          loading: false
        });

        window.location.reload();
      }
    } catch (error) {
      updateState({ error: error.message, loading: false });
      toast.error(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const clearSearch = () => {
    updateState({
      dateRange: [null, null],
      selectedRoomType: null,
      adults: 1,
      children: 0,
      availableRooms: [],
      hasSearched: false,
      error: null
    });
  };

  // Custom input component for date picker
  const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
    <div 
      className="flex items-center bg-white rounded-lg border border-gray-300 p-3 w-full cursor-pointer"
      onClick={onClick}
      ref={ref}
    >
      <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span className="text-gray-700">
        {value || 'Check In - Check Out'}
      </span>
    </div>
  ));

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header 
        userData={userData} 
        handleLogout={handleLogout}
        toggleAuthModal={toggleAuthModal}
      />

      <HeroSection 
        isLoggedIn={isLoggedIn} 
        navigate={navigate} 
        toggleAuthModal={toggleAuthModal} 
      />

      <main className="flex-grow">
        {/* Booking Section */}
        <section className="bg-white py-8 shadow-md">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Find Your Perfect Stay</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dates</label>
                  <DatePicker
                    selectsRange={true}
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(update) => {
                      updateState({ dateRange: update });
                    }}
                    isClearable={true}
                    minDate={new Date()}
                    monthsShown={2}
                    customInput={<CustomDateInput />}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                  <select 
                    value={selectedRoomType || ''}
                    onChange={(e) => updateState({ selectedRoomType: e.target.value })}
                    className="w-full bg-white rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Room Types</option>
                    {roomTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adults</label>
                  <select 
                    value={adults}
                    onChange={(e) => updateState({ adults: parseInt(e.target.value) })}
                    className="w-full bg-white rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Adult' : 'Adults'}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
                  <select 
                    value={children}
                    onChange={(e) => updateState({ children: parseInt(e.target.value) })}
                    className="w-full bg-white rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[0, 1, 2, 3, 4].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Child' : 'Children'}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-center mt-6">
                <button
                  onClick={checkRoomAvailability}
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg font-semibold shadow-md hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 transform hover:-translate-y-1 flex items-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Checking...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Check Availability
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Available Rooms Section */}
        <section id="rooms" className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Available Rooms</h2>
              {hasSearched && startDate && endDate && (
                <p className="text-gray-600 mt-2">
                  {availableRooms.length} room{availableRooms.length !== 1 ? 's' : ''} available
                  {selectedRoomType && getRoomTypeName() && ` in ${getRoomTypeName()} category`}
                  {` for ${calculateNights(startDate, endDate)} night${calculateNights(startDate, endDate) !== 1 ? 's' : ''}`}
                </p>
              )}
            </div>
            {availableRooms.length > 0 && (
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                Total: {availableRooms.length}
              </div>
            )}
          </div>
          
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 text-red-700 p-6 rounded-lg max-w-md mx-auto">
                <svg className="w-12 h-12 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-medium mb-2">Error loading rooms</p>
                <p className="mb-4">{error}</p>
                <button 
                  onClick={checkRoomAvailability}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : hasSearched && availableRooms.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-yellow-50 text-yellow-700 p-6 rounded-lg max-w-md mx-auto">
                <svg className="w-12 h-12 mx-auto mb-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-medium mb-2">No rooms available</p>
                <p className="mb-4">No rooms available for the selected dates and filters</p>
                <button 
                  onClick={clearSearch}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          ) : !hasSearched ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-4 0H9m4 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10m4 0h4m-4 0V7" />
              </svg>
              <p className="text-lg text-gray-500">Please select dates and click "Check Availability" to see available rooms</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {availableRooms.map((room) => (
                <RoomCard 
                  key={room.id} 
                  room={room} 
                  startDate={startDate}
                  endDate={endDate}
                  isLoggedIn={isLoggedIn}
                  onImageError={(e) => {
                    e.target.src = 'https://picsum.photos/800/600?hotel';
                  }}
                />
              ))}
            </div>
          )}
        </section>

        <AmenitiesSection />
        <ContactSection />
      </main>

      <Footer />

      <AuthModal 
        showAuthModal={showAuthModal}
        authMode={authMode}
        toggleAuthModal={toggleAuthModal}
        handleAuth={handleAuth}
        loading={loading}
      />
    </div>
  );
};

export default LandingPage;