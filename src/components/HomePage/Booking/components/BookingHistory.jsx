// src/components/BookingHistory/BookingHistory.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiUser, FiDollarSign, FiFileText, FiClock } from 'react-icons/fi';

const BookingHistory = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookings = () => {
      try {
        const savedBookings = localStorage.getItem('bookingHistory');
        if (savedBookings) {
          setBookings(JSON.parse(savedBookings));
        }
      } catch (error) {
        console.error('Error loading booking history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  const handleViewInvoice = (booking) => {
    navigate('/booking-confirmation', { 
      state: { 
        booking: booking,
        room: booking.room,
        total: booking.total
      } 
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent mb-3"></div>
          <p className="text-gray-500 text-sm">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-100 mr-4"
          >
            <FiArrowLeft className="mr-2" /> Back
          </button>
          <h1 className="text-2xl font-semibold text-gray-800">Booking History</h1>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center max-w-md mx-auto border border-gray-200">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5">
              <FiCalendar className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-lg font-medium text-gray-700 mb-2">No bookings yet</h2>
            <p className="text-gray-500 text-sm mb-6">Your booking history will appear here after you make a reservation.</p>
            <button
              onClick={() => navigate('/landing')}
              className="px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              Book a Room
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-5">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-800">
                          {booking.room?.name || 'Room Booking'}
                        </h3>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-yellow-50 text-yellow-700'
                        }`}>
                          {booking.status || 'Confirmed'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-600">
                        <div className="flex items-center">
                          <FiCalendar className="mr-3 text-blue-400 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-400">Dates</p>
                            <p className="text-sm font-medium text-gray-700">
                              {formatDate(booking.check_in)} - {formatDate(booking.check_out)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <FiUser className="mr-3 text-blue-400 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-400">Guests</p>
                            <p className="text-sm font-medium text-gray-700">
                              {booking.adults} adult{booking.adults !== 1 ? 's' : ''}
                              {booking.children > 0 && `, ${booking.children} child${booking.children !== 1 ? 'ren' : ''}`}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <FiDollarSign className="mr-3 text-green-400 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-400">Total Amount</p>
                            <p className="text-sm font-medium text-green-600">
                              ${booking.total?.total?.toFixed(2) || '0.00'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <FiClock className="mr-3 text-purple-400 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-400">Booking ID</p>
                            <p className="text-sm font-mono font-medium text-gray-700">
                              #{String(index + 1).padStart(4, '0')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-5 md:mt-0 md:ml-5">
                      <button
                        onClick={() => handleViewInvoice(booking)}
                        className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm w-full md:w-auto"
                      >
                        <FiFileText className="mr-2" />
                        View Invoice
                      </button>
                    </div>
                  </div>
                  
                  {booking.special_requests && (
                    <div className="mt-5 pt-4 border-t border-gray-100">
                      <h4 className="text-xs font-medium text-gray-500 mb-1.5">Special Requests:</h4>
                      <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-md">{booking.special_requests}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;