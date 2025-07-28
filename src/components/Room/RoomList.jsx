import React from 'react';
import { FiSearch, FiPlus } from 'react-icons/fi';
import axios from 'axios';
import RoomTypeModal from './RoomTypeModal';
import RoomModal from './RoomModal';
import RoomTypeCard from './RoomTypeCard';
import RoomCard from './RoomCard';

const API_BASE_URL = 'http://localhost:5001';
const ROOM_TYPES_API = `${API_BASE_URL}/api/room-types`;
const ROOMS_API = `${API_BASE_URL}/api/rooms`;
const AVAILABILITY_API = `${API_BASE_URL}/api/rooms/availability/check`;

const getImageUrl = (imagePath) => {
  if (!imagePath) return "https://source.unsplash.com/800x600/?hotel-room";
  if (imagePath.startsWith("http")) return imagePath;
  
  const normalizedPath = imagePath.replace(/\\/g, "/");
  const cleanPath = normalizedPath.replace(/^\/+/, "");
  return `${API_BASE_URL}/${cleanPath}`;
};

const RoomList = () => {
  const [roomTypes, setRoomTypes] = React.useState([]);
  const [selectedRoomType, setSelectedRoomType] = React.useState(null);
  const [selectedRoom, setSelectedRoom] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [showRoomForm, setShowRoomForm] = React.useState(false);
  const [formMode, setFormMode] = React.useState('add');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch room types and rooms in parallel
      const [roomTypesResponse, roomsResponse] = await Promise.all([
        axios.get(ROOM_TYPES_API),
        axios.get(ROOMS_API)
      ]);

      const roomTypesData = roomTypesResponse.data.data || [];
      const roomsData = roomsResponse.data.data.rooms || [];

      // Process room types with their rooms
      const processedRoomTypes = roomTypesData.map(roomType => {
        // Filter rooms for this type
        const typeRooms = roomsData.filter(room => 
          room.room_type && room.room_type.id === roomType.id
        );

        // Count room statuses
        const availableCount = typeRooms.filter(r => r.status === 'available').length;
        const reservedCount = typeRooms.filter(r => r.status === 'reserved').length;
        const occupiedCount = typeRooms.length - availableCount - reservedCount;

        return {
          ...roomType,
          id: roomType.id,
          capacityDisplay: `${roomType.capacity} guest${roomType.capacity > 1 ? 's' : ''}`,
          priceDisplay: `$${roomType.price}/night`,
          totalRooms: typeRooms.length,
          availableRooms: availableCount,
          reservedRooms: reservedCount,
          occupiedRooms: occupiedCount,
          status: availableCount > 0 ? 'Available' : 
                 reservedCount > 0 ? 'Reserved' : 'Occupied',
          image: getImageUrl(roomType.image),
          rooms: typeRooms.map(room => ({
            ...room,
            id: room.id,
            name: room.name,
            image: getImageUrl(room.image),
            statusDisplay: room.status ? 
              room.status.charAt(0).toUpperCase() + room.status.slice(1) : 
              'Unknown',
            room_type: {
              ...room.room_type,
              image: getImageUrl(room.room_type.image)
            }
          }))
        };
      });

      setRoomTypes(processedRoomTypes);
      
      // Select first room type if none selected
      if (processedRoomTypes.length > 0 && !selectedRoomType) {
        setSelectedRoomType(processedRoomTypes[0]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoomType = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room type? All associated rooms will also be deleted.')) {
      return;
    }

    try {
      await axios.delete(`${ROOM_TYPES_API}/${id}`);
      await fetchData();
      if (selectedRoomType?.id === id) {
        setSelectedRoomType(null);
      }
    } catch (err) {
      console.error('Error deleting room type:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete room type');
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room?')) {
      return;
    }

    try {
      await axios.delete(`${ROOMS_API}/${id}`);
      await fetchData();
      if (selectedRoom?.id === id) {
        setSelectedRoom(null);
      }
    } catch (err) {
      console.error('Error deleting room:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete room');
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const filteredRoomTypes = roomTypes.filter(roomType =>
    roomType.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading room data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="mb-4">Error loading data: {error}</p>
          <button 
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!selectedRoomType && roomTypes.length > 0) {
    setSelectedRoomType(roomTypes[0]);
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {showAddForm && (
        <RoomTypeModal
          formMode={formMode}
          selectedRoomType={selectedRoomType}
          setShowAddForm={setShowAddForm}
          fetchData={fetchData}
          setError={setError}
        />
      )}

      {showRoomForm && (
        <RoomModal
          formMode={formMode}
          selectedRoom={selectedRoom}
          selectedRoomType={selectedRoomType}
          setShowRoomForm={setShowRoomForm}
          fetchData={fetchData}
          setError={setError}
        />
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="relative w-full md:w-96">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search room types..."
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button
              onClick={() => {
                setFormMode('add');
                setShowAddForm(true);
              }}
              className="h-10 flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-md text-sm"
            >
              <span className="text-lg">+</span> Add Room Type
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Room Type List */}
          <div className="lg:w-2/3 space-y-4">
            {filteredRoomTypes.length > 0 ? (
              filteredRoomTypes.map((roomType) => (
                <RoomTypeCard
                  key={roomType.id}
                  roomType={roomType}
                  isSelected={selectedRoomType?.id === roomType.id}
                  onSelect={() => setSelectedRoomType(roomType)}
                  onEdit={() => {
                    setFormMode('edit');
                    setSelectedRoomType(roomType);
                    setShowAddForm(true);
                  }}
                  onDelete={handleDeleteRoomType}
                />
              ))
            ) : (
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <p className="text-gray-600">No room types found matching your search.</p>
              </div>
            )}
          </div>

          {/* Room Type Details and Rooms List */}
          {selectedRoomType && (
            <div className="lg:w-1/3 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm sticky top-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-800">{selectedRoomType.name}</h2>
                  <button 
                    onClick={() => {
                      setFormMode('add');
                      setShowRoomForm(true);
                    }}
                    className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    <FiPlus size={14} /> Add Room
                  </button>
                </div>
                
                <div className="w-full h-48 mb-4">
                  <img
                    src={selectedRoomType.image}
                    alt={selectedRoomType.name}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = 'https://source.unsplash.com/800x600/?hotel-room';
                      e.target.onerror = null;
                    }}
                  />
                </div>
                
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span className="font-medium">Room Size:</span>
                    <span>{selectedRoomType.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Bed Type:</span>
                    <span>{selectedRoomType.bed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Capacity:</span>
                    <span>{selectedRoomType.capacityDisplay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Floor:</span>
                    <span>{selectedRoomType.floor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Availability:</span>
                    <span>
                      {selectedRoomType.availableRooms} available • 
                      {selectedRoomType.reservedRooms} reserved • 
                      {selectedRoomType.totalRooms} total
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Price:</span>
                    <span className="text-blue-600 font-semibold">{selectedRoomType.priceDisplay}</span>
                  </div>
                  <div>
                    <span className="font-medium">Description:</span>
                    <p className="mt-1">{selectedRoomType.description}</p>
                  </div>
                </div>
              </div>

              {/* Rooms List */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Rooms ({selectedRoomType.rooms?.length || 0})</h3>
                
                {selectedRoomType.rooms && selectedRoomType.rooms.length > 0 ? (
                  <div className="space-y-3">
                    {selectedRoomType.rooms.map(room => (
                      <RoomCard
                        key={room.id}
                        room={room}
                        isSelected={selectedRoom?.id === room.id}
                        onSelect={() => setSelectedRoom(room)}
                        onEdit={() => {
                          setFormMode('edit');
                          setSelectedRoom(room);
                          setShowRoomForm(true);
                        }}
                        onDelete={handleDeleteRoom}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No rooms added for this type yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomList;