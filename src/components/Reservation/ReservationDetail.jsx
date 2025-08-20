import React, { useEffect, useState } from 'react';
import { FiArrowLeft, FiEdit, FiMail, FiPhone } from 'react-icons/fi';

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
        if (!selectedReservation?.id) return;
        
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/invoices');
        const data = await response.json();
        
        if (data.success) {
          const reservationInvoice = data.data.find(
            inv => inv.reservation_id === selectedReservation.id
          );
          setInvoice(reservationInvoice);
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
    cancelled: 'bg-red-100 text-red-800',
    default: 'bg-gray-100 text-gray-800'
  };

  // Safely get all data with defaults
  const reservation = selectedReservation || {};
  const guestDetails = reservation.guestDetails || {};
  const roomDetails = reservation.roomDetails || [];
  
  // Get values from invoice or fallback to reservation data
  const getNumericValue = (value) => parseFloat(value) || 0;
  
  // Calculate the number of nights
  const nights = calculateNights(reservation.checkIn, reservation.checkOut);
  
  // Calculate room charges based on room prices and duration
const calculateRoomCharges = () => {
  if (invoice && invoice.total_price) {
    return getNumericValue(invoice.total_price);
  }
  
  // Fallback: calculate from room details if invoice doesn't have total_price
  return roomDetails.reduce((total, room) => {
    return total + (getNumericValue(room.price) * nights);
  }, 0);
};
  
  const roomCharges = calculateRoomCharges();
  const tax = invoice ? getNumericValue(invoice.tax) : 0;
  const discount = invoice ? getNumericValue(invoice.discount) : 0;
  const subtotal = roomCharges - discount;
  const totalAmount = subtotal + tax;
  
  const status = (invoice?.payment_status || reservation.status || 'pending').toLowerCase();
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
            <p className="text-sm text-gray-500">ID: {reservation.id || 'N/A'}</p>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              View Invoice
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-3 border-b pb-2">Reservation Information</h3>
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
                <span>{formatDate(reservation.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total Price:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-3 border-b pb-2">Guest Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Name:</span>
                <span>{invoice?.guest_name || guestDetails.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Guest ID:</span>
                <span>{invoice?.guest_id || reservation.guestId || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Email:</span>
                <a 
                  href={`mailto:${invoice?.guest_email || guestDetails.email || ''}`} 
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <FiMail size={14} /> {invoice?.guest_email || guestDetails.email || 'N/A'}
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
                <span>{formatDate(reservation.checkIn)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Check-Out:</span>
                <span>{formatDate(reservation.checkOut)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Nights:</span>
                <span>{durationText}</span>
              </div>
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
              <span className="font-medium">Room Charges:</span>
              <span>${roomCharges.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span className="font-medium">Discount:</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Tax:</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total:</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-3 border-b pb-2">Special Requests</h3>
          <p className={reservation.request ? "text-gray-800" : "text-gray-500 italic"}>
            {reservation.request || 'No special requests'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetail;