// src/components/LandingPage/RoomFilter.jsx
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toast } from 'react-toastify';

const RoomFilter = ({
  dateRange,
  setDateRange,
  selectedRoomType,
  setSelectedRoomType,
  adults,
  setAdults,
  children,
  setChildren,
  roomTypes,
  checkRoomAvailability,
  loading
}) => {
  const [startDate, endDate] = dateRange;

  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const handleCheckAvailability = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both check-in and check-out dates');
      return;
    }

    // Validate that check-out is after check-in
    if (startDate >= endDate) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    // Validate dates are not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today) {
      toast.error('Check-in date cannot be in the past');
      return;
    }

    try {
      await checkRoomAvailability();
    } catch (error) {
      console.error('Availability check error:', error);
    }
  };

  return (
    <section className="bg-white rounded-xl shadow-lg p-6 mb-12 -mt-16 relative z-20 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Find Your Perfect Stay</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Check In - Check Out</label>
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            isClearable={true}
            placeholderText="Select dates"
            minDate={new Date()}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            dateFormat="yyyy-MM-dd"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
          <select
            value={selectedRoomType || ''}
            onChange={(e) => setSelectedRoomType(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Room Types</option>
            {roomTypes.map((type) => (
              <option key={type.id || type.type_id} value={type.id || type.type_id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adults</label>
          <select
            value={adults}
            onChange={(e) => setAdults(parseInt(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {[1, 2, 3, 4].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'Adult' : 'Adults'}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
          <select
            value={children}
            onChange={(e) => setChildren(parseInt(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {[0, 1, 2, 3].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'Child' : 'Children'}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="mt-6 flex justify-center">
        <button
          onClick={handleCheckAvailability}
          disabled={!startDate || !endDate || loading}
          className={`px-8 py-3 rounded-lg font-medium text-white transition-colors ${
            !startDate || !endDate || loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? (
            <span className="flex items-center">
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Checking...
            </span>
          ) : (
            'Check Availability'
          )}
        </button>
      </div>

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && startDate && endDate && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
          <p>API Request Debug:</p>
          <p>check_in: {formatDate(startDate)}</p>
          <p>check_out: {formatDate(endDate)}</p>
          <p>adults: {adults}</p>
          <p>children: {children}</p>
          {selectedRoomType && <p>type_id: {selectedRoomType}</p>}
        </div>
      )}
    </section>
  );
};

export default RoomFilter;