import React, { useState } from "react";
import { FiSearch, FiHome } from "react-icons/fi";
import RoomTable from "./RoomTable";

const AvailableRoomList = ({ 
  rooms, 
  onBookNow,
  onNavigateToReservations 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const filteredRooms = rooms.filter(room => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All Status" || room.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Available Rooms</h1>
          <p className="mt-1 text-sm text-gray-500">
            Showing {filteredRooms.length} rooms
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search rooms..."
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="border border-gray-300 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All Status">All Status</option>
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Maintenance">Maintenance</option>
          </select>
          <button
            onClick={onNavigateToReservations}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View Reservations
          </button>
        </div>
      </div>

      {filteredRooms.length > 0 ? (
        <RoomTable 
          rooms={filteredRooms} 
          onBookNow={onBookNow}
        />
      ) : (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <FiHome className="mx-auto" size={48} />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No rooms found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== "All Status"
              ? "Try adjusting your search or filter criteria"
              : "All rooms are currently occupied or under maintenance"}
          </p>
          <div className="mt-6">
            <button
              onClick={onNavigateToReservations}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View Reservations
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableRoomList;