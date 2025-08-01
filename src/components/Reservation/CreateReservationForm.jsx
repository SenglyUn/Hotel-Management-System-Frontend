import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CreateReservationForm = ({ onClose, onSave }) => {
  // State declarations
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false);
  const [guestSearch, setGuestSearch] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingGuests, setLoadingGuests] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [guests, setGuests] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [existingReservations, setExistingReservations] = useState([]);
  const [additionalGuests, setAdditionalGuests] = useState([]);
  const [newAdditionalGuest, setNewAdditionalGuest] = useState({
    name: '',
    email: '',
    phone: '',
    id_type: 'Passport',
    id_number: ''
  });

  const [form, setForm] = useState({
    guestId: null,
    guestName: '',
    roomId: null,
    roomNumber: '',
    checkIn: null,
    checkOut: null,
    adults: 1,
    children: 0,
    specialRequests: '',
    status: 'confirmed'
  });

  const guestDropdownRef = useRef(null);
  const roomDropdownRef = useRef(null);

  const sharedClasses = 'w-full h-[42px] px-3 border rounded-md text-sm focus:outline-none focus:ring focus:border-blue-500';

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingGuests(true);
        setLoadingRooms(true);
        
        // Fetch guests
        const guestsResponse = await fetch('http://localhost:5000/api/guests');
        const guestsData = await guestsResponse.json();
        setGuests(guestsData);
        
        // Fetch all rooms
        const roomsResponse = await fetch('http://localhost:5000/api/rooms');
        const roomsData = await roomsResponse.json();
        if (roomsData.success) {
          setAllRooms(roomsData.data);
        } else {
          throw new Error(roomsData.message || 'Failed to fetch rooms');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoadingGuests(false);
        setLoadingRooms(false);
      }
    };

    fetchInitialData();
  }, []);

  // Check room availability when dates change
  useEffect(() => {
    const checkRoomAvailability = async () => {
      if (!form.checkIn || !form.checkOut) return;
      
      setLoadingAvailability(true);
      try {
        // First fetch all reservations that overlap with our dates
        const from = form.checkIn.toISOString().split('T')[0];
        const to = form.checkOut.toISOString().split('T')[0];
        
        const res = await fetch(
          `http://localhost:5000/api/reservations?check_in=${from}&check_out=${to}`
        );
        const reservationsData = await res.json();
        
        if (!reservationsData.success) {
          throw new Error(reservationsData.message || 'Failed to fetch reservations');
        }
        
        setExistingReservations(reservationsData.data.reservations);
        
        // Get all booked room IDs (only confirmed reservations)
        const bookedRoomIds = reservationsData.data.reservations
          .filter(res => res.status === 'confirmed')
          .map(res => res.room_id);
        
        // Filter available rooms (not booked and status available)
        const available = allRooms.filter(room => 
          room.status === 'available' && 
          !bookedRoomIds.includes(room.room_id)
        );
        
        setAvailableRooms(available);
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
  }, [form.checkIn, form.checkOut, allRooms]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    setForm(prev => ({ ...prev, [name]: date }));
  };

  const selectRoom = (room) => {
    setForm(prev => ({
      ...prev,
      roomId: room.room_id,
      roomNumber: room.room_number
    }));
    setIsDropdownOpen(false);
  };

  const selectGuest = (guest) => {
    setForm({
      ...form,
      guestId: guest.guest_id,
      guestName: `${guest.first_name} ${guest.last_name}`
    });
    setGuestSearch(`${guest.first_name} ${guest.last_name}`);
    setIsGuestDropdownOpen(false);
    
    // Auto-fill additional guests from the same family
    if (guest.last_name) {
      const familyMembers = guests.filter(g => 
        g.guest_id !== guest.guest_id && 
        g.last_name === guest.last_name
      );
      
      const autoFilledGuests = familyMembers.map(member => ({
        name: `${member.first_name} ${member.last_name}`,
        email: member.email,
        phone: member.phone,
        id_type: member.id_type || 'Passport',
        id_number: member.id_number || ''
      }));
      
      setAdditionalGuests(autoFilledGuests);
    }
  };

  const handleGuestInputChange = (e) => {
    const value = e.target.value;
    setGuestSearch(value);
    if (value !== form.guestName) {
      setForm(prev => ({ 
        ...prev, 
        guestId: null,
        guestName: '' 
      }));
      setAdditionalGuests([]);
    }
    setIsGuestDropdownOpen(true);
  };

  const clearGuestSelection = () => {
    setGuestSearch('');
    setForm(prev => ({ 
      ...prev, 
      guestId: null,
      guestName: '' 
    }));
    setAdditionalGuests([]);
    setIsGuestDropdownOpen(false);
  };

  const handleAddAdditionalGuest = () => {
    if (!newAdditionalGuest.name) {
      setError('Please enter guest name');
      return;
    }
    
    setAdditionalGuests([...additionalGuests, newAdditionalGuest]);
    setNewAdditionalGuest({
      name: '',
      email: '',
      phone: '',
      id_type: 'Passport',
      id_number: ''
    });
  };

  const handleRemoveAdditionalGuest = (index) => {
    setAdditionalGuests(additionalGuests.filter((_, i) => i !== index));
  };

  const handleAdditionalGuestChange = (e, field) => {
    setNewAdditionalGuest({
      ...newAdditionalGuest,
      [field]: e.target.value
    });
  };

  const resetForm = () => {
    setForm({
      guestId: null,
      guestName: '',
      roomId: null,
      roomNumber: '',
      checkIn: null,
      checkOut: null,
      adults: 1,
      children: 0,
      specialRequests: '',
      status: 'confirmed'
    });
    setGuestSearch('');
    setAdditionalGuests([]);
    setNewAdditionalGuest({
      name: '',
      email: '',
      phone: '',
      id_type: 'Passport',
      id_number: ''
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!form.guestId) return setError('Please select a valid guest');
    if (!form.roomId) return setError('Please select a room');
    if (!form.checkIn || !form.checkOut) return setError('Please select both dates');
    if (form.checkOut <= form.checkIn) return setError('Check-out must be after check-in');
    if (form.adults < 1) return setError('At least one adult is required');

    // Double-check room availability
    const isRoomAvailable = !existingReservations.some(
      res => res.room_id === form.roomId && 
            res.status === 'confirmed' &&
            ((new Date(res.check_in) < new Date(form.checkOut)) && 
             (new Date(res.check_out) > new Date(form.checkIn)))
    );
    
    if (!isRoomAvailable) {
      return setError('Selected room is no longer available for these dates');
    }

    setIsSubmitting(true);
    try {
      const payload = {
        guest_id: form.guestId,
        room_id: form.roomId,
        check_in: form.checkIn.toISOString().split('T')[0],
        check_out: form.checkOut.toISOString().split('T')[0],
        adults: parseInt(form.adults),
        children: parseInt(form.children),
        special_requests: form.specialRequests,
        additional_guests: additionalGuests.map(guest => ({
          name: guest.name,
          email: guest.email,
          phone: guest.phone,
          id_type: guest.id_type,
          id_number: guest.id_number
        }))
      };

      const res = await fetch('http://localhost:5000/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.message || 'Failed to create reservation');
      }
      
      // Find the guest details
      const selectedGuest = guests.find(g => g.guest_id === form.guestId);
      
      // Prepare complete reservation data
      const completeReservation = {
        ...result.data,
        reservation_id: result.data.reservation_id,
        guest_id: form.guestId,
        guest_details: {
          name: selectedGuest ? `${selectedGuest.first_name} ${selectedGuest.last_name}` : '',
          email: selectedGuest?.email || '',
          phone: selectedGuest?.phone || ''
        },
        room_id: form.roomId,
        room_number: form.roomNumber,
        special_requests: form.specialRequests,
        check_in: form.checkIn,
        check_out: form.checkOut,
        status: form.status,
        adults: form.adults,
        children: form.children,
        additional_guests: additionalGuests,
        formatted_check_in: form.checkIn.toISOString().split('T')[0],
        formatted_check_out: form.checkOut.toISOString().split('T')[0],
        formatted_created_at: new Date().toISOString().split('T')[0]
      };

      // Call onSave and wait for it to complete
      await onSave(completeReservation);
      
      // Reset form and close
      resetForm();
      onClose();
      
    } catch (err) {
      console.error('Error creating reservation:', err);
      setError(err.message || 'Failed to create reservation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredGuests = guests.filter(guest => {
    const fullName = `${guest.first_name} ${guest.last_name}`.toLowerCase();
    return fullName.includes(guestSearch.toLowerCase());
  });

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
            onClick={() => {
              resetForm();
              onClose();
            }}
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

          {/* Room Selection */}
          <div className="relative mt-6" ref={roomDropdownRef}>
            <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs">Select Room *</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`${sharedClasses} text-left flex justify-between items-center`}
                disabled={isSubmitting || loadingAvailability || !form.checkIn || !form.checkOut}
              >
                <span>
                  {form.roomNumber ? `Room ${form.roomNumber}` : 
                   !form.checkIn || !form.checkOut ? 'Select dates first' :
                   loadingAvailability ? 'Checking availability...' : 'Select room'}
                </span>
                <span>▼</span>
              </button>
              {isDropdownOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {loadingAvailability ? (
                    <div className="px-3 py-2 text-gray-500">Checking room availability...</div>
                  ) : availableRooms.length === 0 ? (
                    <div className="px-3 py-2 text-gray-500">
                      {!form.checkIn || !form.checkOut ? 'Select dates first' : 'No available rooms for selected dates'}
                    </div>
                  ) : (
                    availableRooms.map(room => (
                      <div 
                        key={room.room_id} 
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => selectRoom(room)}
                      >
                        <div className="font-medium">Room {room.room_number}</div>
                        <div className="text-sm text-gray-600">
                          {room.type.name} - ${room.type.base_price} | Capacity: {room.type.capacity}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {room.amenities?.map(a => a.name).join(', ')}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Date Pickers */}
          {datePickerWithTopLeftLabel('Check-In *', 'checkIn', form.checkIn)}
          {datePickerWithTopLeftLabel('Check-Out *', 'checkOut', form.checkOut)}

          {/* Guest Counts */}
          <div className="relative mt-6">
            <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs">Adults *</label>
            <input
              type="number"
              name="adults"
              value={form.adults}
              onChange={handleChange}
              className={sharedClasses}
              min="1"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="relative mt-6">
            <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs">Children</label>
            <input
              type="number"
              name="children"
              value={form.children}
              onChange={handleChange}
              className={sharedClasses}
              min="0"
              disabled={isSubmitting}
            />
          </div>

          {/* Status */}
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

          {/* Special Request */}
          <div className="relative mt-6 md:col-span-2">
            <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs">Special Request</label>
            <input
              type="text"
              name="specialRequests"
              value={form.specialRequests}
              onChange={handleChange}
              className={sharedClasses}
              placeholder="Any special requests"
              disabled={isSubmitting}
            />
          </div>

          {/* Additional Guests */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-medium mb-2">Additional Guests</h3>
            {additionalGuests.map((guest, index) => (
              <div key={index} className="flex items-center mb-2">
                <div className="flex-1 bg-gray-100 p-2 rounded">
                  <div className="text-sm">{guest.name}</div>
                  <div className="text-xs text-gray-500">
                    {guest.id_type}: {guest.id_number} | {guest.email} | {guest.phone}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAdditionalGuest(index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                  disabled={isSubmitting}
                >
                  ×
                </button>
              </div>
            ))}

            <div className="grid grid-cols-1 gap-2 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newAdditionalGuest.name}
                  onChange={(e) => handleAdditionalGuestChange(e, 'name')}
                  className={sharedClasses}
                  placeholder="Guest name"
                  disabled={isSubmitting}
                />
                <select
                  value={newAdditionalGuest.id_type}
                  onChange={(e) => handleAdditionalGuestChange(e, 'id_type')}
                  className={sharedClasses}
                  disabled={isSubmitting}
                >
                  <option value="Passport">Passport</option>
                  <option value="ID Card">ID Card</option>
                  <option value="Driver License">Driver License</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newAdditionalGuest.id_number}
                  onChange={(e) => handleAdditionalGuestChange(e, 'id_number')}
                  className={sharedClasses}
                  placeholder="ID Number"
                  disabled={isSubmitting}
                />
                <input
                  type="email"
                  value={newAdditionalGuest.email}
                  onChange={(e) => handleAdditionalGuestChange(e, 'email')}
                  className={sharedClasses}
                  placeholder="Email"
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <input
                  type="tel"
                  value={newAdditionalGuest.phone}
                  onChange={(e) => handleAdditionalGuestChange(e, 'phone')}
                  className={sharedClasses}
                  placeholder="Phone"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={handleAddAdditionalGuest}
                  className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  Add Guest
                </button>
              </div>
            </div>
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