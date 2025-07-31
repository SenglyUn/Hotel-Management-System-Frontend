import React from 'react';
import { FiSearch, FiFilter, FiCalendar } from 'react-icons/fi';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { statusOptions, customStyles } from './constants';

const ReservationFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  loading
}) => {
  // You might want to update your statusOptions to match your API's status values
  const apiStatusOptions = [
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'checked_in', label: 'Checked In' },
    { value: 'checked_out', label: 'Checked Out' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'all', label: 'All Statuses' }
  ];

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-64">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm"
          type="text"
          placeholder="Search guest, room, etc"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="relative w-48">
        <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
        <Select
          options={apiStatusOptions}  // Using the API-specific status options
          value={statusFilter}
          onChange={setStatusFilter}
          styles={customStyles}
          isSearchable={false}
          className="text-sm"
          isDisabled={loading}
          placeholder="Select status"
        />
      </div>

      <div className="relative w-56">
        <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
        <DatePicker
          selected={dateFilter}
          onChange={(date) => setDateFilter(date)}
          placeholderText="Filter by date"
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md text-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500"
          disabled={loading}
          dateFormat="yyyy-MM-dd"
          isClearable
        />
      </div>
    </div>
  );
};

export default ReservationFilters;