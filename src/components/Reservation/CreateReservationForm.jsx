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
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [guests, setGuests] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
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

  const sharedClasses = 'w-full h-[42px] px-3 border rounded-md text-sm focus:outline-none focus:ring focus:border-blue-500';

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingGuests(true);
        
        // Fetch guests
        const guestsResponse = await fetch('http://localhost:5000/api/guests');
        const guestsData = await guestsResponse.json();
        setGuests(guestsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoadingGuests(false);
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
        const from = form.checkIn.toISOString().split('T')[0];
        const to = form.checkOut.toISOString().split('T')[0];
        
        const res = await fetch(
          `http://localhost:5000/api/reservations/availability/rooms?check_in=${from}&check_out=${to}`
        );
        const availabilityData = await res.json();
        
        if (!availabilityData.success) {
          throw new Error(availabilityData.message || 'Failed to check availability');
        }
        
        setAvailableRooms(availabilityData.data.rooms);
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
  }, [form.checkIn, form.checkOut]);

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

  const toggleRoomSelection = (room) => {
    setForm(prev => {
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
    setForm({
      ...form,
      guestId: guest.guest_id,
      guestName: `${guest.first_name} ${guest.last_name}`
    });
    setGuestSearch(`${guest.first_name} ${guest.last_name}`);
    setIsGuestDropdownOpen(false);
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
      selectedRooms: [],
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
    if (form.selectedRooms.length === 0) return setError('Please select at least one room');
    if (!form.checkIn || !form.checkOut) return setError('Please select both dates');
    if (form.checkOut <= form.checkIn) return setError('Check-out must be after check-in');
    if (form.adults < 1) return setError('At least one adult is required');

    setIsSubmitting(true);
    try {
      // Create payload for each selected room
      const payloads = form.selectedRooms.map(room => ({
        guest_id: form.guestId,
        room_id: room.id,
        check_in: form.checkIn.toISOString().split('T')[0],
        check_out: form.checkOut.toISOString().split('T')[0],
        adults: parseInt(form.adults),
        children: parseInt(form.children),
        special_requests: form.specialRequests,
        status: form.status
      }));

      // Send reservation for each room
      const results = await Promise.all(
        payloads.map(payload => 
          fetch('http://localhost:5000/api/reservations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }).then(res => res.json())
        )
      );

      // Check for errors
      const errors = results.filter(result => !result.success);
      if (errors.length > 0) {
        throw new Error(errors[0].message || 'Failed to create some reservations');
      }

      // Find the guest details
      const selectedGuest = guests.find(g => g.guest_id === form.guestId);
      
      // Prepare complete reservation data
      const completeReservations = results.map((result, index) => ({
        ...result.data,
        reservation_id: result.data.reservation_id,
        guest_id: form.guestId,
        guest_details: {
          name: selectedGuest ? `${selectedGuest.first_name} ${selectedGuest.last_name}` : '',
          email: selectedGuest?.email || '',
          phone: selectedGuest?.phone || ''
        },
        room: form.selectedRooms[index],
        special_requests: form.specialRequests,
        check_in: form.checkIn,
        check_out: form.checkOut,
        status: form.status,
        adults: form.adults,
        children: form.children,
        formatted_check_in: form.checkIn.toISOString().split('T')[0],
        formatted_check_out: form.checkOut.toISOString().split('T')[0],
        formatted_created_at: new Date().toISOString().split('T')[0]
      }));

      // Call onSave for each created reservation
      await Promise.all(completeReservations.map(res => onSave(res)));
      
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
            <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs">Select Rooms *</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`${sharedClasses} text-left flex justify-between items-center`}
                disabled={isSubmitting || loadingAvailability || !form.checkIn || !form.checkOut}
              >
                <span>
                  {form.selectedRooms.length > 0 ? `${form.selectedRooms.length} room(s) selected` : 
                   !form.checkIn || !form.checkOut ? 'Select dates first' :
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
                      {!form.checkIn || !form.checkOut ? 'Select dates first' : 'No available rooms for selected dates'}
                    </div>
                  ) : (
                    availableRooms.map(room => {
                      const isSelected = form.selectedRooms.some(r => r.id === room.id);
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
                                {room.type.name} - ${room.pricing.base_price} | Capacity: {room.type.capacity}
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
            {form.selectedRooms.length > 0 && (
              <div className="mt-2">
                <div className="text-xs font-medium mb-1">Selected Rooms:</div>
                <div className="flex flex-wrap gap-2">
                  {form.selectedRooms.map(room => (
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
              </div>
            )}
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