// src/components/LandingPage/LandingPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';

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
    loading: true,
    error: null,
    dateRange: [null, null],
    selectedRoomType: null,
    roomTypes: [],
    adults: 1,
    children: 0,
    showAuthModal: false,
    authMode: 'login'
  });

  const {
    availableRooms, loading, error,
    dateRange, selectedRoomType, roomTypes, adults, children,
    showAuthModal, authMode
  } = state;

  const [startDate, endDate] = dateRange;

  // Helper function to update state
  const updateState = (newState) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  // Fetch room types
  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
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

  // Check availability when filters change
  useEffect(() => {
    if (startDate && endDate) {
      checkRoomAvailability();
    }
  }, [startDate, endDate, adults, children, selectedRoomType]);

  const checkRoomAvailability = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both check-in and check-out dates');
      return;
    }
    
    try {
      updateState({ loading: true, error: null });
      
      const checkIn = startDate.toISOString().split('T')[0];
      const checkOut = endDate.toISOString().split('T')[0];
      
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
      
      if (!response.ok) {
        const errorMessage = data.message || data.error || 'Failed to check availability';
        throw new Error(errorMessage);
      }
      
      let availableRoomsData = [];
      if (data.success && data.data && Array.isArray(data.data.rooms)) {
        availableRoomsData = data.data.rooms;
      } else if (Array.isArray(data.data)) {
        availableRoomsData = data.data;
      } else if (Array.isArray(data)) {
        availableRoomsData = data;
      }
      
      const enrichedRooms = availableRoomsData.map(room => {
        const roomTypeId = room.type?.id || room.type_id;
        const roomTypeInfo = roomTypes.find(type => type.id === roomTypeId);
        
        return {
          id: room.id || room.room_id,
          room_number: room.number || room.room_number,
          floor: room.floor,
          status: room.status,
          type: {
            type_id: roomTypeId,
            name: room.type?.name || roomTypeInfo?.name,
            base_price: room.pricing?.base_price || room.type?.base_price || roomTypeInfo?.base_price,
            description: room.type?.description || roomTypeInfo?.description,
            capacity: room.type?.capacity || roomTypeInfo?.capacity,
            image_url: roomTypeInfo ? getImageUrl(roomTypeInfo.image_url) : 'https://picsum.photos/800/600?hotel'
          },
          pricing: room.pricing,
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
      return Math.round(Math.abs(new Date(checkOut) - new Date(checkIn)) / oneDay);
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
      // Navigate to login page after successful logout
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

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

      <main className="flex-grow container mx-auto px-4 py-12">
        <RoomFilter 
          dateRange={dateRange}
          setDateRange={(dates) => updateState({ dateRange: dates })}
          selectedRoomType={selectedRoomType}
          setSelectedRoomType={(type) => updateState({ selectedRoomType: type })}
          adults={adults}
          setAdults={(num) => updateState({ adults: num })}
          children={children}
          setChildren={(num) => updateState({ children: num })}
          roomTypes={roomTypes}
          checkRoomAvailability={checkRoomAvailability}
          loading={loading}
        />

        {/* Available Rooms Section */}
        <section id="rooms" className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Available Rooms</h2>
              <p className="text-gray-600">
                {availableRooms.length} room{availableRooms.length !== 1 ? 's' : ''} available
                {selectedRoomType && getRoomTypeName() && ` in ${getRoomTypeName()} category`}
                {startDate && endDate && ` for ${calculateNights(startDate, endDate)} night${calculateNights(startDate, endDate) !== 1 ? 's' : ''}`}
              </p>
            </div>
            {availableRooms.length > 0 && (
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                Total: {availableRooms.length}
              </div>
            )}
          </div>
          
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <p className="text-lg">Error loading rooms: {error}</p>
              <button 
                onClick={checkRoomAvailability}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Try Again
              </button>
            </div>
          ) : availableRooms.length === 0 && startDate && endDate ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No rooms available for the selected dates and filters</p>
              <button 
                onClick={() => updateState({
                  selectedRoomType: null,
                  dateRange: [null, null]
                })}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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