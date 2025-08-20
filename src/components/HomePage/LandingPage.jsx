// import React, { useEffect, useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { 
//   FaBed, FaWifi, FaSwimmingPool, FaTv, 
//   FaSnowflake, FaGlassMartiniAlt, FaUser, 
//   FaSignInAlt, FaSignOutAlt, FaPhone, FaEnvelope, FaMapMarkerAlt,
//   FaCalendarAlt, FaSearch, FaStar, FaRegSnowflake, FaRegStar,
//   FaUtensils, FaConciergeBell, FaParking,
//   FaCheck, FaTimes, FaHome, FaBookmark
// } from 'react-icons/fa';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const API_BASE_URL = 'http://localhost:5000';

// // Enhanced auth service with better error handling
// const authService = {
//   register: async (userData) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(userData),
//       });

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.message || 'Registration failed');
      
//       toast.success('Registration successful!');
//       return data;
//     } catch (error) {
//       toast.error(error.message);
//       throw error;
//     }
//   },

//   login: async (credentials) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         credentials: 'include',
//         body: JSON.stringify(credentials),
//       });

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.message || 'Login failed');
      
//       toast.success(`Welcome back, ${data.user?.firstName || 'User'}!`);
//       return data;
//     } catch (error) {
//       toast.error(error.message);
//       throw error;
//     }
//   },

//   getCurrentUser: async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
//         credentials: 'include',
//       });

//       if (!response.ok) throw new Error('Session expired');
//       return await response.json();
//     } catch (error) {
//       throw error;
//     }
//   },

//   logout: async () => {
//     try {
//       await fetch(`${API_BASE_URL}/api/auth/logout`, {
//         method: 'POST',
//         credentials: 'include',
//       });
//       toast.success('Logged out successfully');
//     } catch (error) {
//       toast.error('Logout failed');
//     }
//   }
// };

// // Enhanced image handler with caching
// const getImageUrl = (imagePath) => {
//   if (!imagePath) return 'https://source.unsplash.com/random/800x600/?hotel-room';
  
//   if (imagePath.startsWith('http')) return imagePath;
  
//   if (imagePath.startsWith('/uploads') || imagePath.startsWith('uploads')) {
//     const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
//     return `${API_BASE_URL}${normalizedPath}`;
//   }
  
//   return `${API_BASE_URL}/${imagePath.replace(/^\/+/, '')}`;
// };

// const LoadingSkeleton = () => (
//   <div className="grid md:grid-cols-3 gap-6">
//     {[...Array(6)].map((_, i) => (
//       <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse h-full">
//         <div className="h-56 bg-gray-200"></div>
//         <div className="p-5 space-y-4">
//           <div className="h-5 bg-gray-200 rounded w-3/4"></div>
//           <div className="h-4 bg-gray-200 rounded w-1/2"></div>
//           <div className="h-4 bg-gray-200 rounded"></div>
//           <div className="h-4 bg-gray-200 rounded w-5/6"></div>
//           <div className="h-10 bg-gray-200 rounded"></div>
//         </div>
//       </div>
//     ))}
//   </div>
// );

// const LandingPage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [state, setState] = useState({
//     availableRooms: [],
//     loading: true,
//     error: null,
//     isLoggedIn: false,
//     userData: null,
//     dateRange: [null, null],
//     selectedRoomType: null,
//     roomTypes: [],
//     adults: 1,
//     children: 0,
//     showAuthModal: false,
//     authMode: 'login' // 'login' or 'register'
//   });

//   const {
//     availableRooms, loading, error, isLoggedIn, userData,
//     dateRange, selectedRoomType, roomTypes, adults, children,
//     showAuthModal, authMode
//   } = state;

//   const [startDate, endDate] = dateRange;

//   // Check auth status and handle redirects
//   useEffect(() => {
//     const checkAuthAndRedirect = async () => {
//       try {
//         const data = await authService.getCurrentUser();
//         if (data.user) {
//           setState(prev => ({
//             ...prev,
//             isLoggedIn: true,
//             userData: data.user,
//             loading: false
//           }));
          
