import React, { useState, useEffect, useRef, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CreateReservationForm = ({ onClose, onSave }) => {
  // Consolidated state
  const [state, setState] = useState({
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

  const [uiState, setUiState] = useState({
    isDropdownOpen: false,
    isGuestDropdownOpen: false,
    guestSearch: '',
    error: null,
    isSubmitting: false,
    loadingGuests: false,
    loadingAvailability: false,
    guests: [],
    availableRooms: [],
    additionalGuests: [],
    newAdditionalGuest: {
      name: '',
      email: '',
      phone: '',
      id_type: 'Passport',
      id_number: ''
    }
  });

  const guestDropdownRef = useRef(null);
  const roomDropdownRef = useRef(null);

  const sharedClasses = 'w-full h-[42px] px-3 border rounded-md text-sm focus:outline-none focus:ring focus:border-blue-500';

  // Debounce function for API calls
  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      
      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);
    
    return debouncedValue;
  };

  // Debounced dates for availability check
  const debouncedCheckIn = useDebounce(state.checkIn, 500);
  const debouncedCheckOut = useDebounce(state.checkOut, 500);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setUiState(prev => ({ ...prev, loadingGuests: true }));
        
        // Fetch guests
        const guestsResponse = await fetch('http://localhost:5000/api/guests');
        const guestsData = await guestsResponse.json();
        setUiState(prev => ({ ...prev, guests: guestsData, loadingGuests: false }));
      } catch (error) {
        console.error('Error fetching data:', error);
        setUiState(prev => ({ 
          ...prev, 
          error: 'Failed to load data. Please try again.',
          loadingGuests: false 
        }));
      }
    };

    fetchInitialData();
  }, []);

  // Check room availability when dates change (with debounce)
  useEffect(() => {
    const checkRoomAvailability = async () => {
      if (!debouncedCheckIn || !debouncedCheckOut) return;
      
      setUiState(prev => ({ ...prev, loadingAvailability: true }));
      try {
        const from = debouncedCheckIn.toISOString().split('T')[0];
        const to = debouncedCheckOut.toISOString().split('T')[0];
        
        const res = await fetch(
          `http://localhost:5000/api/reservations/availability/rooms?check_in=${from}&check_out=${to}`
        );
        const availabilityData = await res.json();
        
        if (!availabilityData.success) {
          throw new Error(availabilityData.message || 'Failed to check availability');
        }
        
        setUiState(prev => ({ 
          ...prev, 
          availableRooms: availabilityData.data.rooms,
          loadingAvailability: false 
        }));
      } catch (err) {
        console.error('Failed to check availability:', err);
        setUiState(prev => ({ 
          ...prev, 
          error: 'Failed to check room availability. Please try again.',
          availableRooms: [],
          loadingAvailability: false 
        }));
      }
    };

    checkRoomAvailability();
  }, [debouncedCheckIn, debouncedCheckOut]);

  // Handle click outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (guestDropdownRef.current && !guestDropdownRef.current.contains(event.target)) {
        setUiState(prev => ({ ...prev, isGuestDropdownOpen: false }));
      }
      if (roomDropdownRef.current && !roomDropdownRef.current.contains(event.target)) {
        setUiState(prev => ({ ...prev, isDropdownOpen: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Optimized handlers with useCallback
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setState(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleDateChange = useCallback((name, date) => {
    setState(prev => ({ ...prev, [name]: date }));
  }, []);

  const toggleRoomSelection = useCallback((room) => {
    setState(prev => {
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
  }, []);

  const selectGuest = useCallback((guest) => {
    setState(prev => ({
      ...prev,
      guestId: guest.guest_id,
      guestName: `${guest.first_name} ${guest.last_name}`
    }));
    
    setUiState(prev => ({
      ...prev,
      guestSearch: `${guest.first_name} ${guest.last_name}`,
      isGuestDropdownOpen: false
    }));
  }, []);

  const handleGuestInputChange = useCallback((e) => {
    const value = e.target.value;
    setUiState(prev => ({ 
      ...prev, 
      guestSearch: value,
      isGuestDropdownOpen: true 
    }));
    
    if (value !== state.guestName) {
      setState(prev => ({ 
        ...prev, 
        guestId: null,
        guestName: '' 
      }));
      setUiState(prev => ({ ...prev, additionalGuests: [] }));
    }
  }, [state.guestName]);

  const clearGuestSelection = useCallback(() => {
    setUiState(prev => ({ 
      ...prev, 
      guestSearch: '',
      isGuestDropdownOpen: false,
      additionalGuests: []
    }));
    
    setState(prev => ({ 
      ...prev, 
      guestId: null,
      guestName: '' 
    }));
  }, []);

  const handleAddAdditionalGuest = useCallback(() => {
    if (!uiState.newAdditionalGuest.name) {
      setUiState(prev => ({ ...prev, error: 'Please enter guest name' }));
      return;
    }
    
    setUiState(prev => ({ 
      ...prev, 
      additionalGuests: [...prev.additionalGuests, prev.newAdditionalGuest],
      newAdditionalGuest: {
        name: '',
        email: '',
        phone: '',
        id_type: 'Passport',
        id_number: ''
      },
      error: null
    }));
  }, [uiState.newAdditionalGuest]);

  const handleRemoveAdditionalGuest = useCallback((index) => {
    setUiState(prev => ({ 
      ...prev, 
      additionalGuests: prev.additionalGuests.filter((_, i) => i !== index) 
    }));
  }, []);

  const handleAdditionalGuestChange = useCallback((e, field) => {
    setUiState(prev => ({ 
      ...prev, 
      newAdditionalGuest: {
        ...prev.newAdditionalGuest,
        [field]: e.target.value
      }
    }));
  }, []);

  const resetForm = useCallback(() => {
    setState({
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
    
    setUiState(prev => ({
      ...prev,
      guestSearch: '',
      additionalGuests: [],
      newAdditionalGuest: {
        name: '',
        email: '',
        phone: '',
        id_type: 'Passport',
        id_number: ''
      },
      error: null
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUiState(prev => ({ ...prev, error: null }));
    
    // Validation
    if (!state.guestId) {
      setUiState(prev => ({ ...prev, error: 'Please select a valid guest' }));
      return;
    }
    if (state.selectedRooms.length === 0) {
      setUiState(prev => ({ ...prev, error: 'Please select at least one room' }));
      return;
    }
    if (!state.checkIn || !state.checkOut) {
      setUiState(prev => ({ ...prev, error: 'Please select both dates' }));
      return;
    }
    if (state.checkOut <= state.checkIn) {
      setUiState(prev => ({ ...prev, error: 'Check-out must be after check-in' }));
      return;
    }
    if (state.adults < 1) {
      setUiState(prev => ({ ...prev, error: 'At least one adult is required' }));
      return;
    }

    setUiState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      // Create payload for each selected room
      const payloads = state.selectedRooms.map(room => ({
        guest_id: state.guestId,
        room_id: room.id,
        check_in: state.checkIn.toISOString().split('T')[0],
        check_out: state.checkOut.toISOString().split('T')[0],
        adults: parseInt(state.adults),
        children: parseInt(state.children),
        special_requests: state.specialRequests,
        status: state.status
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
      const selectedGuest = uiState.guests.find(g => g.guest_id === state.guestId);
      
      // Prepare complete reservation data
      const completeReservations = results.map((result, index) => ({
        ...result.data,
        reservation_id: result.data.reservation_id,
        guest_id: state.guestId,
        guest_details: {
          name: selectedGuest ? `${selectedGuest.first_name} ${selectedGuest.last_name}` : '',
          email: selectedGuest?.email || '',
          phone: selectedGuest?.phone || ''
        },
        room: state.selectedRooms[index],
        special_requests: state.specialRequests,
        check_in: state.checkIn,
        check_out: state.checkOut,
        status: state.status,
        adults: state.adults,
        children: state.children,
        formatted_check_in: state.checkIn.toISOString().split('T')[0],
        formatted_check_out: state.checkOut.toISOString().split('T')[0],
        formatted_created_at: new Date().toISOString().split('T')[0]
      }));

      // Call onSave for each created reservation
      await Promise.all(completeReservations.map(res => onSave(res)));
      
      // Reset form and close
      resetForm();
      onClose();
      
    } catch (err) {
      console.error('Error creating reservation:', err);
      setUiState(prev => ({ 
        ...prev, 
        error: err.message || 'Failed to create reservation. Please try again.',
        isSubmitting: false 
      }));
    }
  };

  const filteredGuests = uiState.guests.filter(guest => {
    const fullName = `${guest.first_name} ${guest.last_name}`.toLowerCase();
    return fullName.includes(uiState.guestSearch.toLowerCase());
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
        minDate={name === 'checkOut' ? state.checkIn : new Date()}
        selectsStart={name === 'checkIn'}
        selectsEnd={name === 'checkOut'}
        startDate={state.checkIn}
        endDate={state.checkOut}
        disabled={uiState.isSubmitting}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Create Reservation</h1>
          <button 
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700 text-lg" 
            disabled={uiState.isSubmitting}
          >
            ×
          </button>
        </div>

        {uiState.error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {uiState.error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Guest Selection */}
          <div className="relative mt-6" ref={guestDropdownRef}>
            <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs">Guest Name *</label>
            <div className="relative">
              <input
                type="text"
                value={uiState.guestSearch}
                onChange={handleGuestInputChange}
                onFocus={() => setUiState(prev => ({ ...prev, isGuestDropdownOpen: true }))}
                className={sharedClasses}
                required
                placeholder="Select guest"
                disabled={uiState.isSubmitting || uiState.loadingGuests}
              />
              {uiState.guestSearch && (
                <button
                  type="button"
                  onClick={clearGuestSelection}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={uiState.isSubmitting}
                >
                  ×
                </button>
              )}
            </div>
            {!state.guestId && uiState.guestSearch && (
              <div className="text-red-500 text-xs mt-1">
                Please select a guest from the dropdown
              </div>
            )}
            {uiState.isGuestDropdownOpen && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {uiState.loadingGuests ? (
                  <div className="px-3 py-2 text-gray-500">Loading guests...</div>
                ) : filteredGuests.length === 0 ? (
                  <div className="px-3 py-2 text-gray-500">
                    {uiState.guestSearch ? 'No matching guests found' : 'Start typing to search guests'}
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
                onClick={() => setUiState(prev => ({ ...prev, isDropdownOpen: !prev.isDropdownOpen }))}
                className={`${sharedClasses} text-left flex justify-between items-center`}
                disabled={uiState.isSubmitting || uiState.loadingAvailability || !state.checkIn || !state.checkOut}
              >
                <span>
                  {state.selectedRooms.length > 0 ? `${state.selectedRooms.length} room(s) selected` : 
                   !state.checkIn || !state.checkOut ? 'Select dates first' :
                   uiState.loadingAvailability ? 'Checking availability...' : 'Select rooms'}
                </span>
                <span>▼</span>
              </button>
              {uiState.isDropdownOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {uiState.loadingAvailability ? (
                    <div className="px-3 py-2 text-gray-500">Checking room availability...</div>
                  ) : uiState.availableRooms.length === 0 ? (
                    <div className="px-3 py-2 text-gray-500">
                      {!state.checkIn || !state.checkOut ? 'Select dates first' : 'No available rooms for selected dates'}
                    </div>
                  ) : (
                    uiState.availableRooms.map(room => {
                      const isSelected = state.selectedRooms.some(r => r.id === room.id);
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
            {state.selectedRooms.length > 0 && (
              <div className="mt-2">
                <div className="text-xs font-medium mb-1">Selected Rooms:</div>
                <div className="flex flex-wrap gap-2">
                  {state.selectedRooms.map(room => (
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
          {datePickerWithTopLeftLabel('Check-In *', 'checkIn', state.checkIn)}
          {datePickerWithTopLeftLabel('Check-Out *', 'checkOut', state.checkOut)}

          {/* Guest Counts */}
          <div className="relative mt-6">
            <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs">Adults *</label>
            <input
              type="number"
              name="adults"
              value={state.adults}
              onChange={handleChange}
              className={sharedClasses}
              min="1"
              required
              disabled={uiState.isSubmitting}
            />
          </div>

          <div className="relative mt-6">
            <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs">Children</label>
            <input
              type="number"
              name="children"
              value={state.children}
              onChange={handleChange}
              className={sharedClasses}
              min="0"
              disabled={uiState.isSubmitting}
            />
          </div>

          {/* Status */}
          <div className="relative mt-6">
            <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs">Status</label>
            <select
              value={state.status}
              onChange={handleChange}
              name="status"
              className={sharedClasses}
              disabled={uiState.isSubmitting}
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
              value={state.specialRequests}
              onChange={handleChange}
              className={sharedClasses}
              placeholder="Any special requests"
              disabled={uiState.isSubmitting}
            />
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 flex justify-end mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={uiState.isSubmitting}
            >
              {uiState.isSubmitting ? 'Creating...' : 'Create Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReservationForm;