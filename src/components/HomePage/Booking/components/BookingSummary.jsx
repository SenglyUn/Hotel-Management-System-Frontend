// src/components/HomePage/Booking/components/BookingSummary.jsx
import React from 'react';
import { FiStar, FiWifi, FiCoffee, FiTv, FiWind } from 'react-icons/fi';
import RoomCard from './RoomCard';

const BookingSummary = ({ bookingData, total }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
      <h2 className="text-lg font-semibold mb-6 text-gray-800">Booking Summary</h2>
      
      <RoomCard room={bookingData.room} />

      {/* Price Breakdown */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-sm font-semibold mb-4 text-gray-800">Price Details</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">${total.roomPrice} × {total.nights} nights</span>
            <span className="font-medium">${total.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax (12%)</span>
            <span className="font-medium">${total.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-$0.00</span>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between font-semibold text-sm">
              <span className="text-gray-800">Total</span>
              <span className="text-blue-600">${total.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dates Info */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <h3 className="text-sm font-semibold mb-4 text-gray-800">Stay Details</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Check-in</span>
            <span className="font-medium">
              {bookingData.checkIn ? new Date(bookingData.checkIn).toLocaleDateString() : '-'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Check-out</span>
            <span className="font-medium">
              {bookingData.checkOut ? new Date(bookingData.checkOut).toLocaleDateString() : '-'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Guests</span>
            <span className="font-medium">
              {bookingData.adults} adult{bookingData.adults !== 1 ? 's' : ''}
              {bookingData.children > 0 && `, ${bookingData.children} child${bookingData.children !== 1 ? 'ren' : ''}`}
            </span>
          </div>
        </div>
      </div>

      {/* Policies */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <h3 className="text-sm font-semibold mb-4 text-gray-800">Policies</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <p>• Free cancellation up to 24 hours before check-in</p>
          <p>• No smoking allowed</p>
          <p>• 2:00 PM check-in, 12:00 PM check-out</p>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;