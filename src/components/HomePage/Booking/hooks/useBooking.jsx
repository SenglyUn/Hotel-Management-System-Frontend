// src/components/HomePage/Booking/hooks/useBooking.js
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/AuthContext';

const API_BASE_URL = 'http://localhost:5000';

// Named export (keep this if you want to use import { useBooking })
export const useBooking = (location, navigate) => {
  const { user: authUser, logout } = useAuth();
  const [bookingData, setBookingData] = useState({
    room: null,
    checkIn: '',
    checkOut: '',
    adults: 1,
    children: 0,
    guestInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialRequests: ''
    },
    paymentMethod: 'credit_card',
    additionalGuests: [],
    cardDetails: {
      cardNumber: '',
      cvv: '',
      expiryDate: '',
      cardHolder: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Get room data from location state or redirect
  useEffect(() => {
    console.log('Location state:', location.state);
    
    if (location.state?.room) {
      setBookingData(prev => ({
        ...prev,
        room: location.state.room,
        checkIn: location.state.checkIn || '',
        checkOut: location.state.checkOut || '',
        adults: location.state.adults || 1,
        children: location.state.children || 0
      }));
    } else {
      toast.error('No room selected for booking');
      navigate('/landing');
    }
  }, [location, navigate]);

  // Check if user is authenticated
  useEffect(() => {
    console.log('Auth user:', authUser);
    if (!authUser) {
      toast.error('Please log in to continue booking');
      navigate('/login');
    }
  }, [authUser, navigate]);

  const calculateTotal = () => {
    if (!bookingData.room || !bookingData.checkIn || !bookingData.checkOut) {
      return { nights: 0, roomPrice: 0, subtotal: 0, tax: 0, total: 0 };
    }
    
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    const roomPrice = bookingData.room.type?.base_price || bookingData.room.base_price || 0;
    const total = roomPrice * nights;
    
    return {
      nights,
      roomPrice,
      subtotal: total,
      tax: total * 0.12,
      total: total * 1.12
    };
  };

  const updateBookingData = (newData) => {
    setBookingData(prev => ({ ...prev, ...newData }));
  };

  const addAdditionalGuest = (guest) => {
    setBookingData(prev => ({
      ...prev,
      additionalGuests: [...prev.additionalGuests, guest]
    }));
  };

  const removeAdditionalGuest = (index) => {
    setBookingData(prev => ({
      ...prev,
      additionalGuests: prev.additionalGuests.filter((_, i) => i !== index)
    }));
  };

  const getGuestIdForBooking = () => {
    const guestEmail = bookingData.guestInfo.email || authUser.email;
    const guestPhone = bookingData.guestInfo.phone;
    
    if (guestEmail === 'sengly@gmail.com' || guestPhone === '092474158') {
      return 10;
    }
    
    if (guestEmail === 'sokreaksmey@gmail.com' || guestPhone === '098765432') {
      return 12;
    }
    
    console.log('Using default guest_id for:', guestEmail);
    return 10;
  };

  const handleBooking = async () => {
    setLoading(true);
    try {
      console.log('Starting booking process...');
      console.log('Auth user:', authUser);
      console.log('Booking data:', bookingData);

      if (!authUser) {
        throw new Error('Please log in to continue booking');
      }

      const guestId = getGuestIdForBooking();
      console.log('Selected guest_id:', guestId);

      if (!bookingData.room?.id) {
        throw new Error('Room not selected. Please go back and select a room.');
      }

      if (!bookingData.checkIn || !bookingData.checkOut) {
        throw new Error('Please select both check-in and check-out dates');
      }

      // Validate guest information matches the selected guest_id
      if (guestId === 10) {
        const expectedEmail = 'sengly@gmail.com';
        const providedEmail = bookingData.guestInfo.email || authUser.email;
        if (providedEmail !== expectedEmail) {
          throw new Error('Guest information does not match our records. Please use the correct email address.');
        }
      } else if (guestId === 12) {
        const expectedEmail = 'sokreaksmey@gmail.com';
        const providedEmail = bookingData.guestInfo.email || authUser.email;
        if (providedEmail !== expectedEmail) {
          throw new Error('Guest information does not match our records. Please use the correct email address.');
        }
      }

      const payload = {
        guest_id: guestId,
        rooms: [
          {
            room_id: bookingData.room.id,
            adults: parseInt(bookingData.adults),
            children: parseInt(bookingData.children),
            special_requests: bookingData.guestInfo.specialRequests || ''
          }
        ],
        check_in: new Date(bookingData.checkIn).toISOString().split('T')[0],
        check_out: new Date(bookingData.checkOut).toISOString().split('T')[0],
        additional_guests: bookingData.additionalGuests.map(guest => ({
          name: guest.name || '',
          email: guest.email || '',
          phone: guest.phone || '',
          id_type: guest.id_type || 'Passport',
          id_number: guest.id_number || ''
        })),
        payment_method: bookingData.paymentMethod
      };

      console.log('Booking payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(`${API_BASE_URL}/api/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('API response:', data);

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          toast.error('Your session has expired. Please log in again.');
          navigate('/login');
          return;
        }
        
        const errorMessage = data.message || data.error || `Failed to create reservation. Status: ${response.status}`;
        throw new Error(errorMessage);
      }

      if (data.success) {
        toast.success('Booking confirmed successfully!');
        navigate('/booking-confirmation', { 
          state: { 
            booking: data,
            room: bookingData.room,
            total: calculateTotal()
          } 
        });
      } else {
        throw new Error(data.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.message || 'Failed to complete booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const total = calculateTotal();

  return {
    bookingData,
    loading,
    step,
    total,
    updateBookingData,
    addAdditionalGuest,
    removeAdditionalGuest,
    setStep,
    handleBooking,
    calculateTotal
  };
};