import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const BookingSystem = () => {
  const [activeTab, setActiveTab] = useState('book');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for the booking form
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false);
  const [guestSearch, setGuestSearch] = useState('');
  const [loadingGuests, setLoadingGuests] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [guests, setGuests] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  
  const [bookingForm, setBookingForm] = useState({
    guestId: null,
    guestName: '',
    selectedRooms: [],
    checkIn: null,
    checkOut: null,
    adults: 1,
    children: 0,
    specialRequests: '',
    status: 'confirmed'
  });

  const guestDropdownRef = useRef(null);
  const roomDropdownRef = useRef(null);

  // Load existing reservations
  useEffect(() => {
    if (activeTab === 'view') {
      setLoading(true);
      axios.get('http://localhost:5000/api/reservations')
        .then((res) => {
          if (res.data.success) {
            setBookings(res.data.data.reservations || []);
          } else {
            setError('Failed to fetch bookings: API returned unsuccessful response');
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching bookings:', err);
          setError('Failed to fetch bookings. Please try again.');
          setLoading(false);
        });
    }
  }, [activeTab]);

  // Fetch initial guest data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingGuests(true);
        
        // Fetch guests
        const guestsResponse = await axios.get('http://localhost:5000/api/guests');
        setGuests(guestsResponse.data.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load guest data. Please try again.');
      } finally {
        setLoadingGuests(false);
      }
    };

    if (activeTab === 'book') {
      fetchInitialData();
    }
  }, [activeTab]);

  // Check room availability when dates change
  useEffect(() => {
    const checkRoomAvailability = async () => {
      if (!bookingForm.checkIn || !bookingForm.checkOut) return;
      
      setLoadingAvailability(true);
      try {
        const from = bookingForm.checkIn.toISOString().split('T')[0];
        const to = bookingForm.checkOut.toISOString().split('T')[0];
        
        const res = await axios.get(
          `http://localhost:5000/api/reservations/availability/rooms?check_in=${from}&check_out=${to}&adults=${bookingForm.adults}&children=${bookingForm.children}`
        );
        
        if (!res.data.success) {
          throw new Error(res.data.message || 'Failed to check availability');
        }
        
        setAvailableRooms(res.data.data.rooms || []);
      } catch (err) {
        console.error('Failed to check availability:', err);
        setError('Failed to check room availability. Please try again.');
        setAvailableRooms([]);
      } finally {
        setLoadingAvailability(false);
      }
    };

    const debounceTimer = setTimeout(checkRoomAvailability, 500);
    return () => clearTimeout(debounceTimer);
  }, [bookingForm.checkIn, bookingForm.checkOut, bookingForm.adults, bookingForm.children]);

  // Handle click outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (guestDropdownRef.current && !guestDropdownRef.current.contains(event.target)) {
        setIsGuestDropdownOpen(false);
      }
      if (roomDropdownRef.current && !roomDropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    setBookingForm(prev => ({ ...prev, [name]: date }));
  };

  const toggleRoomSelection = (room) => {
    setBookingForm(prev => {
      const isSelected = prev.selectedRooms.some(r => r.id === room.id);
      
      if (isSelected) {
        return {
          ...prev,
          selectedRooms: prev.selectedRooms.filter(r => r.id !== room.id)
        };
      } else {
        return {
          ...prev,
          selectedRooms: [...prev.selectedRooms, {
            id: room.id,
            number: room.number,
            type: room.type,
            pricing: room.pricing
          }]
        };
      }
    });
  };

  const selectGuest = (guest) => {
    setBookingForm({
      ...bookingForm,
      guestId: guest.guest_id,
      guestName: `${guest.first_name} ${guest.last_name}`
    });
    setGuestSearch(`${guest.first_name} ${guest.last_name}`);
    setIsGuestDropdownOpen(false);
  };

  const handleGuestInputChange = (e) => {
    const value = e.target.value;
    setGuestSearch(value);
    if (value !== bookingForm.guestName) {
      setBookingForm(prev => ({ 
        ...prev, 
        guestId: null,
        guestName: '' 
      }));
    }
    setIsGuestDropdownOpen(true);
  };

  const clearGuestSelection = () => {
    setGuestSearch('');
    setBookingForm(prev => ({ 
      ...prev, 
      guestId: null,
      guestName: '' 
    }));
    setIsGuestDropdownOpen(false);
  };

  const resetForm = () => {
    setBookingForm({
      guestId: null,
      guestName: '',
      selectedRooms: [],
      checkIn: null,
      checkOut: null,
      adults: 1,
      children: 0,
      specialRequests: '',
      status: 'confirmed'
    });
    setGuestSearch('');
    setError(null);
  };

  const handleSubmitReservation = async () => {
    setError(null);
    
    // Validation
    if (!bookingForm.guestId) return setError('Please select a valid guest');
    if (bookingForm.selectedRooms.length === 0) return setError('Please select at least one room');
    if (!bookingForm.checkIn || !bookingForm.checkOut) return setError('Please select both dates');
    if (bookingForm.checkOut <= bookingForm.checkIn) return setError('Check-out must be after check-in');
    if (bookingForm.adults < 1) return setError('At least one adult is required');

    setLoading(true);
    try {
      // Create payload for each selected room
      const payloads = bookingForm.selectedRooms.map(room => ({
        guest_id: bookingForm.guestId,
        room_id: room.id,
        check_in: bookingForm.checkIn.toISOString().split('T')[0],
        check_out: bookingForm.checkOut.toISOString().split('T')[0],
        adults: parseInt(bookingForm.adults),
        children: parseInt(bookingForm.children),
        special_requests: bookingForm.specialRequests,
        status: bookingForm.status
      }));

      // Send reservation for each room
      const results = await Promise.all(
        payloads.map(payload => 
          axios.post('http://localhost:5000/api/reservations', payload)
        )
      );

      // Check for errors
      const errors = results.filter(result => !result.data.success);
      if (errors.length > 0) {
        throw new Error(errors[0].data?.message || 'Failed to create some reservations');
      }

      alert('Reservation created successfully!');
      resetForm();
      setActiveTab('view');
      
    } catch (err) {
      console.error('Error creating reservation:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredGuests = guests.filter(guest => {
    const fullName = `${guest.first_name} ${guest.last_name}`.toLowerCase();
    return fullName.includes(guestSearch.toLowerCase());
  });

  const sharedClasses = 'w-full h-[42px] px-3 border rounded-md text-sm focus:outline-none focus:ring focus:border-blue-500';

  const datePickerWithTopLeftLabel = (label, name, selected) => (
    <div className="relative mt-6">
      <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs">{label}</label>
      <DatePicker
        selected={selected}
        onChange={(date) => handleDateChange(name, date)}
        className={sharedClasses}
        placeholderText={`Select ${label.toLowerCase()} date`}
        dateFormat="yyyy-MM-dd"
        minDate={name === 'checkOut' ? bookingForm.checkIn : new Date()}
        selectsStart={name === 'checkIn'}
        selectsEnd={name === 'checkOut'}
        startDate={bookingForm.checkIn}
        endDate={bookingForm.checkOut}
        disabled={loading}
      />
    </div>
  );

  const renderTabContent = () => {
    if (activeTab === 'book') {
      return (
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <h2 className="text-xl font-bold">New Reservation</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Guest Selection */}
            <div className="relative mt-6" ref={guestDropdownRef}>
              <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs">Guest Name *</label>
              <div className="relative">
                <input
                  type="text"
                  value={guestSearch}
                  onChange={handleGuestInputChange}
                  onFocus={() => setIsGuestDropdownOpen(true)}
                  className={sharedClasses}
                  required
                  placeholder="Select guest"
                  disabled={loading || loadingGuests}
                />
                {guestSearch && (
                  <button
                    type="button"
                    onClick={clearGuestSelection}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={loading}
                  >
                    ×
                  </button>
                )}
              </div>
              {!bookingForm.guestId && guestSearch && (
                <div className="text-red-500 text-xs mt-1">
                  Please select a guest from the dropdown
                </div>
              )}
              {isGuestDropdownOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {loadingGuests ? (
                    <div className="px-3 py-2 text-gray-500">Loading guests...</div>
                  ) : filteredGuests.length === 0 ? (
                    <div className="px-3 py-2 text-gray-500">
                      {guestSearch ? 'No matching guests found' : 'Start typing to search guests'}
                    </div>
                  ) : (
                    filteredGuests.map(guest => (
                      <div 
                        key={guest.guest_id} 
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                        onClick={() => selectGuest(guest)}
                      >
                        <span>{guest.first_name} {guest.last_name}</span>
                        <span className="text-xs text-gray-500">{guest.email}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Adults and Children */}
            <div className="relative mt-6">
              <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs">Adults *</label>
              <input
                type="number"
                name="adults"
                value={bookingForm.adults}
                onChange={handleFormChange}
                className={sharedClasses}
                min="1"
                required
                disabled={loading}
              />
            </div>

            <div className="relative mt-6">
              <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs">Children</label>
              <input
                type="number"
                name="children"
                value={bookingForm.children}
                onChange={handleFormChange}
                className={sharedClasses}
                min="0"
                disabled={loading}
              />
            </div>

            {/* Date Pickers */}
            {datePickerWithTopLeftLabel('Check-In *', 'checkIn', bookingForm.checkIn)}
            {datePickerWithTopLeftLabel('Check-Out *', 'checkOut', bookingForm.checkOut)}

            {/* Status */}
            <div className="relative mt-6">
              <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs">Status</label>
              <select
                value={bookingForm.status}
                onChange={handleFormChange}
                name="status"
                className={sharedClasses}
                disabled={loading}
              >
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Special Request */}
            <div className="relative mt-6">
              <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs">Special Request</label>
              <input
                type="text"
                name="specialRequests"
                value={bookingForm.specialRequests}
                onChange={handleFormChange}
                className={sharedClasses}
                placeholder="Any special requests"
                disabled={loading}
              />
            </div>
          </div>

          {/* Room Selection */}
          <div className="relative mt-6" ref={roomDropdownRef}>
            <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs">Select Rooms *</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`${sharedClasses} text-left flex justify-between items-center`}
                disabled={loading || loadingAvailability || !bookingForm.checkIn || !bookingForm.checkOut}
              >
                <span>
                  {bookingForm.selectedRooms.length > 0 ? `${bookingForm.selectedRooms.length} room(s) selected` : 
                   !bookingForm.checkIn || !bookingForm.checkOut ? 'Select dates first' :
                   loadingAvailability ? 'Checking availability...' : 'Select rooms'}
                </span>
                <span>▼</span>
              </button>
              {isDropdownOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {loadingAvailability ? (
                    <div className="px-3 py-2 text-gray-500">Checking room availability...</div>
                  ) : availableRooms.length === 0 ? (
                    <div className="px-3 py-2 text-gray-500">
                      {!bookingForm.checkIn || !bookingForm.checkOut ? 'Select dates first' : 'No available rooms for selected dates'}
                    </div>
                  ) : (
                    availableRooms.map(room => {
                      const isSelected = bookingForm.selectedRooms.some(r => r.id === room.id);
                      return (
                        <div 
                          key={room.id} 
                          className={`px-3 py-2 cursor-pointer ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
                          onClick={() => toggleRoomSelection(room)}
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="mr-2"
                            />
                            <div>
                              <div className="font-medium">Room {room.number}</div>
                              <div className="text-sm text-gray-600">
                                {room.type.name} - {room.pricing.currency} {room.pricing.total} | Capacity: {room.type.capacity}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {room.amenities?.map(a => a.name).join(', ')}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
            {bookingForm.selectedRooms.length > 0 && (
              <div className="mt-2">
                <div className="text-xs font-medium mb-1">Selected Rooms:</div>
                <div className="flex flex-wrap gap-2">
                  {bookingForm.selectedRooms.map(room => (
                    <div 
                      key={room.id} 
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center"
                    >
                      {room.number}
                      <button
                        type="button"
                        onClick={() => toggleRoomSelection(room)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-2 font-medium">
                  Total: {bookingForm.selectedRooms
                    .reduce((sum, room) => sum + parseFloat(room.pricing.total || room.pricing.base_price || 0), 0)
                    .toFixed(2)}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleSubmitReservation}
            disabled={bookingForm.selectedRooms.length === 0 || loading}
            className={`mt-6 px-6 py-3 rounded-md text-white font-medium w-full ${
              bookingForm.selectedRooms.length === 0 || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              `Create Reservation (${bookingForm.selectedRooms.length} ${bookingForm.selectedRooms.length === 1 ? 'room' : 'rooms'} selected)`
            )}
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Existing Reservations</h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : bookings.length === 0 ? (
          <p className="text-gray-500">No reservations found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guests</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.reservation_id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {booking.guest ? `${booking.guest.first_name} ${booking.guest.last_name}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {booking.room ? `Room ${booking.room.room_number} (${booking.room.room_type?.name})` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(booking.check_in).toLocaleDateString()} -{' '}
                      {new Date(booking.check_out).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {booking.adults} adults, {booking.children} children
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      ${parseFloat(booking.total_amount || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Hotel Booking System</h1>

      <div className="flex border-b mb-6">
        {['book', 'view'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setError(null);
            }}
            className={`py-2 px-4 font-medium ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'book' ? 'New Booking' : 'View Reservations'}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex justify-between items-center">
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {renderTabContent()}
    </div>
  );
};

export default BookingSystem;