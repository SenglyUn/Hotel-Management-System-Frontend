// Status Visual Styles
export const statusColors = {
  confirmed: 'bg-green-100 text-green-600 border-green-500',
  pending: 'bg-blue-100 text-blue-600 border-blue-500',
  cancelled: 'bg-red-100 text-red-600 border-red-500',
  completed: 'bg-purple-100 text-purple-600 border-purple-500', // New status
  noshow: 'bg-amber-100 text-amber-600 border-amber-500' // New status
};

// Action Button Styles
export const actionStyles = {
  confirmed: 'bg-red-100 text-red-500 hover:bg-red-200',
  pending: 'bg-green-100 text-green-600 hover:bg-green-200',
  completed: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
  cancelled: 'bg-blue-100 text-blue-600 hover:bg-blue-200'
};

// Filter Dropdown Options
export const statusOptions = [
  { value: '', label: 'All Status', color: '#6b7280' },
  { value: 'pending', label: 'Pending', color: '#2563eb' },
  { value: 'confirmed', label: 'Confirmed', color: '#16a34a' },
  { value: 'completed', label: 'Completed', color: '#9333ea' },
  { value: 'cancelled', label: 'Cancelled', color: '#dc2626' },
  { value: 'noshow', label: 'No Show', color: '#d97706' }
];

// Status Transition Rules
export const statusTransitions = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled', 'noshow'],
  completed: [], // Final state
  cancelled: [], // Final state
  noshow: [] // Final state
};

// Action Button Labels
export const statusActions = {
  pending: 'Confirm Booking',
  confirmed: 'Mark as Completed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  noshow: 'No Show'
};

// Status Priority for Sorting
export const statusPriority = {
  pending: 1,
  confirmed: 2,
  completed: 3,
  noshow: 4,
  cancelled: 5
};

// Select Dropdown Styles
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