//           // If coming from auth page, redirect to appropriate dashboard
//           if (location.state?.fromAuth) {
//             if (data.user.role === 'guest') {
//               navigate('/', { replace: true });
//             } else {
//               navigate('/home', { replace: true });
//             }
//           }
//         }
//       } catch (error) {
//         setState(prev => ({ ...prev, isLoggedIn: false, userData: null, loading: false }));
//       }
//     };

//     checkAuthAndRedirect();
//   }, [navigate, location.state]);

//   // Auth handlers
//   const handleAuth = async (credentials, isRegister = false) => {
//     try {
//       setState(prev => ({ ...prev, loading: true }));
      
//       const data = isRegister 
//         ? await authService.register(credentials)
//         : await authService.login(credentials);

//       if (data.user) {
//         setState(prev => ({
//           ...prev,
//           isLoggedIn: true,
//           userData: data.user,
//           showAuthModal: false,
//           loading: false
//         }));

//         // Redirect based on role
//         if (data.user.role === 'guest') {
//           navigate('/', { state: { fromAuth: true } });
//         } else {
//           navigate('/home', { state: { fromAuth: true } });
//         }
//       }
//     } catch (error) {
//       setState(prev => ({ ...prev, error: error.message, loading: false }));
//     }
//   };

//   const handleLogout = async () => {
//     await authService.logout();
//     setState(prev => ({
//       ...prev,
//       isLoggedIn: false,
//       userData: null
//     }));
//     navigate('/');
//   };

//   // Room management
//   useEffect(() => {
//     const fetchRoomTypes = async () => {
//       try {
//         const response = await fetch(`${API_BASE_URL}/api/room-types`, {
//           credentials: 'include'
//         });
        
//         if (!response.ok) throw new Error('Failed to fetch room types');
        
//         const data = await response.json();
//         const types = Array.isArray(data.data) ? data.data : 
//                      Array.isArray(data.data?.items) ? data.data.items : [];
        
//         setState(prev => ({
//           ...prev,
//           roomTypes: types.map(type => ({
//             ...type,
//             image_url: type.image_url || 'https://source.unsplash.com/random/800x600/?hotel-room'
//           })),
//           loading: false
//         }));
//       } catch (err) {
//         setState(prev => ({
//           ...prev,
//           error: err.message,
//           roomTypes: [],
//           loading: false
//         }));
//       }
//     };
    
//     fetchRoomTypes();
//   }, []);

//   // Check availability when filters change
//   useEffect(() => {
//     if (startDate && endDate) {
//       checkRoomAvailability();
//     }
//   }, [startDate, endDate, adults, children, selectedRoomType]);

//   const checkRoomAvailability = async () => {
//     if (!startDate || !endDate) return;
    
//     try {
//       setState(prev => ({ ...prev, loading: true, error: null }));
      
//       const checkIn = startDate.toISOString().split('T')[0];
//       const checkOut = endDate.toISOString().split('T')[0];
      
//       const url = new URL(`${API_BASE_URL}/api/Reservations/availability/rooms`);
//       url.searchParams.append('check_in', checkIn);
//       url.searchParams.append('check_out', checkOut);
//       url.searchParams.append('adults', adults);
//       url.searchParams.append('children', children);
      
//       if (selectedRoomType) {
//         url.searchParams.append('type_id', selectedRoomType);
//       }
      
//       const response = await fetch(url, { credentials: 'include' });
//       if (!response.ok) throw new Error('Failed to check availability');
      
//       const data = await response.json();
      
//       setState(prev => ({
//         ...prev,
//         availableRooms: (data.data?.available_rooms || []).map(room => ({
//           ...room,
//           type: {
//             ...(room.type || {}),
//             image_url: room.type?.image_url || 'https://source.unsplash.com/random/800x600/?hotel-room'
//           }
//         })),
//         loading: false
//       }));
//     } catch (err) {
//       setState(prev => ({
//         ...prev,
//         error: err.message || 'Failed to check availability',
//         availableRooms: [],
//         loading: false
//       }));
//     }
//   };

