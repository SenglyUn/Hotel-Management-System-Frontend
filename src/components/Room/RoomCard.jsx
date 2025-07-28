import React from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

const RoomCard = ({ room, isSelected, onSelect, onEdit, onDelete }) => {
  return (
    <div 
      className={`p-3 border rounded-lg flex justify-between items-center ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
      onClick={onSelect}
    >
      <div>
        <div className="font-medium">{room.name || `Room #${room.room_number}`}</div>
        <div className="text-xs text-gray-500">Capacity: {room.capacity}</div>
        <div className={`text-xs px-2 py-1 rounded-full inline-block ${
          room.status === 'available' ? 'bg-green-100 text-green-800' :
          room.status === 'occupied' ? 'bg-red-100 text-red-800' :
          room.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {room.statusDisplay}
        </div>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="text-gray-500 hover:text-blue-600"
        >
          <FiEdit size={16} />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(room.id);
          }}
          className="text-gray-500 hover:text-red-600"
        >
          <FiTrash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default RoomCard;