// Date Formatting Utilities
export const formatDateRange = (start, end) => {
  if (!start || !end) return '';
  try {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const from = new Date(start).toLocaleDateString('en-US', options);
    const to = new Date(end).toLocaleDateString('en-US', options);
    return `${from} - ${to}`;
  } catch {
    return 'Invalid date range';
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  } catch {
    return 'Invalid date';
  }
};

// Status Handling
export const getStatusStyle = (status) => {
  const styles = {
    confirmed: 'bg-green-100 text-green-800 border-green-300',
    pending: 'bg-blue-100 text-blue-800 border-blue-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
    completed: 'bg-purple-100 text-purple-800 border-purple-300',
    no_show: 'bg-yellow-100 text-yellow-800 border-yellow-300'
  };
  return styles[status] || 'bg-gray-100 text-gray-800 border-gray-300';
};

// Calculation Utilities
export const calculateNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  try {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
};

// API Utilities
export const fetchWithRetry = async (url, options = {}, retries = 3, delay = 1000) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay);
    }
    throw error;
  }
};

// Price Formatting
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount || 0);
};

// Data Normalization
export const normalizeReservation = (reservation, guests = [], rooms = []) => {
  const guest = guests.find(g => g.id === reservation.guest_id) || {};
  const roomDetails = reservation.rooms?.map(resRoom => {
    const room = rooms.find(r => r.id === resRoom.room_id) || {};
    return {
      ...room,
      price: parseFloat(resRoom.price || room.price || 0)
    };
  }) || [];

  return {
    ...reservation,
    guest,
    roomDetails,
    nights: calculateNights(reservation.check_in_date, reservation.check_out_date)
  };
};