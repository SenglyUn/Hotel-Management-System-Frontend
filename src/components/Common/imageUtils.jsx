// src/components/common/imageUtils.js
const API_BASE_URL = 'http://localhost:5000';

const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://source.unsplash.com/random/800x600/?hotel-room';
  
  if (imagePath.startsWith('http')) return imagePath;
  
  if (imagePath.startsWith('/uploads') || imagePath.startsWith('uploads')) {
    const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${API_BASE_URL}${normalizedPath}`;
  }
  
  return `${API_BASE_URL}/${imagePath.replace(/^\/+/, '')}`;
};

export { getImageUrl };