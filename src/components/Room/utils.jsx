export const API_BASE_URL = 'http://localhost:5000';
export const API_PREFIX = '/api';

// Helper function to construct proper image URLs
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-room.jpg';
  
  const normalizedPath = imagePath.replace(/\\/g, '/');
  const cleanPath = normalizedPath.startsWith('/') 
    ? normalizedPath.substring(1) 
    : normalizedPath;
  
  return `${API_BASE_URL}/${cleanPath}`;
};