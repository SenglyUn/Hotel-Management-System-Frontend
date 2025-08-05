import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBed, FaWifi, FaSwimmingPool, FaTv, 
  FaSnowflake, FaGlassMartiniAlt, FaUser, 
  FaSignInAlt, FaSignOutAlt, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaCalendarAlt, FaSearch, FaStar, FaRegSnowflake, FaRegStar,
  FaUtensils, FaConciergeBell, FaParking,
  FaCheck, FaTimes // Added missing icons
} from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const API_BASE_URL = 'http://localhost:5000';

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Handle absolute URLs
  if (imagePath.startsWith('http')) return imagePath;
  
  // Handle local server paths (both with and without leading slash)
  if (imagePath.startsWith('/uploads') || imagePath.startsWith('uploads')) {
    // Ensure we have exactly one leading slash
    const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${API_BASE_URL}${normalizedPath}`;
  }
  
  // Handle other relative paths
  return `${API_BASE_URL}/${imagePath.replace(/^\/+/, '')}`;
};

// Add LoadingSkeleton component
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
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Check auth status
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('userData');
    if (token && storedUser) {
      setIsLoggedIn(true);
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  // Fetch data with proper image handling
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [roomsRes, typesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/rooms?page=${currentPage}`),
          fetch(`${API_BASE_URL}/api/room-types?page=1&limit=10`)
        ]);

        if (!roomsRes.ok) throw new Error('Failed to fetch rooms');
        if (!typesRes.ok) throw new Error('Failed to fetch room types');

        const roomsData = await roomsRes.json();
        const typesData = await typesRes.json();

        // Create a map of room types for quick lookup
        const roomTypesMap = {};
        typesData.data.items.forEach(type => {
          roomTypesMap[type.type_id] = {
            ...type,
            image: getImageUrl(type.image_url)
          };
        });

        // Process rooms with their images
        const processedRooms = roomsData.data.map(room => {
          const roomType = roomTypesMap[room.type?.type_id] || room.type;
          
          return {
            ...room,
            id: room.room_id,
            name: room.room_number,
            image: getImageUrl(room.image_url) || roomType?.image,
            type: roomType,
            statusDisplay: room.status ? 
              room.status.charAt(0).toUpperCase() + room.status.slice(1) : 
              'Unknown'
          };
        });

        setRooms(processedRooms);
        setFilteredRooms(processedRooms);
        setRoomTypes(typesData.data.items);
        setTotalPages(roomsData.pagination?.total_pages || 1);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage]);

  // Define filterRooms function
  const filterRooms = () => {
    let result = [...rooms];
    
    if (selectedRoomType) {
      result = result.filter(room => 
        room.type?.type_id === parseInt(selectedRoomType)
      );
    }
    
    if (startDate && endDate) {
      // Add date filtering logic when your API supports it
    }
    
    setFilteredRooms(result);
  };

  useEffect(() => {
    filterRooms();
  }, [selectedRoomType, startDate, endDate, rooms]);

  const renderFeatureIcon = (feature, value) => {
    const icons = {
      wifi: <FaWifi className={value ? "text-blue-500" : "text-gray-300"} />,
      tv: <FaTv className={value ? "text-blue-500" : "text-gray-300"} />,
      ac: value ? <FaSnowflake className="text-blue-500" /> : <FaRegSnowflake className="text-gray-300" />,
      minibar: <FaGlassMartiniAlt className={value ? "text-blue-500" : "text-gray-300"} />
    };
    return icons[feature] || null;
  };

  const RoomCard = ({ room, index }) => {
    // Use room image if available, otherwise use room type image
    const roomImage = room.image || room.type?.image;
    const roomTypeName = room.type?.name || 'Standard Room';

    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        <div className="relative h-56 overflow-hidden">
          {roomImage ? (
            <img 
              src={roomImage}
              alt={`${roomTypeName} Room`}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              loading="lazy"
              crossOrigin="anonymous"
              onError={(e) => {
                e.target.src = 'https://source.unsplash.com/random/800x600/?hotel-room';
                e.target.onerror = null;
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Image not available</span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-white font-bold text-xl">Room {room.room_number}</h3>
                <p className="text-white/90">{roomTypeName}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                room.status === 'available' ? 'bg-green-100 text-green-800' :
                room.status === 'maintenance' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {room.statusDisplay}
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-5 flex-grow flex flex-col">
          <div className="flex-grow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-gray-600 text-sm">{room.type?.description || 'Comfortable room'}</p>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <FaBed className="mr-1" />
                  <span>{room.type?.bed_type || 'Standard Bed'}</span>
                </div>
              </div>
              <p className="text-blue-600 font-bold text-xl whitespace-nowrap">
                ${room.type?.base_price || '0'}
                <span className="text-sm font-normal text-gray-500"> /night</span>
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                {room.type?.size || 'N/A'}
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Sleeps {room.type?.capacity || '1'}
              </div>
            </div>
            
            {room.features && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
                <div className="flex space-x-3">
                  {Object.entries(room.features).map(([feature, value]) => (
                    <div key={feature} className="flex flex-col items-center">
                      {value ? (
                        <>
                          <FaCheck className="text-green-500" />
                          <span className="text-xs mt-1 capitalize">{feature}</span>
                        </>
                      ) : (
                        <>
                          <FaTimes className="text-gray-300" />
                          <span className="text-xs mt-1 capitalize text-gray-400">{feature}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {room.amenities?.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Amenities:</p>
                <div className="flex flex-wrap gap-1">
                  {room.amenities.map(amenity => (
                    <span key={amenity.amenity_id} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                      {amenity.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => navigate(`/book?room=${room.room_id}`)}
            disabled={room.status !== 'available'}
            className={`w-full py-2 rounded-lg font-medium transition ${
              room.status === 'available' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {room.status === 'available' ? 'Book Now' : 'Not Available'}
          </button>
        </div>
      </div>
    );
  };

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
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center space-x-1 text-blue-700 hover:text-blue-900"
                >
                  <FaUser className="text-lg" />
                  <span>Dashboard</span>
                </button>
                <button 
                  onClick={() => {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userData');
                    setIsLoggedIn(false);
                    navigate('/');
                  }}
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

      {/* Hero */}
      <section className="relative bg-gray-900 text-white h-96 md:h-[500px]">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-blue-800/50"></div>
        <img 
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&h=900"
          alt="Luxury hotel rooms" 
          className="w-full h-full object-cover"
          loading="lazy"
          crossOrigin="anonymous"
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
        {/* Room Filter */}
        <section className="mb-12 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  {roomTypes.map(type => (
                    <option key={type.type_id} value={type.type_id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>1 Adult</option>
                  <option>2 Adults</option>
                  <option>Family (2+2)</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={filterRooms}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2"
            >
              <FaSearch />
              Search Rooms
            </button>
          </div>
        </section>

        {/* Rooms */}
        <section id="rooms" className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Our Rooms & Suites</h2>
              <p className="text-gray-600">
                {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} available
                {selectedRoomType && ` in ${roomTypes.find(t => t.type_id === parseInt(selectedRoomType))?.name} category`}
              </p>
            </div>
          </div>
          
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <p className="text-lg">Error loading rooms: {error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRooms.map((room, index) => (
                  <RoomCard key={room.room_id} room={room} index={index} />
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300'}`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
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