//   // Enhanced RoomCard component
//   const RoomCard = ({ room }) => {
//     const roomType = room.type || {};
//     const amenities = room.amenities || [];
//     const nights = calculateNights(startDate, endDate) || 1;
//     const totalPrice = parseFloat(room.total_price) || parseFloat(roomType.base_price) * nights;
//     const [imageSrc, setImageSrc] = useState(getImageUrl(roomType.image_url));

//     const handleImageError = () => {
//       setImageSrc('https://source.unsplash.com/random/800x600/?hotel-room');
//     };

//     const handleBookNow = () => {
//       if (!isLoggedIn) {
//         setState(prev => ({ ...prev, showAuthModal: true, authMode: 'login' }));
//         toast.info('Please login to book a room');
//         return;
//       }
//       navigate(`/book?room=${room.room_id}&check_in=${startDate.toISOString()}&check_out=${endDate.toISOString()}`);
//     };

//     return (
//       <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
//         {/* Room image with favorite button */}
//         <div className="relative h-56 overflow-hidden">
//           <img 
//             src={imageSrc}
//             alt={`${roomType.name || 'Hotel'} Room`}
//             className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
//             loading="lazy"
//             onError={handleImageError}
//           />
//           <button 
//             className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white"
//             onClick={(e) => {
//               e.stopPropagation();
//               toast.success('Added to favorites!');
//             }}
//           >
//             <FaBookmark className="text-gray-700 hover:text-red-500" />
//           </button>
//           <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
//             <div className="flex justify-between items-end">
//               <div>
//                 <h3 className="text-white font-bold text-xl">Room {room.room_number || 'N/A'}</h3>
//                 <p className="text-white/90">{roomType.name || 'Standard Room'}</p>
//               </div>
//               <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                 Available
//               </span>
//             </div>
//           </div>
//         </div>
        
//         {/* Room details */}
//         <div className="p-5 flex-grow flex flex-col">
//           <div className="flex-grow">
//             <div className="flex justify-between items-start mb-3">
//               <div>
//                 <p className="text-gray-600 text-sm">{roomType.description || 'Comfortable room'}</p>
//                 <div className="flex items-center mt-1 text-sm text-gray-500">
//                   <FaUser className="mr-1" />
//                   <span>Capacity: {roomType.capacity || 2}</span>
//                 </div>
//               </div>
//               <p className="text-blue-600 font-bold text-xl whitespace-nowrap">
//                 ${roomType.base_price || '0'}
//                 <span className="text-sm font-normal text-gray-500"> /night</span>
//               </p>
//             </div>
            
//             <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
//               <div className="flex items-center">
//                 <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
//                 Floor: {room.floor || 'N/A'}
//               </div>
//               <div className="flex items-center">
//                 <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
//                 Nights: {nights}
//               </div>
//             </div>
            
//             {amenities.length > 0 && (
//               <div className="mb-4">
//                 <p className="text-sm font-medium text-gray-700 mb-1">Amenities:</p>
//                 <div className="flex flex-wrap gap-1">
//                   {amenities.map(amenity => (
//                     <span key={amenity.amenity_id} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
//                       {amenity.name}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
          
//           <div className="flex justify-between items-center mb-4">
//             <div>
//               <p className="text-sm text-gray-600">Total for {nights} night{nights !== 1 ? 's' : ''}:</p>
//               <p className="text-lg font-bold text-blue-600">${totalPrice.toFixed(2)}</p>
//             </div>
//             <button 
//               onClick={handleBookNow}
//               className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
//             >
//               {isLoggedIn ? 'Book Now' : 'Login to Book'}
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Helper functions
//   const calculateNights = (checkIn, checkOut) => {
//       if (!checkIn || !checkOut) return 0;
//       const oneDay = 24 * 60 * 60 * 1000;
//       return Math.round(Math.abs(new Date(checkOut) - new Date(checkIn)) / oneDay);
//   };

//   const toggleAuthModal = (mode = 'login') => {
//     setState(prev => ({
//       ...prev,
//       showAuthModal: !prev.showAuthModal,
//       authMode: mode
//     }));
//   };

//   // Render
//   return (
//     <div className="min-h-screen flex flex-col bg-gray-50">
//       {/* Header with dynamic navigation */}
//       <header className="bg-white shadow-sm sticky top-0 z-50">
//         <div className="container mx-auto px-4 py-4 flex justify-between items-center">
//           <div 
//             className="text-2xl font-bold text-blue-800 flex items-center cursor-pointer"
//             onClick={() => navigate('/')}
//           >
//             <FaBed className="mr-2" />
//             MOON HOTEL
//           </div>
          
//           <nav className="flex items-center space-x-6">
//             <button 
//               onClick={() => document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' })}
//               className="text-gray-700 hover:text-blue-600 transition"
//             >
//               Rooms
//             </button>
//             <button 
//               onClick={() => document.getElementById('amenities')?.scrollIntoView({ behavior: 'smooth' })}
//               className="text-gray-700 hover:text-blue-600 transition"
//             >
//               Amenities
//             </button>
//             <button 
//               onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
//               className="text-gray-700 hover:text-blue-600 transition"
//             >
//               Contact
//             </button>
            
//             {isLoggedIn ? (
//               <div className="flex items-center space-x-4">
//                 <div className="flex items-center space-x-2">
//                   <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
//                     <FaUser className="text-blue-600" />
//                   </div>
//                   <span className="text-blue-700">{userData?.firstName || 'User'}</span>
//                 </div>
//                 <button 
//                   onClick={() => navigate(userData?.role === 'guest' ? '/' : '/home')}
//                   className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition"
//                 >
//                   <FaHome className="text-lg" />
//                   <span>Dashboard</span>
//                 </button>
//                 <button 
//                   onClick={handleLogout}
//                   className="flex items-center space-x-1 text-red-600 hover:text-red-800 transition"
//                 >
//                   <FaSignOutAlt className="text-lg" />
//                   <span>Logout</span>
//                 </button>
//               </div>
//             ) : (
//               <div className="flex items-center space-x-4">
//                 <button 
//                   onClick={() => toggleAuthModal('login')}
//                   className="flex items-center space-x-1 text-blue-700 hover:text-blue-900 transition"
//                 >
//                   <FaSignInAlt className="text-lg" />
//                   <span>Login</span>
//                 </button>
//                 <button 
//                   onClick={() => toggleAuthModal('register')}
//                   className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
//                 >
//                   Sign Up
//                 </button>
//               </div>
//             )}
//           </nav>
//         </div>
//       </header>

//       {/* Hero Section */}
//       <section className="relative bg-gray-900 text-white h-96 md:h-[500px]">
//         <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-blue-800/50"></div>
//         <img 
//           src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&h=900"
//           alt="Luxury hotel rooms" 
//           className="w-full h-full object-cover"
//           loading="lazy"
//           onError={(e) => {
//             e.target.src = 'https://source.unsplash.com/random/1600x900/?hotel';
//           }}
//         />
//         <div className="container mx-auto px-4 absolute inset-0 flex flex-col justify-center items-center text-center">
//           <h2 className="text-3xl md:text-5xl font-bold mb-4">Experience Luxury Redefined</h2>
//           <p className="text-xl mb-8 max-w-2xl">Discover unparalleled comfort in our meticulously designed accommodations</p>
//           <div className="flex flex-col sm:flex-row gap-4">
//             <button 
//               onClick={() => isLoggedIn ? navigate('/book') : toggleAuthModal('login')}
//               className="px-8 py-3 bg-white text-blue-700 rounded-lg hover:bg-gray-100 transition font-medium"
//             >
//               {isLoggedIn ? 'Book Your Stay' : 'Login to Book'}
//             </button>
//             <button 
//               onClick={() => document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' })}
//               className="px-8 py-3 border-2 border-white rounded-lg hover:bg-white/10 transition font-medium"
//             >
//               Explore Rooms
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* Main Content */}
//       <main className="flex-grow container mx-auto px-4 py-12">
//         {/* Room Filter Section */}
//         <section className="mb-12 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//           <div className="flex flex-col md:flex-row gap-4 items-end">
//             <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
//               {/* Date Picker */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Check In - Check Out</label>
//                 <DatePicker
//                   selectsRange
//                   startDate={startDate}
//                   endDate={endDate}
//                   onChange={(dates) => setState(prev => ({ ...prev, dateRange: dates }))}
//                   minDate={new Date()}
//                   placeholderText="Select dates"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
              
//               {/* Room Type Selector */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
//                 <select
//                   value={selectedRoomType || ''}
//                   onChange={(e) => setState(prev => ({ ...prev, selectedRoomType: e.target.value || null }))}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">All Room Types</option>
//                   {roomTypes.map(type => (
//                     <option key={type.type_id} value={type.type_id}>
//                       {type.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
              
//               {/* Adults Selector */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Adults</label>
//                 <select
//                   value={adults}
//                   onChange={(e) => setState(prev => ({ ...prev, adults: parseInt(e.target.value) }))}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   {[1, 2, 3, 4, 5].map(num => (
//                     <option key={num} value={num}>{num} Adult{num !== 1 ? 's' : ''}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Children Selector */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
//                 <select
//                   value={children}
//                   onChange={(e) => setState(prev => ({ ...prev, children: parseInt(e.target.value) }))}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   {[0, 1, 2, 3, 4].map(num => (
//                     <option key={num} value={num}>{num} Child{num !== 1 ? 'ren' : ''}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>
            
//             <button
//               onClick={checkRoomAvailability}
//               disabled={!startDate || !endDate}
//               className={`px-6 py-3 text-white rounded-lg font-medium flex items-center gap-2 transition ${
//                 !startDate || !endDate 
//                   ? 'bg-gray-400 cursor-not-allowed' 
//                   : 'bg-blue-600 hover:bg-blue-700'
//               }`}
//             >
//               <FaSearch />
//               Check Availability
//             </button>
//           </div>
//         </section>

//         {/* Available Rooms Section */}
//         <section id="rooms" className="mb-16">
//           <div className="flex justify-between items-center mb-8">
//             <div>
//               <h2 className="text-3xl font-bold text-gray-800">Available Rooms</h2>
//               <p className="text-gray-600">
//                 {availableRooms.length} room{availableRooms.length !== 1 ? 's' : ''} available
//                 {selectedRoomType && ` in ${roomTypes.find(t => t.type_id === parseInt(selectedRoomType))?.name} category`}
//                 {startDate && endDate && ` for ${calculateNights(startDate, endDate)} night${calculateNights(startDate, endDate) !== 1 ? 's' : ''}`}
//               </p>
//             </div>
//           </div>
          
//           {loading ? (
//             <LoadingSkeleton />
//           ) : error ? (
//             <div className="text-center py-12 text-red-500">
//               <p className="text-lg">Error loading rooms: {error}</p>
//               <button 
//                 onClick={checkRoomAvailability}
//                 className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//               >
//                 Try Again
//               </button>
//             </div>
//           ) : availableRooms.length === 0 && startDate && endDate ? (
//             <div className="text-center py-12 text-gray-500">
//               <p className="text-lg">No rooms available for the selected dates and filters</p>
//               <button 
//                 onClick={() => setState(prev => ({
//                   ...prev,
//                   selectedRoomType: null,
//                   dateRange: [null, null]
//                 }))}
//                 className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//               >
//                 Clear Filters
//               </button>
//             </div>
//           ) : (
//             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {availableRooms.map((room) => (
//                 <RoomCard key={room.room_id} room={room} />
//               ))}
//             </div>
//           )}
//         </section>

