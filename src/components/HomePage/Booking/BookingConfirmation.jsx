// src/components/HomePage/Booking/BookingConfirmation.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaPrint, FaHome, FaHistory, FaUser, FaCalendarAlt, FaBed, FaReceipt, FaDollarSign, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, room, total } = location.state || {};

  // Redirect if no booking data
  React.useEffect(() => {
    if (!booking) {
      toast.error('No booking information found');
      navigate('/landing');
    }
  }, [booking, navigate]);

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking confirmation...</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveToHistory = () => {
    // Get existing history from localStorage
    const existingHistory = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
    
    // Add new booking to history
    const newHistory = [{
      id: booking.reservation_id || '#' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      ...booking,
      room,
      total
    }, ...existingHistory];
    
    // Save to localStorage
    localStorage.setItem('bookingHistory', JSON.stringify(newHistory));
    
    toast.success('Booking saved to history!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Main Paper Container */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          
          {/* Header with Branding */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="flex items-center mb-4 sm:mb-0">
                <div className="bg-white/20 p-2 rounded-lg mr-4">
                  <FaCheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Booking Confirmed</h1>
                  <p className="text-blue-100">Your reservation has been successfully created</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/landing')}
                className="flex items-center text-white bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg"
              >
                <FaHome className="mr-2" /> Back to Home
              </button>
            </div>
          </div>

          {/* Confirmation Details */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide">Reservation ID</p>
                <p className="font-bold text-gray-800 text-xl">{booking.reservation_id || 'N/A'}</p>
              </div>
              <div className="mt-4 md:mt-0 text-center md:text-right">
                <p className="text-sm text-gray-500">Booking Date</p>
                <p className="font-medium text-gray-800">{new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 p-6 border-r border-gray-100">
              {/* Guest Information */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <FaUser className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Guest Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Full Name</p>
                    <p className="font-medium text-gray-800">{booking.guest_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email Address</p>
                    <p className="font-medium text-gray-800 break-all">{booking.guest_email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                    <p className="font-medium text-gray-800">{booking.guest_phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Special Requests</p>
                    <p className="font-medium text-gray-800">{booking.special_requests || 'None'}</p>
                  </div>
                </div>
              </div>

              {/* Reservation Details */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <FaCalendarAlt className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Reservation Details</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Check-in Date</p>
                    <p className="font-medium text-gray-800">{formatDate(booking.check_in)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Check-out Date</p>
                    <p className="font-medium text-gray-800">{formatDate(booking.check_out)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Duration of Stay</p>
                    <p className="font-medium text-gray-800">{total.nights} night{total.nights !== 1 ? 's' : ''}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Guests</p>
                    <p className="font-medium text-gray-800">
                      {booking.adults || 1} adult{booking.adults !== 1 ? 's' : ''}
                      {booking.children > 0 && `, ${booking.children} child${booking.children !== 1 ? 'ren' : ''}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Room Information */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <FaBed className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Room Information</h2>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 p-4 rounded-lg">
                  <div className="mb-4 md:mb-0">
                    <p className="font-bold text-lg text-gray-800">{room.name || room.type?.name || 'Room'}</p>
                    <p className="text-gray-600 mt-1">
                      {room.type?.name || 'Standard'} • Floor {room.floor || 1}
                    </p>
                    <div className="flex items-center mt-3 text-sm text-gray-500">
                      <span className="mr-4">Max Guests: {room.type?.max_guests || room.max_guests || 2}</span>
                      <span>Size: {room.type?.size || room.size || '25'} m²</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-600">${room.type?.base_price || room.base_price || 0}<span className="text-sm font-normal text-gray-500">/night</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="p-6 bg-gray-50">
              {/* Payment Summary */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <FaReceipt className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Payment Summary</h2>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Room Charges</span>
                      <span className="font-medium text-gray-800">${total.roomPrice} × {total.nights} nights</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-800">${total.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tax (12%)</span>
                      <span className="font-medium text-gray-800">${total.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <span className="text-lg font-semibold text-gray-800">Total Amount</span>
                      <span className="text-xl font-bold text-blue-600">${total.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Amount Paid</span>
                      <span className="font-medium text-gray-800">$0.00</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <span className="text-lg font-semibold text-gray-800">Balance Due</span>
                      <span className="text-xl font-bold text-blue-600">${total.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Information */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <FaInfoCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Important Information</h2>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="text-blue-500 font-bold mr-2">•</span>
                      <span className="text-gray-700">Check-in: 2:00 PM | Check-out: 12:00 PM</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 font-bold mr-2">•</span>
                      <span className="text-gray-700">Present this invoice and valid ID at reception</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 font-bold mr-2">•</span>
                      <span className="text-gray-700">Payment due: Upon check-in</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 font-bold mr-2">•</span>
                      <span className="text-gray-700">Free cancellation up to 24 hours before check-in</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handlePrint}
                  className="w-full flex items-center justify-center px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <FaPrint className="mr-2" /> Print Invoice
                </button>
                <button
                  onClick={handleSaveToHistory}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <FaHistory className="mr-2" /> Save to History
                </button>
                <button
                  onClick={() => navigate('/booking-history')}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors shadow-sm"
                >
                  <FaHistory className="mr-2" /> View History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body, html {
            background: white !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .container {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .bg-gray-50 {
            background: white !important;
          }
          button, .gap-4, .space-y-3, .space-y-6 {
            display: none !important;
          }
          .grid-cols-1 {
            grid-template-columns: 1fr !important;
          }
          .lg\\:grid-cols-3 {
            grid-template-columns: 1fr !important;
          }
          .rounded-xl, .rounded-lg {
            border-radius: 0 !important;
            box-shadow: none !important;
          }
          .shadow-lg {
            box-shadow: none !important;
          }
          .border {
            border: 1px solid #e5e7eb !important;
          }
          .p-6, .p-4 {
            padding: 1rem !important;
          }
          .mb-6, .mb-4 {
            margin-bottom: 1rem !important;
          }
          .bg-gradient-to-r {
            background: #e0f2fe !important;
            color: black !important;
          }
          .text-white {
            color: black !important;
          }
          .text-blue-600 {
            color: #2563eb !important;
          }
          .bg-blue-100 {
            background: #f0f0f0 !important;
          }
          .bg-gray-50 {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BookingConfirmation;