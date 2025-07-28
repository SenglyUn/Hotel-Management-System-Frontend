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

      {!loading && reservations.map((r) => (
        <div
          key={r.id}
          className="grid grid-cols-7 gap-3 px-6 py-4 border-b items-center text-[13px] text-gray-800 hover:bg-gray-50"
        >
          <div>
            <div className="font-medium">{r.name}</div>
            <div className="text-[12px] text-gray-500">{r.code}</div>
          </div>
          <div className="flex flex-col">
            {r.roomNames?.length > 0 ? (
              r.roomNames.map((room, i) => (
                <span key={i} className="text-[12px]">
                  {room}
                  {i < r.roomNames.length - 1 ? ',' : ''}
                </span>
              ))
            ) : (
              <span className="text-[12px] text-gray-500">None</span>
            )}
          </div>
          <div className="text-[12px]">{r.request}</div>
          <div className="text-[12px]">{r.duration}</div>
          <div className="text-[12px]">{formatDateRange(r.checkIn, r.checkOut)}</div>
          <div>
            <span
              className={`px-3 py-1 rounded-md border text-xs font-semibold ${
                statusColors[r.status] || 'bg-gray-100 text-gray-600 border-gray-300'
              }`}
            >
              {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleViewDetails(r)}
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
                actionStyles[r.status] || 'bg-gray-100 text-gray-600'
              }`}
            >
              {r.status === 'paid' ? 'Cancel' : 'Confirm'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReservationTable;