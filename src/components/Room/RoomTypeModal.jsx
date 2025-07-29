import React from 'react';
import { FiUpload, FiX } from 'react-icons/fi';
import axios from 'axios';
import { API_BASE_URL, API_PREFIX } from './utils';

const RoomTypeModal = ({ formMode, selectedRoomType, setShowAddForm, fetchData, setError }) => {
  const [imagePreview, setImagePreview] = React.useState(null);
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    base_price: '',
    capacity: '',
    image: null  // Changed from image_url to match API
  });
  const fileInputRef = React.useRef(null);

  React.useEffect(() => {
    if (formMode === 'edit' && selectedRoomType) {
      setFormData({
        name: selectedRoomType.name,
        description: selectedRoomType.description,
        base_price: selectedRoomType.base_price,
        capacity: selectedRoomType.capacity,
        image: null
      });
      setImagePreview(getImageUrl(selectedRoomType.image_url));
    } else {
      setFormData({
        name: '',
        description: '',
        base_price: '',
        capacity: '',
        image: null
      });
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [formMode, selectedRoomType]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://source.unsplash.com/800x600/?hotel-room";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_BASE_URL}${imagePath}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file  // Changed to match API field name
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      
      // Append all fields exactly as shown in Postman
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('base_price', formData.base_price);
      formDataToSend.append('capacity', formData.capacity);
      
      // Required file - field name must be 'image' to match API
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      } else if (formMode === 'add') {
        throw new Error('Please upload an image');
      }

      const endpoint = formMode === 'add' 
        ? `${API_BASE_URL}${API_PREFIX}/room-types`
        : `${API_BASE_URL}${API_PREFIX}/room-types/${selectedRoomType.type_id}`;
      
      const method = formMode === 'add' ? 'post' : 'put';

      const response = await axios({
        method,
        url: endpoint,
        data: formDataToSend,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      await fetchData();
      setShowAddForm(false);
    } catch (err) {
      console.error('Error submitting room type:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save room type');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-xl font-semibold">
            {formMode === 'add' ? 'Add New Room Type' : 'Edit Room Type'}
          </h3>
          <button
            onClick={() => setShowAddForm(false)}
            className="text-gray-500 hover:text-gray-700 text-lg"
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative mt-6">
              <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs text-gray-600">Room Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                required
                className="peer w-full h-[42px] px-3 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-transparent"
              />
            </div>

            <div className="relative mt-6">
              <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs text-gray-600">Description</label>
              <input 
                type="text" 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
                required
                className="peer w-full h-[42px] px-3 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-transparent"
              />
            </div>

            <div className="relative mt-6">
              <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs text-gray-600">Price per Night ($)</label>
              <input 
                type="number" 
                name="base_price" 
                value={formData.base_price} 
                onChange={handleInputChange} 
                step="0.01" 
                min="0" 
                required
                className="peer w-full h-[42px] px-3 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-transparent"
              />
            </div>

            <div className="relative mt-6">
              <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs text-gray-600">Capacity</label>
              <input 
                type="number" 
                name="capacity" 
                value={formData.capacity} 
                onChange={handleInputChange} 
                min="1" 
                required
                className="peer w-full h-[42px] px-3 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-transparent"
              />
            </div>
          </div>

          <div className="relative mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Image</label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <FiUpload className="inline mr-2" /> 
                {imagePreview ? 'Change Image' : 'Upload Image'}
                <input 
                  ref={fileInputRef}
                  type="file" 
                  name="image" 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*" 
                  required={formMode === 'add'}
                />
              </label>
              {imagePreview && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove Image
                </button>
              )}
            </div>
            {imagePreview && (
              <div className="mt-2">
                <img 
                  src={imagePreview} 
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

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {formMode === 'add' ? 'Add Room Type' : 'Update Room Type'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomTypeModal;