import React from 'react';
import { FiEye, FiEdit2, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { statusColors, actionStyles } from './constants';
import { formatDateRange } from './utils';

const ReservationTable = ({ reservations, handleViewDetails, loading }) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="grid grid-cols-7 gap-3 px-6 py-3 border-b font-semibold bg-gray-50 text-gray-700 text-[13px]">
        {['Guest', 'Room', 'Request', 'Duration', 'Check-In/Out', 'Status', 'Action'].map((header) => (
          <div key={header} className="flex flex-col items-start gap-[1px]">
            <span className="flex items-center gap-0.5">
              {header}
              {['Guest', 'Room', 'Check-In/Out'].includes(header) && (
                <span className="flex flex-col justify-center text-gray-400 text-[8px] mt-1">
                  <FiChevronUp className="w-2 h-2 mb-[1px]" />
                  <FiChevronDown className="w-2 h-2" />
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

      {loading && (
        <div className="p-6 text-center text-gray-500">Loading reservations...</div>
      )}

      {!loading && reservations.length === 0 && (
        <div className="p-6 text-center text-gray-500">No reservations found.</div>
      )}

      {!loading && reservations.map((reservation) => {
        const roomNumber = reservation.roomNumber || 
                          reservation.room?.room_number || 
                          `Room ${reservation.room_id}`;
        const roomType = reservation.roomType || 
                        reservation.room?.room_type?.name || 
                        'Standard';

        return (
          <div
            key={reservation.reservation_id || reservation.id}
            className="grid grid-cols-7 gap-3 px-6 py-4 border-b items-center text-[13px] text-gray-800 hover:bg-gray-50"
          >
            {/* Guest Column */}
            <div>
              <div className="font-medium">
                {reservation.guestDetails?.name || 
                 `${reservation.guest?.first_name || ''} ${reservation.guest?.last_name || ''}`.trim()}
              </div>
              <div className="text-[12px] text-gray-500">
                {reservation.code || `R-${(reservation.reservation_id || reservation.id).toString().padStart(6, '0')}`}
              </div>
            </div>

            {/* Room Column - Updated to show room number in parentheses */}
            <div className="flex flex-col">
              <span className="text-[12px]">
                {roomType} ({roomNumber})
              </span>
            </div>

            {/* Request Column */}
            <div className="text-[12px]">
              {reservation.special_requests || 
               reservation.specialRequests || 
               'None'}
            </div>

            {/* Duration Column */}
            <div className="text-[12px]">
              {reservation.duration || 
               `${calculateNights(reservation.check_in, reservation.check_out)} night${calculateNights(reservation.check_in, reservation.check_out) !== 1 ? 's' : ''}`}
            </div>

            {/* Check-In/Out Column */}
            <div className="text-[12px]">
              {formatDateRange(
                reservation.check_in || reservation.checkIn, 
                reservation.check_out || reservation.checkOut
              )}
            </div>

            {/* Status Column */}
            <div>
              <span
                className={`px-3 py-1 rounded-md border text-xs font-semibold ${
                  statusColors[reservation.status] || 'bg-gray-100 text-gray-600 border-gray-300'
                }`}
              >
                {reservation.status?.charAt(0).toUpperCase() + reservation.status?.slice(1)}
              </span>
            </div>

            {/* Action Column */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleViewDetails(reservation)}
                className="p-2 text-gray-500 hover:text-gray-700 bg-white border rounded-md"
                title="View Details"
              >
                <FiEye className="text-sm" />
              </button>
              <button 
                className="p-2 text-gray-500 hover:text-gray-700 bg-white border rounded-md"
                title="Edit"
              >
                <FiEdit2 className="text-sm" />
              </button>
              <button
                className={`px-3 py-1 rounded-md text-xs font-medium ${
                  actionStyles[reservation.status] || 'bg-gray-100 text-gray-600'
                }`}
              >
                {reservation.status === 'confirmed' ? 'Check In' : 
                 reservation.status === 'checked_in' ? 'Check Out' : 'Confirm'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Helper function if not already imported
function calculateNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const oneDay = 24 * 60 * 60 * 1000;
  const firstDate = new Date(checkIn);
  const secondDate = new Date(checkOut);
  return Math.round(Math.abs((firstDate - secondDate) / oneDay));
}

export default ReservationTable;