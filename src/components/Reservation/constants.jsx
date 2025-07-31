// Status Visual Styles
export const statusColors = {
  pending: 'bg-blue-100 text-blue-600 border-blue-500',
  confirmed: 'bg-green-100 text-green-600 border-green-500',
  checked_in: 'bg-indigo-100 text-indigo-600 border-indigo-500',
  checked_out: 'bg-purple-100 text-purple-600 border-purple-500',
  cancelled: 'bg-red-100 text-red-600 border-red-500',
  noshow: 'bg-amber-100 text-amber-600 border-amber-500'
};

// Action Button Styles
export const actionStyles = {
  pending: 'bg-green-100 text-green-600 hover:bg-green-200',
  confirmed: 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200',
  checked_in: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
  checked_out: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
  cancelled: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
};

// Filter Dropdown Options
export const statusOptions = [
  { value: '', label: 'All Statuses', color: '#6b7280' },
  { value: 'pending', label: 'Pending', color: '#3b82f6' },
  { value: 'confirmed', label: 'Confirmed', color: '#16a34a' },
  { value: 'checked_in', label: 'Checked In', color: '#6366f1' },
  { value: 'checked_out', label: 'Checked Out', color: '#9333ea' },
  { value: 'cancelled', label: 'Cancelled', color: '#dc2626' },
  { value: 'noshow', label: 'No Show', color: '#d97706' }
];

// Status Transition Rules
export const statusTransitions = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['checked_in', 'cancelled', 'noshow'],
  checked_in: ['checked_out', 'noshow'],
  checked_out: [],
  cancelled: [],
  noshow: []
};

// Action Button Labels
export const statusActions = {
  pending: 'Confirm Booking',
  confirmed: 'Check In',
  checked_in: 'Check Out',
  checked_out: 'Checked Out',
  cancelled: 'Cancelled',
  noshow: 'No Show'
};

// Status Priority for Sorting
export const statusPriority = {
  pending: 1,
  confirmed: 2,
  checked_in: 3,
  checked_out: 4,
  noshow: 5,
  cancelled: 6
};

// Select Dropdown Styles (no changes needed)
export const customStyles = {
  control: (base, state) => ({
    ...base,
    paddingLeft: '2rem',
    borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
    boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : undefined,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? state.data.color
      : state.isFocused
      ? '#f3f4f6'
      : undefined,
    color: state.isSelected ? '#fff' : '#111827',
    paddingLeft: 20,
    position: 'relative',
    '&:before': {
      content: '" "',
      display: 'block',
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: state.data.color,
      position: 'absolute',
      left: 8,
      top: '50%',
      transform: 'translateY(-50%)',
    },
  }),
  singleValue: (base, state) => ({
    ...base,
    color: state.data.color,
    fontWeight: 500,
    position: 'relative',
    paddingLeft: 18,
    '&:before': {
      content: '" "',
      display: 'block',
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: state.data.color,
      position: 'absolute',
      left: 0,
      top: '50%',
      transform: 'translateY(-50%)',
    },
  }),
};