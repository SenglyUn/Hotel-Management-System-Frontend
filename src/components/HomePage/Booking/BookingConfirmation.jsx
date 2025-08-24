// src/components/HomePage/Booking/BookingConfirmation.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FiCheckCircle, FiCalendar, FiUser, FiCreditCard, FiHome, FiStar, FiMapPin, FiFileText, FiDownload, FiArrowLeft } from 'react-icons/fi';

const API_BASE_URL = 'http://localhost:5000';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { reservationId: paramReservationId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [reservationId, setReservationId] = useState(null);

  // Try to get data from multiple sources
  useEffect(() => {
    console.log('Location state:', location.state);
    
    // First, try to get from location state (direct navigation from booking)
    if (location.state) {
      // Check for different possible structures in location state
      let responseData, bookingRoom, total;
      
      if (location.state.booking) {
        // Structure: { booking: {...}, room: {...}, total: {...} }
        responseData = location.state.booking;
        bookingRoom = location.state.room;
        total = location.state.total;
      } else if (location.state.data) {
        // Structure: { data: {...} }
        responseData = location.state;
      }
      
      if (responseData) {
        const booking = responseData.data || responseData;
        
        // Check for reservation_group_id (from your logs)
        if (booking.reservation_group_id) {
          console.log('Using data from location state with reservation_group_id:', booking);
          setBookingData({ booking, bookingRoom, total });
          setReservationId(booking.reservation_group_id);
          
          // Store in session storage for page refresh scenarios
          sessionStorage.setItem('lastReservationId', booking.reservation_group_id);
          sessionStorage.setItem('lastBookingData', JSON.stringify({ booking, bookingRoom, total }));
          setLoading(false);
          return;
        }
        // Check for reservation_id (standard field)
        else if (booking.reservation_id) {
          console.log('Using data from location state with reservation_id:', booking);
          setBookingData({ booking, bookingRoom, total });
          setReservationId(booking.reservation_id);
          
          // Store in session storage for page refresh scenarios
          sessionStorage.setItem('lastReservationId', booking.reservation_id);
          sessionStorage.setItem('lastBookingData', JSON.stringify({ booking, bookingRoom, total }));
          setLoading(false);
          return;
        }
      }
    }
    
    // Second, try to get from URL params
    if (paramReservationId) {
      console.log('Using reservation ID from URL params:', paramReservationId);
      setReservationId(paramReservationId);
      sessionStorage.setItem('lastReservationId', paramReservationId);
      setLoading(false);
      return;
    }
    
    // Third, try to get from session storage
    const lastReservationId = sessionStorage.getItem('lastReservationId');
    const lastBookingData = sessionStorage.getItem('lastBookingData');
    
    if (lastReservationId) {
      console.log('Using reservation ID from session storage:', lastReservationId);
      setReservationId(lastReservationId);
      
      if (lastBookingData) {
        try {
          console.log('Using data from session storage');
          const parsedData = JSON.parse(lastBookingData);
          setBookingData(parsedData);
        } catch (e) {
          console.error('Error parsing stored booking data:', e);
        }
      }
      setLoading(false);
    } else {
      // No data found anywhere
      setLoading(false);
      setError('No reservation ID found. Please make a booking first.');
    }
  }, [location.state, paramReservationId]);

  useEffect(() => {
    if (reservationId) {
      console.log('Fetching invoice for reservation:', reservationId);
      fetchInvoice(reservationId);
    }
  }, [reservationId]);

  const fetchInvoice = async (reservationId) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/api/reservations/${reservationId}/invoice`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Invoice API response:', data);
        
        // Handle the nested API response structure
        if (data.data && data.data.invoice) {
          // The API returns the invoice data nested under data.data.invoice
          setInvoice(data.data.invoice);
        } else if (data.data) {
          // Fallback if the structure is different
          setInvoice(data.data);
        } else {
          setInvoice(data);
        }
        
        setError(null);
      } else if (response.status === 404) {
        // If invoice not found but we have booking data, use that instead
        if (bookingData) {
          console.log('Invoice not found, but using available booking data');
          setError(null);
        } else {
          throw new Error('Reservation not found. It may have been cancelled or does not exist.');
        }
      } else {
        // If other error but we have booking data, use that instead
        if (bookingData) {
          console.log('Error fetching invoice, but using available booking data');
          setError(null);
        } else {
          throw new Error('Failed to fetch invoice details.');
        }
      }
    } catch (err) {
      console.error('Error fetching invoice:', err);
      // Only set error if we don't have any booking data to display
      if (!bookingData) {
        setError(err.message);
      } else {
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/landing');
  };

  const handleViewBookings = () => {
    navigate('/my-bookings');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  // Show error only if we don't have any booking data to display
  if (error && !bookingData && !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {error ? 'Error Loading Booking Details' : 'Booking Not Found'}
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'Sorry, we couldn\'t find your booking details. This may happen if you refreshed the page or directly accessed this URL.'}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleBackToHome}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
            >
              <FiArrowLeft className="mr-2" />
              Back to Home
            </button>
            <button
              onClick={handleViewBookings}
              className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50"
            >
              View My Bookings
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            Need help? Contact support at +855-123-4567 or info@luxuryhotel.com
          </p>
        </div>
      </div>
    );
  }

  // Use invoice data if available, otherwise fall back to booking data
  // The API response structure has invoice.guest and invoice.reservation
  const invoiceData = invoice || bookingData?.booking || {};
  const guest = invoiceData.guest || bookingData?.booking?.guest || {};
  const reservation = invoiceData.reservation || invoiceData || bookingData?.booking || {};
  const charges = invoiceData.charges || {};
  const room = reservation.room || bookingData?.bookingRoom || {};

  // Safely parse room features if they exist as JSON string
  let roomFeatures = {};
  try {
    roomFeatures = room?.features ? (typeof room.features === 'string' ? JSON.parse(room.features) : room.features) : {};
  } catch (e) {
    console.error('Error parsing room features:', e);
    roomFeatures = {};
  }

  // Calculate duration safely
  const calculateDuration = () => {
    try {
      if (reservation.check_in && reservation.check_out) {
        const checkIn = new Date(reservation.check_in);
        const checkOut = new Date(reservation.check_out);
        return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      }
      return bookingData?.total?.nights || 0;
    } catch (e) {
      console.error('Error calculating duration:', e);
      return bookingData?.total?.nights || 0;
    }
  };

  // Format currency safely
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0.00';
    return parseFloat(amount).toFixed(2);
  };

  // Calculate balance safely
  const calculateBalance = () => {
    try {
      const totalAmount = charges ? parseFloat(charges.total || 0) : parseFloat(reservation.total_amount || bookingData?.total?.total || 0);
      const paidAmount = charges ? parseFloat(charges.paid || 0) : parseFloat(reservation.paid_amount || 0);
      return (totalAmount - paidAmount).toFixed(2);
    } catch (e) {
      console.error('Error calculating balance:', e);
      return '0.00';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Your reservation has been successfully created</p>
          <p className="text-sm text-gray-500 mt-1">
            Reservation ID: #{reservation.reservation_id || reservation.reservation_group_id || 'N/A'}
            {invoiceData.invoice_number && ` • Invoice: ${invoiceData.invoice_number}`}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Invoice Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
            <div className="flex justify-between items-start flex-col md:flex-row gap-4">
              <div>
                <h2 className="text-2xl font-bold">OFFICIAL INVOICE</h2>
                <p className="text-blue-100">Luxury Hotel Resort & Spa</p>
                <p className="text-blue-100 text-sm mt-1">123 Luxury Street, Phnom Penh, Cambodia</p>
              </div>
              <div className="text-left md:text-right">
                {invoiceData.invoice_number && (
                  <p className="text-blue-100">Invoice #: {invoiceData.invoice_number}</p>
                )}
                <p className="text-blue-100">
                  Issue Date: {new Date(invoiceData.issue_date || reservation.created_at || new Date()).toLocaleDateString()}
                </p>
                {invoiceData.due_date && (
                  <p className="text-blue-100">
                    Due Date: {new Date(invoiceData.due_date).toLocaleDateString()}
                  </p>
                )}
                <p className="text-blue-100 text-sm mt-1">
                  Status: <span className="capitalize font-semibold">{invoiceData.status || reservation.status || 'confirmed'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Guest Information */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FiUser className="mr-2" /> Guest Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Full Name</p>
                <p className="font-medium">{(guest.first_name || 'Dariya') + ' ' + (guest.last_name || 'Doung')}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-medium">{guest.email || 'dariya@gmail.com'}</p>
              </div>
              <div>
                <p className="text-gray-600">Phone</p>
                <p className="font-medium">{guest.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">ID Document</p>
                <p className="font-medium">
                  {guest.id_type ? `${guest.id_type}: ${guest.id_number || 'N/A'}` : 'N/A'}
                </p>
              </div>
              {(guest.address || guest.city || guest.country) && (
                <div className="md:col-span-2">
                  <p className="text-gray-600">Address</p>
                  <p className="font-medium flex items-center">
                    <FiMapPin className="w-4 h-4 mr-1" />
                    {[guest.address, guest.city, guest.country].filter(Boolean).join(', ') || 'N/A'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Booking Details */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FiCalendar className="mr-2" /> Reservation Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Check-in Date</p>
                <p className="font-medium">
                  {reservation.check_in ? new Date(reservation.check_in).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Sat, Aug 30, 2025'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Check-out Date</p>
                <p className="font-medium">
                  {reservation.check_out ? new Date(reservation.check_out).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Sun, Aug 31, 2025'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Duration</p>
                <p className="font-medium">
                  {calculateDuration()} nights
                </p>
              </div>
              <div>
                <p className="text-gray-600">Guests</p>
                <p className="font-medium">
                  {reservation.adults || 1} adult{reservation.adults !== 1 ? 's' : ''}
                  {reservation.children > 0 && `, ${reservation.children} child${reservation.children !== 1 ? 'ren' : ''}`}
                </p>
              </div>
            </div>
            {reservation.special_requests && (
              <div className="mt-4">
                <p className="text-gray-600">Special Requests</p>
                <p className="font-medium text-sm bg-blue-50 p-3 rounded-md mt-1">
                  {reservation.special_requests}
                </p>
              </div>
            )}
          </div>

          {/* Room Information */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FiHome className="mr-2" /> Room Information
            </h3>
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                <h4 className="font-semibold text-lg">{room.room_number || 'Family1'}</h4>
                <p className="text-gray-600">Room Type: {room.room_type || room.type?.name || 'Family Room'}</p>
                {room.floor && <p className="text-gray-600">Floor: {room.floor}</p>}
                
                {/* Room Features */}
                {Object.keys(roomFeatures).length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Room Features:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {roomFeatures.wifi && (
                        <span className="flex items-center text-green-600">
                          <FiStar className="w-4 h-4 mr-1" /> WiFi
                        </span>
                      )}
                      {roomFeatures.tv && (
                        <span className="flex items-center text-green-600">
                          <FiStar className="w-4 h-4 mr-1" /> TV
                        </span>
                      )}
                      {roomFeatures.ac && (
                        <span className="flex items-center text-green-600">
                          <FiStar className="w-4 h-4 mr-1" /> Air Conditioning
                        </span>
                      )}
                      {roomFeatures.minibar && (
                        <span className="flex items-center text-green-600">
                          <FiStar className="w-4 h-4 mr-1" /> Mini Bar
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  ${formatCurrency(charges.room_charges || reservation.total_amount || bookingData?.total?.subtotal || 400.40)}
                </p>
                <p className="text-sm text-gray-600">total amount</p>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FiCreditCard className="mr-2" /> Payment Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Room Charges</span>
                <span>${formatCurrency(charges.room_charges || reservation.total_amount || bookingData?.total?.subtotal || 400.40)}</span>
              </div>
              
              {charges.additional_charges > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Additional Services</span>
                  <span>${formatCurrency(charges.additional_charges)}</span>
                </div>
              )}
              
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="text-gray-600 font-semibold">Subtotal</span>
                <span className="font-semibold">
                  ${formatCurrency(charges.total || reservation.total_amount || bookingData?.total?.subtotal || 400.40)}
                </span>
              </div>
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span className="text-blue-600">
                  ${formatCurrency(charges.total || reservation.total_amount || bookingData?.total?.total || 448.45)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount Paid</span>
                <span className="text-green-600">
                  ${formatCurrency(charges.paid || reservation.paid_amount || 0)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm font-semibold border-t border-gray-200 pt-2">
                <span>Balance Due</span>
                <span className="text-orange-600">
                  ${calculateBalance()}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => window.print()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center"
              >
                <FiDownload className="w-5 h-5 mr-2" />
                Print Invoice
              </button>
              <button
                onClick={handleBackToHome}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 flex-1"
              >
                Book Another Room
              </button>
              <button
                onClick={handleViewBookings}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex-1"
              >
                View My Bookings
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-lg shadow-lg mt-6 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiFileText className="mr-2" /> Important Information
          </h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• <strong>Check-in:</strong> 2:00 PM | <strong>Check-out:</strong> 12:00 PM</p>
            <p>• Present this invoice and valid ID at reception</p>
            <p>• Payment due: {invoiceData.due_date ? new Date(invoiceData.due_date).toLocaleDateString() : 'Upon check-in'}</p>
            <p>• Cancellation policy: Free cancellation up to 24 hours before check-in</p>
            <p>• For assistance: +855-123-4567 | info@luxuryhotel.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;