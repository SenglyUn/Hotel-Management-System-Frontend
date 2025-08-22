import React, { useEffect, useState } from 'react';
import { FiArrowLeft, FiEdit, FiMail, FiPhone, FiDollarSign, FiCalendar, FiUser } from 'react-icons/fi';

const ReservationDetail = ({ 
  selectedReservation = {}, 
  handleBackToList,
  handleViewInvoice,
  handleEditReservation
}) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch invoice data when component mounts or reservation changes
  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        if (!selectedReservation?.reservation_id) return;
        
        setLoading(true);
        // Updated to match your API endpoint
        const response = await fetch(`http://localhost:5000/api/reservations/${selectedReservation.reservation_id}/invoice`);
        const data = await response.json();
        
        if (data.success) {
          setInvoice(data.data.invoice);
        } else {
          setError('Failed to fetch invoice data');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceData();
  }, [selectedReservation]);

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) 
        ? 'Invalid date' 
        : date.toLocaleDateString(undefined, { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
    } catch (e) {
      console.error("Error formatting date:", e);
      return 'N/A';
    }
  };

  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    try {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      
      if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
        return 0;
      }
      
      const diff = checkOutDate - checkInDate;
      const nights = Math.floor(diff / (1000 * 60 * 60 * 24));
      return nights > 0 ? nights : 1; // Minimum 1 night for same-day stays
    } catch (e) {
      console.error("Error calculating nights:", e);
      return 0;
    }
  };

  // Status styling
  const statusColors = {
    paid: 'bg-green-100 text-green-800',
    unpaid: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
    default: 'bg-gray-100 text-gray-800'
  };

  // Safely get all data with defaults
  const reservation = selectedReservation || {};
  const guestDetails = reservation.guest || {};
  
  // Create room details from the API response
  const roomDetails = reservation.room ? [{
    id: reservation.room.room_id,
    name: reservation.room.room_number,
    price: reservation.total_amount
  }] : [];

  // Get values from invoice or fallback to reservation data
  const getNumericValue = (value) => parseFloat(value) || 0;
  
  // Calculate the number of nights
  const nights = calculateNights(reservation.check_in, reservation.check_out);
  
  // Calculate room charges based on invoice or reservation data
  const calculateRoomCharges = () => {
    if (invoice && invoice.charges?.room_charges) {
      return getNumericValue(invoice.charges.room_charges);
    }
    
    // Fallback: calculate from reservation data
    return getNumericValue(reservation.total_amount);
  };
  
  const roomCharges = calculateRoomCharges();
  const additionalCharges = invoice ? getNumericValue(invoice.charges?.additional_charges) : 0;
  const totalAmount = invoice ? getNumericValue(invoice.charges?.total) : getNumericValue(reservation.total_amount);
  const paidAmount = invoice ? getNumericValue(invoice.charges?.paid) : getNumericValue(reservation.paid_amount);
  const balance = invoice ? getNumericValue(invoice.charges?.balance) : (totalAmount - paidAmount);
  
  const status = (invoice?.status || reservation.status || 'pending').toLowerCase();
  const durationText = nights === 1 ? `${nights} night` : `${nights} nights`;

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reservation details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>Error loading reservation: {error}</p>
          <button
            onClick={handleBackToList}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Reservations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-800">
      <button
        onClick={handleBackToList}
        className="flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-800 transition-colors"
      >
        <FiArrowLeft /> Back to Reservations
      </button>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Reservation Details</h2>
            <p className="text-sm text-gray-500">ID: {reservation.reservation_id || 'N/A'}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleEditReservation && handleEditReservation(reservation)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors flex items-center gap-2"
            >
              <FiEdit size={16} /> Edit
            </button>
            <button
              onClick={handleViewInvoice}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FiDollarSign size={16} /> View Invoice
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-3 border-b pb-2 flex items-center gap-2">
              <FiCalendar /> Reservation Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                  statusColors[status] || statusColors.default
                }`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Created:</span>
                <span>{formatDate(reservation.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total Amount:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              {invoice?.invoice_number && (
                <div className="flex justify-between">
                  <span className="font-medium">Invoice #:</span>
                  <span>{invoice.invoice_number}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-3 border-b pb-2 flex items-center gap-2">
              <FiUser /> Guest Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Name:</span>
                <span>{invoice?.guest?.first_name || guestDetails.first_name || 'N/A'} {invoice?.guest?.last_name || guestDetails.last_name || ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Guest ID:</span>
                <span>{invoice?.guest?.guest_id || guestDetails.guest_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Email:</span>
                <a 
                  href={`mailto:${invoice?.guest?.email || guestDetails.email || ''}`} 
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <FiMail size={14} /> {invoice?.guest?.email || guestDetails.email || 'N/A'}
                </a>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Phone:</span>
                <a 
                  href={`tel:${guestDetails.phone || ''}`} 
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <FiPhone size={14} /> {guestDetails.phone || 'N/A'}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-3 border-b pb-2">Stay Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Check-In:</span>
                <span>{formatDate(reservation.check_in)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Check-Out:</span>
                <span>{formatDate(reservation.check_out)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Nights:</span>
                <span>{durationText}</span>
              </div>
              {reservation.adults && (
                <div className="flex justify-between">
                  <span className="font-medium">Adults:</span>
                  <span>{reservation.adults}</span>
                </div>
              )}
              {reservation.children && (
                <div className="flex justify-between">
                  <span className="font-medium">Children:</span>
                  <span>{reservation.children}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-3 border-b pb-2">Rooms</h3>
            <div className="space-y-3">
              {roomDetails.length > 0 ? (
                roomDetails.map((room, index) => (
                  <div key={room.id || index} className="flex justify-between">
                    <span className="font-medium">{room.name || `Room ${index + 1}`}:</span>
                    <span>${getNumericValue(room.price).toFixed(2)}/night</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No rooms assigned</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-8">
          <h3 className="font-medium text-gray-700 mb-3 border-b pb-2">Pricing Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Room Charges ({nights} nights):</span>
              <span>${roomCharges.toFixed(2)}</span>
            </div>
            {additionalCharges > 0 && (
              <div className="flex justify-between">
                <span className="font-medium">Additional Charges:</span>
                <span>${additionalCharges.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total Amount:</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span className="font-medium">Paid Amount:</span>
              <span>${paidAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-semibold text-lg">
              <span>Balance Due:</span>
              <span>${balance.toFixed(2)}</span>
            </div>
            {invoice?.payment_method && (
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Payment Method:</span>
                <span className="capitalize">{invoice.payment_method}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-3 border-b pb-2">Special Requests</h3>
          <p className={reservation.special_requests ? "text-gray-800" : "text-gray-500 italic"}>
            {reservation.special_requests || 'No special requests'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetail;