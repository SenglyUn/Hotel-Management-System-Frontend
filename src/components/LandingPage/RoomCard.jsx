// src/components/LandingPage/RoomCard.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RoomCard = ({ room, startDate, endDate, isLoggedIn }) => {
  const navigate = useNavigate();
  const [imgSrc, setImgSrc] = useState(room.type.image_url);
  const [imgError, setImgError] = useState(false);

  const handleBookNow = () => {
    if (!isLoggedIn) {
      // Redirect to login with return URL to continue booking process
      navigate('/auth', { 
        state: { 
          from: '/booking',
          roomData: {
            room: room,
            checkIn: startDate,
            checkOut: endDate
          }
        } 
      });
      return;
    }

    // If user is logged in, proceed to booking
    navigate('/book', {
      state: {
        room: room,
        checkIn: startDate,
        checkOut: endDate
      }
    });
  };

  const handleViewDetails = () => {
    // Navigate to room details page without requiring login
    navigate(`/room/${room.id}`, {
      state: {
        room: room,
        checkIn: startDate,
        checkOut: endDate
      }
    });
  };

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true);
      setImgSrc(`https://picsum.photos/800/600?random=${room.id}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
      <div className="relative">
        <img 
          src={imgSrc} 
          alt={room.type.name}
          className="w-full h-48 object-cover cursor-pointer"
          onError={handleImageError}
          onClick={handleViewDetails}
        />
        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
          {room.status || 'Available'}
        </div>
      </div>
      
      <div className="p-4">
        <h3 
          className="text-xl font-semibold text-gray-800 cursor-pointer hover:text-blue-600"
          onClick={handleViewDetails}
        >
          {room.type.name}
        </h3>
        <p className="text-gray-600 mt-1">Room {room.room_number}</p>
        <p className="text-gray-600">Floor {room.floor}</p>
        
        <div className="mt-3">
          <p className="text-gray-700 line-clamp-2">{room.type.description}</p>
          <p className="text-gray-600 mt-1">Capacity: {room.type.capacity} people</p>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">
              ${room.pricing ? room.pricing.total : room.type.base_price}
            </p>
            <p className="text-gray-500 text-sm">per night</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleViewDetails}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition"
            >
              View Details
            </button>
            <button
              onClick={handleBookNow}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;