//         {/* Amenities Section */}
//         <section id="amenities" className="mb-16">
//           <h2 className="text-3xl font-bold text-gray-800 mb-8">Our Amenities</h2>
//           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
//             {[
//               { icon: <FaWifi size={24} />, name: 'Free WiFi', description: 'High-speed internet access throughout the hotel' },
//               { icon: <FaSwimmingPool size={24} />, name: 'Swimming Pool', description: 'Outdoor pool with panoramic views' },
//               { icon: <FaUtensils size={24} />, name: 'Restaurant', description: 'Gourmet dining with local and international cuisine' },
//               { icon: <FaParking size={24} />, name: 'Parking', description: 'Secure underground parking available' },
//               { icon: <FaConciergeBell size={24} />, name: '24/7 Concierge', description: 'Our staff is always available to assist you' },
//               { icon: <FaTv size={24} />, name: 'Entertainment', description: 'Premium TV channels and streaming services' },
//               { icon: <FaSnowflake size={24} />, name: 'Air Conditioning', description: 'Individual climate control in all rooms' },
//               { icon: <FaGlassMartiniAlt size={24} />, name: 'Bar & Lounge', description: 'Relax with our signature cocktails' }
//             ].map((amenity, index) => (
//               <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
//                 <div className="text-blue-600 mb-3">{amenity.icon}</div>
//                 <h3 className="font-bold text-lg mb-1">{amenity.name}</h3>
//                 <p className="text-gray-600">{amenity.description}</p>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* Contact Section */}
//         <section id="contact" className="mb-16">
//           <h2 className="text-3xl font-bold text-gray-800 mb-8">Contact Us</h2>
//           <div className="grid md:grid-cols-2 gap-8">
//             <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//               <h3 className="font-bold text-xl mb-4">Get in Touch</h3>
//               <div className="space-y-4">
//                 <div className="flex items-start space-x-3">
//                   <FaMapMarkerAlt className="text-blue-600 mt-1" />
//                   <div>
//                     <h4 className="font-medium">Address</h4>
//                     <p className="text-gray-600">123 Luxury Street, Phnom Penh, Cambodia</p>
//                   </div>
//                 </div>
//                 <div className="flex items-start space-x-3">
//                   <FaPhone className="text-blue-600 mt-1" />
//                   <div>
//                     <h4 className="font-medium">Phone</h4>
//                     <p className="text-gray-600">+855 23 456 7890</p>
//                   </div>
//                 </div>
//                 <div className="flex items-start space-x-3">
//                   <FaEnvelope className="text-blue-600 mt-1" />
//                   <div>
//                     <h4 className="font-medium">Email</h4>
//                     <p className="text-gray-600">info@moonhotel.com</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//               <h3 className="font-bold text-xl mb-4">Send Us a Message</h3>
//               <form className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
//                   <input 
//                     type="text" 
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Enter your name"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
//                   <input 
//                     type="email" 
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Enter your email"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
//                   <textarea 
//                     rows="4"
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Enter your message"
//                   ></textarea>
//                 </div>
//                 <button 
//                   type="submit"
//                   className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//                 >
//                   Send Message
//                 </button>
//               </form>
//             </div>
//           </div>
//         </section>
//       </main>

//       {/* Footer */}
//       <footer className="bg-gray-800 text-white py-12">
//         <div className="container mx-auto px-4">
//           <div className="grid md:grid-cols-4 gap-8 mb-8">
//             <div>
//               <h3 className="text-xl font-bold mb-4 flex items-center">
//                 <FaBed className="mr-2" />
//                 MOON HOTEL
//               </h3>
//               <p className="mb-4">Luxury redefined in the heart of Phnom Penh</p>
//               <div className="flex space-x-4">
//                 <a href="#" className="hover:text-blue-300 transition">Facebook</a>
//                 <a href="#" className="hover:text-blue-300 transition">Instagram</a>
//                 <a href="#" className="hover:text-blue-300 transition">Twitter</a>
//               </div>
//             </div>
            
