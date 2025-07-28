import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CreateReservationForm = ({ onClose, onSave, rooms }) => {
  // State declarations
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false);
  const [guestSearch, setGuestSearch] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [tax, setTax] = useState(20.00);
  const [discount, setDiscount] = useState(0.00);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [loadingGuests, setLoadingGuests] = useState(false);
  const [guests, setGuests] = useState([]);

  const [form, setForm] = useState({
    guestName: '',
    guestCode: '',
    guestId: null,
    request: '',
    duration: '',
    checkIn: null,
    checkOut: null,
    status: 'confirmed',
  });

  const guestDropdownRef = useRef(null);
  const roomDropdownRef = useRef(null);

  const sharedClasses = 'w-full h-[42px] px-3 border rounded-md text-sm focus:outline-none focus:ring focus:border-blue-500';

  // Fetch guests from API
  useEffect(() => {
    const fetchGuests = async () => {
      setLoadingGuests(true);
      try {
        const response = await fetch('http://localhost:5001/api/guests');
        const data = await response.json();
        if (data.status === 'success') {
          setGuests(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch guests');
        }
      } catch (error) {
        console.error('Error fetching guests:', error);
        setError('Failed to load guests. Please try again.');
      } finally {
        setLoadingGuests(false);
      }
    };

    fetchGuests();
  }, []);

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

  useEffect(() => {
    const calculateTotal = () => {
      const total = selectedRooms.reduce((sum, room) => sum + (parseFloat(room.price) || 0), 0);
      setTotalPrice(total);
    };
    calculateTotal();
  }, [selectedRooms]);

  useEffect(() => {
    const fetchAvailableRooms = async () => {
      if (!form.checkIn || !form.checkOut) {
        setAvailableRooms([]);
        return;
      }
      
      setLoadingRooms(true);
      try {
        const from = form.checkIn.toISOString().split('T')[0];
        const to = form.checkOut.toISOString().split('T')[0];
        const res = await fetch(`http://localhost:5001/api/rooms/availability/check?from=${from}&to=${to}`);
        const data = await res.json();
        
        if (data.status === 'success') {
          // Handle both possible response structures
          const rooms = data.data?.availableRooms || data.data?.rooms || [];
          setAvailableRooms(rooms);
        } else {
          throw new Error(data.message || 'Failed to fetch available rooms');
        }
      } catch (err) {
        console.error('Failed to fetch rooms:', err);
        setError('Failed to load available rooms. Please try again.');
        setAvailableRooms([]);
      } finally {
        setLoadingRooms(false);
      }
    };

    const debounceTimer = setTimeout(fetchAvailableRooms, 300);
    return () => clearTimeout(debounceTimer);
  }, [form.checkIn, form.checkOut]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    setForm(prev => ({ ...prev, [name]: date }));
    
    if (name === 'checkIn' && form.checkOut) {
      updateDuration(date, form.checkOut);
    } else if (name === 'checkOut' && form.checkIn) {
      updateDuration(form.checkIn, date);
    }
  };

  const updateDuration = (start, end) => {
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    setForm(prev => ({ ...prev, duration: `${diff} ${diff === 1 ? 'night' : 'nights'}` }));
  };

  const toggleRoomSelection = (room) => {
    setSelectedRooms(prev => {
      const roomId = room.room_id || room.id;
      const isSelected = prev.some(r => r.room_id === roomId);
      return isSelected 
        ? prev.filter(r => r.room_id !== roomId)
        : [...prev, { 
            room_id: roomId, 
            price: parseFloat(room.price || room.room_price || 0),
            room_name: room.name || room.room_name || `Room ${roomId}`
          }];
    });
  };

  const selectGuest = (guest) => {
    setForm({
      ...form,
      guestName: guest.name,
      guestCode: guest.national_id || '',
      guestId: guest.id,
    });
    setGuestSearch(guest.name);
    setIsGuestDropdownOpen(false);
  };

  const handleGuestInputChange = (e) => {
    const value = e.target.value;
    setGuestSearch(value);
    if (value !== form.guestName) {
      setForm(prev => ({ 
        ...prev, 
        guestId: null, 
        guestCode: '',
        guestName: value 
      }));
    }
    setIsGuestDropdownOpen(true);
  };

  const clearGuestSelection = () => {
    setGuestSearch('');
    setForm(prev => ({ 
      ...prev, 
      guestId: null, 
      guestCode: '',
      guestName: '' 
    }));
    setIsGuestDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!form.guestId) return setError('Please select a valid guest');
    if (!form.checkIn || !form.checkOut) return setError('Please select both dates');
    if (form.checkOut <= form.checkIn) return setError('Check-out must be after check-in');
    if (selectedRooms.length === 0) return setError('Please select at least one room');

    const payload = {
      guestId: form.guestId,
      checkInDate: form.checkIn.toISOString(),
      checkOutDate: form.checkOut.toISOString(),
      reservationDate: new Date().toISOString(),
      totalPrice: (totalPrice + tax - discount).toFixed(2),
      tax: tax.toFixed(2),
      discount: discount.toFixed(2),
      paymentStatus: paymentStatus,
      roomDetails: selectedRooms.map(room => ({
        roomId: room.room_id,
        price: parseFloat(room.price)
      })),
      specialRequest: form.request,
      status: form.status.toLowerCase()
    };

    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5001/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error || 'Failed to create reservation');
      
      // Find the guest details
      const selectedGuest = guests.find(g => g.id === form.guestId);
      
      // Call onSave with properly formatted data
      onSave({
        ...result.data,
        id: result.data.id,
        guestId: form.guestId,
        guestDetails: {
          name: selectedGuest?.name || form.guestName,
          email: selectedGuest?.email || 'N/A',
          phone: selectedGuest?.phone || 'N/A',
          address: selectedGuest?.address || 'N/A',
          nationalId: selectedGuest?.national_id || 'N/A'
        },
        roomIds: selectedRooms.map(room => room.room_id),
        roomNames: selectedRooms.map(room => room.room_name),
        roomPrices: selectedRooms.map(room => room.price),
        request: form.request,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        status: form.status,
        tax,
        discount,
        totalAmount: totalPrice + tax - discount,
        paymentStatus,
        duration: form.duration,
        formattedCheckIn: form.checkIn.toISOString().split('T')[0],
        formattedCheckOut: form.checkOut.toISOString().split('T')[0],
        formattedCreatedAt: new Date().toISOString().split('T')[0]
      });
      
      // Close the form
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredGuests = guests.filter(guest =>
    guest.name.toLowerCase().includes(guestSearch.toLowerCase())
  );

  const isRoomSelected = (roomId) => 
    selectedRooms.some(room => room.room_id === roomId);

  const datePickerWithTopLeftLabel = (label, name, selected) => (
    <div className="relative mt-6">
      <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs">{label}</label>
      <DatePicker
        selected={selected}
        onChange={(date) => handleDateChange(name, date)}
        className={sharedClasses}
        placeholderText={`Select ${label.toLowerCase()} date`}
        dateFormat="yyyy-MM-dd"
        minDate={name === 'checkOut' ? form.checkIn : new Date()}
        selectsStart={name === 'checkIn'}
        selectsEnd={name === 'checkOut'}
        startDate={form.checkIn}
        endDate={form.checkOut}
        disabled={isSubmitting}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Create Reservation</h1>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-lg" 
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                disabled={isSubmitting || loadingGuests}
              />
              {guestSearch && (
                <button
                  type="button"
                  onClick={clearGuestSelection}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isSubmitting}
                >
                  ×
                </button>
              )}
            </div>
            {!form.guestId && guestSearch && (
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
                      key={guest.id} 
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                      onClick={() => selectGuest(guest)}
                    >
                      <span>{guest.name}</span>
                      {guest.national_id && <span className="text-xs text-gray-500">{guest.national_id}</span>}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="relative mt-6">
            <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs">Guest Code</label>
            <input
              type="text"
              value={form.guestCode}
              className={sharedClasses}
              readOnly
              disabled={isSubmitting}
            />
          </div>

          {/* Date Pickers */}
          {datePickerWithTopLeftLabel('Check-In *', 'checkIn', form.checkIn)}
          {datePickerWithTopLeftLabel('Check-Out *', 'checkOut', form.checkOut)}

          {/* Special Request */}
          <div className="relative mt-6">
            <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs">Special Request</label>
            <input
              type="text"
              name="request"
              value={form.request}
              onChange={handleChange}
              className={sharedClasses}
              placeholder="Any special requests"
              disabled={isSubmitting}
            />
          </div>

          {/* Room Selection */}
          <div className="relative mt-6" ref={roomDropdownRef}>
            <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs">Select Rooms *</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`${sharedClasses} text-left flex justify-between items-center`}
                disabled={loadingRooms || isSubmitting}
              >
                <span>
                  {selectedRooms.length > 0
                    ? `${selectedRooms.length} room(s) selected`
                    : 'Select rooms'}
                </span>
                <span>▼</span>
              </button>
              {isDropdownOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {loadingRooms ? (
                    <div className="px-3 py-2 text-gray-500">Loading rooms...</div>
                  ) : availableRooms.length === 0 ? (
                    <div className="px-3 py-2 text-gray-500">
                      {form.checkIn && form.checkOut ? 'No available rooms for selected dates' : 'Select dates first'}
                    </div>
                  ) : (
                    availableRooms.map(room => (
                      <div 
                        key={room.id} 
                        className="px-3 py-2 hover:bg-gray-100 flex items-center"
                      >
                        <input
                          type="checkbox"
                          checked={isRoomSelected(room.id)}
                          onChange={() => toggleRoomSelection(room)}
                          className="mr-2"
                          disabled={isSubmitting}
                        />
                        {room.name} - ${room.price}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Duration and Status */}
          <div className="relative mt-6">
            <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs">Duration</label>
            <input
              type="text"
              value={form.duration}
              className={sharedClasses}
              readOnly
              disabled={isSubmitting}
            />
          </div>

          <div className="relative mt-6">
            <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs">Status</label>
            <select
              value={form.status}
              onChange={handleChange}
              name="status"
              className={sharedClasses}
              disabled={isSubmitting}
            >
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Status */}
          <div className="relative mt-6">
            <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs">Payment Status</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className={sharedClasses}
              disabled={isSubmitting}
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="partially_paid">Partially Paid</option>
            </select>
          </div>

          {/* Pricing */}
          <div className="relative mt-6">
            <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs">Total Price</label>
            <input
              type="text"
              value={`$${(totalPrice + tax - discount).toFixed(2)}`}
              className={sharedClasses}
              readOnly
              disabled={isSubmitting}
            />
          </div>

          <div className="relative mt-6">
            <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs">Tax ($)</label>
            <input
              type="number"
              value={tax}
              onChange={(e) => setTax(Math.max(0, parseFloat(e.target.value) || 0))}
              className={sharedClasses}
              disabled={isSubmitting}
              min="0"
              step="0.01"
            />
          </div>

          <div className="relative mt-6">
            <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs">Discount ($)</label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
              className={sharedClasses}
              disabled={isSubmitting}
              min="0"
              step="0.01"
            />
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 flex justify-end mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReservationForm;