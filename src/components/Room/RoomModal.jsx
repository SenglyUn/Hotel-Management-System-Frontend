import React from 'react';
import { FiX, FiCheck, FiPlus } from 'react-icons/fi';
import axios from 'axios';
import { API_BASE_URL } from './utils';

const RoomModal = ({ formMode, selectedRoom, selectedRoomType, setShowRoomForm, fetchData, setError }) => {
  const [amenities, setAmenities] = React.useState([]);
  const [selectedAmenities, setSelectedAmenities] = React.useState([]);
  const [features, setFeatures] = React.useState({
    wifi: false,
    tv: false,
    ac: false,
    minibar: false
  });

  const [roomFormData, setRoomFormData] = React.useState({
    room_number: '',
    floor: 1,
    status: 'available',
    type_id: ''
  });

  // Fetch amenities when component mounts
  React.useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/amenities?page=1&limit=100`);
        setAmenities(response.data.data || []);
      } catch (err) {
        console.error('Error fetching amenities:', err);
      }
    };
    fetchAmenities();
  }, []);

  // Initialize form data
  React.useEffect(() => {
    if (formMode === 'edit' && selectedRoom) {
      setRoomFormData({
        room_number: selectedRoom.room_number || '',
        floor: selectedRoom.floor || 1,
        status: selectedRoom.status || 'available',
        type_id: selectedRoom.type?.type_id || selectedRoomType?.type_id || ''
      });
      
      // Set features from existing room
      if (selectedRoom.features) {
        setFeatures({
          wifi: selectedRoom.features.wifi || false,
          tv: selectedRoom.features.tv || false,
          ac: selectedRoom.features.ac || false,
          minibar: selectedRoom.features.minibar || false
        });
      }
      
      // Set amenities from existing room
      if (selectedRoom.amenities) {
        setSelectedAmenities(selectedRoom.amenities.map(a => a.amenity_id));
      }
    } else if (selectedRoomType) {
      setRoomFormData({
        room_number: '',
        floor: 1,
        status: 'available',
        type_id: selectedRoomType.type_id
      });
    }
  }, [formMode, selectedRoom, selectedRoomType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRoomFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFeatureToggle = (feature) => {
    setFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  const handleAmenityToggle = (amenityId) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        room_number: roomFormData.room_number,
        type_id: roomFormData.type_id,
        floor: parseInt(roomFormData.floor),
        status: roomFormData.status,
        features: features,
        amenities: selectedAmenities
      };

      if (formMode === 'add') {
        await axios.post(`${API_BASE_URL}/api/rooms`, payload);
      } else {
        await axios.put(`${API_BASE_URL}/api/rooms/${selectedRoom.room_id}`, payload);
      }

      await fetchData();
      setShowRoomForm(false);
    } catch (err) {
      console.error('Error submitting room:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save room');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-xl font-semibold">
            {formMode === 'add' ? 'Add New Room' : 'Edit Room'}
          </h3>
          <button
            onClick={() => setShowRoomForm(false)}
            className="text-gray-500 hover:text-gray-700 text-lg"
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="space-y-4">
            <div className="relative mt-6">
              <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs text-gray-600">Room Number</label>
              <input 
                type="text" 
                name="room_number" 
                value={roomFormData.room_number} 
                onChange={handleInputChange} 
                required
                className="peer w-full h-[42px] px-3 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-transparent"
              />
            </div>

            <div className="relative mt-6">
              <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs text-gray-600">Floor</label>
              <input 
                type="number" 
                name="floor" 
                value={roomFormData.floor} 
                onChange={handleInputChange} 
                min="1" 
                required
                className="peer w-full h-[42px] px-3 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-transparent"
              />
            </div>

            <div className="relative mt-6">
              <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs text-gray-600">Room Type ID</label>
              <input 
                type="text" 
                name="type_id" 
                value={roomFormData.type_id} 
                onChange={handleInputChange} 
                required
                readOnly={!!selectedRoomType}
                className={`peer w-full h-[42px] px-3 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-transparent ${
                  selectedRoomType ? 'bg-gray-100' : ''
                }`}
              />
            </div>

            <div className="relative mt-6">
              <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs text-gray-600">Status</label>
              <select
                name="status"
                value={roomFormData.status}
                onChange={handleInputChange}
                className="peer w-full h-[42px] px-3 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(features).map(([feature, isEnabled]) => (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => handleFeatureToggle(feature)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm ${
                      isEnabled 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {isEnabled ? <FiCheck className="mr-2" /> : <FiPlus className="mr-2" />}
                    {feature.charAt(0).toUpperCase() + feature.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
              <div className="grid grid-cols-2 gap-2">
                {amenities.map(amenity => (
                  <button
                    key={amenity.amenity_id}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity.amenity_id)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm ${
                      selectedAmenities.includes(amenity.amenity_id)
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {selectedAmenities.includes(amenity.amenity_id) 
                      ? <FiCheck className="mr-2" /> 
                      : <FiPlus className="mr-2" />}
                    {amenity.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowRoomForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {formMode === 'add' ? 'Add Room' : 'Update Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomModal;