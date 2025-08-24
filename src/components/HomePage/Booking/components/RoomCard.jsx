// src/components/HomePage/Booking/components/RoomCard.jsx
import React from 'react';
import { FiStar, FiWifi, FiCoffee, FiTv, FiWind } from 'react-icons/fi';

const RoomCard = ({ room }) => {
  return (
    <div className="mb-6">
      <div className="relative h-40 rounded-md overflow-hidden mb-4">
        <img
          src={room.type?.image_url || room.image_url || 'https://picsum.photos/800/600?hotel'}
          alt={room.type?.name || room.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://picsum.photos/800/600?hotel';
          }}
        />
      </div>
      <h3 className="text-base font-semibold mb-2 text-gray-800">
        {room.type?.name || room.name}
      </h3>
      <p className="text-sm text-gray-600 mb-2">
        Room {room.room_number || room.number}
      </p>
      <div className="flex items-center mb-3">
        <FiStar className="text-yellow-400 mr-1" size={14} />
        <span className="text-xs text-gray-600">4.8 (120 reviews)</span>
      </div>
      
      {/* Amenities */}
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
        <div className="flex items-center">
          <FiWifi className="mr-2" size={12} />
          Free WiFi
        </div>
        <div className="flex items-center">
          <FiCoffee className="mr-2" size={12} />
          Breakfast
        </div>
        <div className="flex items-center">
          <FiTv className="mr-2" size={12} />
          TV
        </div>
        <div className="flex items-center">
          <FiWind className="mr-2" size={12} />
          AC
        </div>
      </div>
    </div>
  );
};

export default RoomCard;