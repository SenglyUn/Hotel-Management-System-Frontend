// src/components/HomePage/Booking/components/BookingHeader.jsx
import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';

const BookingHeader = ({ onBack }) => {
  return (
    <div className="flex items-center mb-8">
      <button
        onClick={onBack}
        className="flex items-center text-blue-600 hover:text-blue-700 mr-4 text-sm font-medium"
      >
        <FiArrowLeft className="mr-2" />
        Back to Rooms
      </button>
      <h1 className="text-2xl font-semibold text-gray-800">Complete Your Booking</h1>
    </div>
  );
};

export default BookingHeader;