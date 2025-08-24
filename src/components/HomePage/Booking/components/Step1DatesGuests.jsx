// src/components/HomePage/Booking/components/Step1DatesGuests.jsx
import React from 'react';
import { FiCalendar } from 'react-icons/fi';

const inputClasses = 'w-full h-[42px] px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
const labelClasses = 'absolute -top-2 left-3 z-10 bg-white px-1 text-xs text-gray-600';

const Step1DatesGuests = ({ bookingData, updateBookingData, onNextStep }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateBookingData({ [name]: value });
  };

  const handleNext = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) {
      alert('Please select both check-in and check-out dates');
      return;
    }
    onNextStep();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-6 text-gray-800">Select Dates & Guests</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="relative">
          <label className={labelClasses}>Check-in Date *</label>
          <div className="relative">
            <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              name="checkIn"
              value={bookingData.checkIn}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              className={`${inputClasses} pl-10`}
            />
          </div>
        </div>

        <div className="relative">
          <label className={labelClasses}>Check-out Date *</label>
          <div className="relative">
            <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              name="checkOut"
              value={bookingData.checkOut}
              onChange={handleInputChange}
              min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
              className={`${inputClasses} pl-10`}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <label className={labelClasses}>Adults *</label>
          <select
            name="adults"
            value={bookingData.adults}
            onChange={handleInputChange}
            className={inputClasses}
          >
            {[1, 2, 3, 4].map(num => (
              <option key={num} value={num}>{num} Adult{num > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <label className={labelClasses}>Children</label>
          <select
            name="children"
            value={bookingData.children}
            onChange={handleInputChange}
            className={inputClasses}
          >
            {[0, 1, 2, 3, 4].map(num => (
              <option key={num} value={num}>{num} Child{num !== 1 ? 'ren' : ''}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-medium"
        >
          Continue to Guest Info
        </button>
      </div>
    </div>
  );
};

export default Step1DatesGuests;