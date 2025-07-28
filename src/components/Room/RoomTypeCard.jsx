import React from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

const RoomTypeCard = ({ roomType, isSelected, onSelect, onEdit, onDelete }) => {
  return (
    <div
      className={`flex flex-col sm:flex-row p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 ${isSelected ? 'border-blue-500' : 'border-transparent'}`}
      onClick={onSelect}
    >
      <div className="w-full sm:w-40 h-40 flex-shrink-0 mb-4 sm:mb-0">
        <img
          src={roomType.image}
          alt={roomType.name}
          className="w-full h-full object-cover rounded-lg"
          onError={(e) => {
            e.target.src = '/placeholder-room.jpg';
            e.target.onerror = null;
          }}
        />
      </div>
      
      <div className="flex-grow px-0 sm:px-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-800">{roomType.name}</h3>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-xs rounded-full ${roomType.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {roomType.status}
            </span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="text-gray-500 hover:text-blue-600"
            >
              <FiEdit />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(roomType.id);
              }}
              className="text-gray-500 hover:text-red-600"
            >
              <FiTrash2 />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-sm text-gray-600">
          <div>
            <span className="font-medium">Size:</span> {roomType.size}
          </div>
          <div>
            <span className="font-medium">Bed:</span> {roomType.bed}
          </div>
          <div>
            <span className="font-medium">Capacity:</span> {roomType.capacityDisplay}
          </div>
          <div>
            <span className="font-medium">Rooms:</span> {roomType.availableRooms}/{roomType.totalRooms} available
          </div>
        </div>
        
        <div className="mt-3">
          <span className="text-lg font-bold text-blue-600">{roomType.priceDisplay}</span>
        </div>
      </div>
    </div>
  );
};

export default RoomTypeCard;