//             <div>
//               <h4 className="font-bold mb-4">Quick Links</h4>
//               <ul className="space-y-2">
//                 <li><button onClick={() => document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-blue-300 transition">Rooms & Suites</button></li>
//                 <li><button onClick={() => document.getElementById('amenities')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-blue-300 transition">Amenities</button></li>
//                 <li><button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-blue-300 transition">Contact Us</button></li>
//                 <li><button onClick={() => navigate('/book')} className="hover:text-blue-300 transition">Special Offers</button></li>
//               </ul>
//             </div>
            
//             <div>
//               <h4 className="font-bold mb-4">Information</h4>
//               <ul className="space-y-2">
//                 <li><button onClick={() => navigate('/about')} className="hover:text-blue-300 transition">About Us</button></li>
//                 <li><button onClick={() => navigate('/careers')} className="hover:text-blue-300 transition">Careers</button></li>
//                 <li><button onClick={() => navigate('/privacy')} className="hover:text-blue-300 transition">Privacy Policy</button></li>
//                 <li><button onClick={() => navigate('/terms')} className="hover:text-blue-300 transition">Terms of Service</button></li>
//               </ul>
//             </div>
            
//             <div>
//               <h4 className="font-bold mb-4">Newsletter</h4>
//               <p className="mb-4">Subscribe for exclusive offers and updates</p>
//               <div className="flex">
//                 <input 
//                   type="email" 
//                   placeholder="Your email address" 
//                   className="px-4 py-2 rounded-l-lg w-full focus:outline-none text-gray-800" 
//                 />
//                 <button className="bg-blue-600 px-4 py-2 rounded-r-lg hover:bg-blue-700 transition">
//                   Subscribe
//                 </button>
//               </div>
//             </div>
//           </div>
          
//           <div className="pt-6 border-t border-gray-700 text-center text-gray-400">
//             <p>&copy; {new Date().getFullYear()} Moon Hotel. All rights reserved.</p>
//           </div>
//         </div>
//       </footer>

//       {/* Auth Modal (would be a separate component in a real app) */}
//       {showAuthModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white p-8 rounded-lg max-w-md w-full">
//             <h2 className="text-2xl font-bold mb-6 text-center">
//               {authMode === 'login' ? 'Login to Your Account' : 'Create an Account'}
//             </h2>
            
//             <form onSubmit={(e) => {
//               e.preventDefault();
//               const formData = new FormData(e.target);
//               const credentials = {
//                 email: formData.get('email'),
//                 password: formData.get('password')
//               };
//               if (authMode === 'register') {
//                 credentials.firstName = formData.get('firstName');
//                 credentials.lastName = formData.get('lastName');
//               }
//               handleAuth(credentials, authMode === 'register');
//             }}>
//               {authMode === 'register' && (
//                 <div className="grid grid-cols-2 gap-4 mb-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
//                     <input 
//                       name="firstName"
//                       type="text" 
//                       required
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
//                     <input 
//                       name="lastName"
//                       type="text" 
//                       required
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>
//                 </div>
//               )}
              
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//                 <input 
//                   name="email"
//                   type="email" 
//                   required
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
              
//               <div className="mb-6">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
//                 <input 
//                   name="password"
//                   type="password" 
//                   required
//                   minLength="6"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
              
//               <button 
//                 type="submit"
//                 className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition mb-4"
//               >
//                 {authMode === 'login' ? 'Login' : 'Register'}
//               </button>
              
//               <div className="text-center">
//                 <button 
//                   type="button"
//                   onClick={() => toggleAuthModal(authMode === 'login' ? 'register' : 'login')}
//                   className="text-blue-600 hover:text-blue-800 text-sm"
//                 >
//                   {authMode === 'login' 
//                     ? "Don't have an account? Register" 
//                     : "Already have an account? Login"}
//                 </button>
//               </div>
//             </form>
            
//             <button 
//               onClick={() => setState(prev => ({ ...prev, showAuthModal: false }))}
//               className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
//             >
//               <FaTimes />
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LandingPage;