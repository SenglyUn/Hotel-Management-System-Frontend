import React from 'react';
import { FiUpload, FiX } from 'react-icons/fi';
import axios from 'axios';
import { API_BASE_URL, getImageUrl } from './utils';

const RoomModal = ({ formMode, selectedRoom, selectedRoomType, setShowRoomForm, fetchData, setError }) => {
  const [roomImagePreview, setRoomImagePreview] = React.useState(null);
  const [roomFormData, setRoomFormData] = React.useState({
    name: '',
    room_type_id: '',
    status: 'available', // Added status field
    capacity: '',
    price: '',
    image: null
  });

  React.useEffect(() => {
    if (formMode === 'edit' && selectedRoom) {
      setRoomFormData({
        name: selectedRoom.name || '',
        room_type_id: selectedRoom.room_type?.id || selectedRoomType.id,
        status: selectedRoom.status || 'available',
        capacity: selectedRoom.capacity || selectedRoom.room_type?.capacity || '',
        price: selectedRoom.price || selectedRoom.room_type?.price || '',
        image: null
      });
      setRoomImagePreview(getImageUrl(selectedRoom.image));
    } else if (selectedRoomType) {
      setRoomFormData({
        name: '',
        room_type_id: selectedRoomType.id,
        status: 'available',
        capacity: selectedRoomType.capacity || '',
        price: selectedRoomType.price || '',
        image: null
      });
    }
  }, [formMode, selectedRoom, selectedRoomType]);

  const handleRoomInputChange = (e) => {
    const { name, value } = e.target;
    setRoomFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoomFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRoomFormData(prev => ({
        ...prev,
        image: file
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setRoomImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', roomFormData.name);
      formData.append('room_type_id', roomFormData.room_type_id);
      formData.append('status', roomFormData.status);
      formData.append('capacity', roomFormData.capacity);
      formData.append('price', roomFormData.price);
      
      if (roomFormData.image) {
        formData.append('image', roomFormData.image);
      }

      if (formMode === 'add') {
        await axios.post(`${API_BASE_URL}/api/rooms`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.put(`${API_BASE_URL}/api/rooms/${selectedRoom.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
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

        <form onSubmit={handleRoomSubmit} className="px-6 py-4">
          <div className="space-y-4">
            <div className="relative mt-6">
              <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs text-gray-600">Room Name</label>
              <input 
                type="text" 
                name="name" 
                value={roomFormData.name} 
                onChange={handleRoomInputChange} 
                required
                className="peer w-full h-[42px] px-3 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-transparent"
              />
            </div>

            <div className="relative mt-6">
              <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs text-gray-600">Room Type ID</label>
              <input 
                type="text" 
                name="room_type_id" 
                value={roomFormData.room_type_id} 
                onChange={handleRoomInputChange} 
                required
                readOnly
                className="peer w-full h-[42px] px-3 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-transparent bg-gray-100"
              />
            </div>

            <div className="relative mt-6">
              <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs text-gray-600">Status</label>
              <select
                name="status"
                value={roomFormData.status}
                onChange={handleRoomInputChange}
                className="peer w-full h-[42px] px-3 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="occupied">Occupied</option>
              </select>
            </div>

            <div className="relative mt-6">
              <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs text-gray-600">Capacity</label>
              <input 
                type="number" 
                name="capacity" 
                value={roomFormData.capacity} 
                onChange={handleRoomInputChange} 
                min="1" 
                required
                className="peer w-full h-[42px] px-3 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-transparent"
              />
            </div>

            <div className="relative mt-6">
              <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs text-gray-600">Price per Night ($)</label>
              <input 
                type="number" 
                name="price" 
                value={roomFormData.price} 
                onChange={handleRoomInputChange} 
                step="0.01" 
                min="0" 
                required
                className="peer w-full h-[42px] px-3 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-transparent"
              />
            </div>

            <div className="relative mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Room Image</label>
              <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <FiUpload className="inline mr-2" /> Upload Image
                <input 
                  type="file" 
                  name="image" 
                  onChange={handleRoomFileChange} 
                  className="hidden" 
                  accept="image/*" 
                  required={formMode === 'add'} 
                />
              </label>
              {roomImagePreview && (
                <div className="mt-2">
                  <img 
                    src={roomImagePreview} 
                    alt="Preview" 
                    className="h-32 object-cover rounded-md"
                    onError={(e) => {
                      e.target.src = 'https://source.unsplash.com/800x600/?hotel-room';
                      e.target.onerror = null;
                    }}
                  />
                </div>
              )}
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