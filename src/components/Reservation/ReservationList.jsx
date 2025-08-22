import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ReservationFilters from './ReservationFilters';
import ReservationTable from './ReservationTable';
import ReservationDetail from './ReservationDetail';
import ReservationInvoice from './ReservationInvoice';
import CreateReservationForm from './CreateReservationForm';
import { statusOptions } from './constants';
import { formatDate, calculateNights } from './utils';

const API_ENDPOINTS = {
  RESERVATIONS: 'http://localhost:5000/api/reservations',
  GUESTS: 'http://localhost:5000/api/guests',
  ROOMS: 'http://localhost:5000/api/rooms'
};

const MAX_RETRIES = 3;
const DATA_FETCH_DELAY = 300; // ms delay for smoother UI

const ReservationList = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(statusOptions[0]);
  const [dateFilter, setDateFilter] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [actionLoading, setActionLoading] = useState(false);
  const [dataInitialized, setDataInitialized] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);
  const fetchTimeoutRef = useRef(null);

  // Data normalization
  const normalizeData = (data) => {
    if (!data || !data.success) return [];
    if (data.data.reservations) {
      return data.data.reservations;
    }
    return Array.isArray(data.data) ? data.data : [data.data];
  };

  // Process reservations with memoization to prevent unnecessary recalculations
  const processReservations = useCallback((reservationsData) => {
    return reservationsData.map(reservation => {
      const guest = reservation.guest || {};
      const room = reservation.room || {};
      const nights = calculateNights(reservation.check_in, reservation.check_out) || 1;
      
      const roomDetails = {
        id: room.room_id || reservation.room_id,
        number: room.room_number || `Room ${reservation.room_id}`,
        type: room.room_type?.name || 'Standard',
        price: parseFloat(room.room_type?.base_price) || 0,
        total: parseFloat(reservation.total_amount) || 0
      };

      const totalAmount = parseFloat(reservation.total_amount) || 0;
      const paidAmount = parseFloat(reservation.paid_amount) || 0;
      const balance = totalAmount - paidAmount;

      return {
        ...reservation,
        id: reservation.reservation_id,
        guestId: reservation.guest_id,
        guestDetails: {
          name: `${guest.first_name || ''} ${guest.last_name || ''}`.trim(),
          email: guest.email || 'N/A',
          phone: guest.phone || 'N/A',
          address: `${guest.address || ''}, ${guest.city || ''}, ${guest.country || ''}`.trim(),
          nationalId: guest.id_number || 'N/A'
        },
        code: `R-${reservation.reservation_id.toString().padStart(6, '0')}`,
        roomNumber: room.room_number || 'N/A',
        roomType: room.room_type?.name || 'Standard',
        roomDetails,
        duration: `${nights} nights`,
        checkIn: reservation.check_in,
        checkOut: reservation.check_out,
        status: reservation.status.toLowerCase(),
        totalAmount,
        paidAmount,
        balance,
        paymentMethod: 'Credit Card',
        createdAt: reservation.created_at,
        formattedCheckIn: formatDate(reservation.check_in),
        formattedCheckOut: formatDate(reservation.check_out),
        formattedCreatedAt: formatDate(reservation.created_at),
        adults: reservation.adults || 1,
        children: reservation.children || 0,
        specialRequests: reservation.special_requests || 'None',
        reservationGuests: reservation.reservation_guests || [],
        amenities: room.amenities?.map(a => a.name) || []
      };
    });
  }, []);

  // Create a temporary reservation for optimistic UI
  const createTempReservation = (newReservation, guests, rooms) => {
    const guest = guests.find(g => g.guest_id === newReservation.guestId) || {};
    const room = rooms.find(r => r.room_id === newReservation.roomId) || {};
    const nights = calculateNights(newReservation.checkIn, newReservation.checkOut) || 1;
    
    // Generate a temporary ID that won't conflict with real IDs
    const tempId = `temp-${Date.now()}`;
    
    return {
      id: tempId,
      reservation_id: tempId,
      guest_id: newReservation.guestId,
      guestDetails: {
        name: `${guest.first_name || ''} ${guest.last_name || ''}`.trim(),
        email: guest.email || 'N/A',
        phone: guest.phone || 'N/A',
        address: `${guest.address || ''}, ${guest.city || ''}, ${guest.country || ''}`.trim(),
        nationalId: guest.id_number || 'N/A'
      },
      code: `R-TEMP`,
      room_id: newReservation.roomId,
      roomNumber: room.room_number || 'TEMP',
      roomType: room.room_type?.name || 'Standard',
      duration: `${nights} nights`,
      checkIn: newReservation.checkIn,
      checkOut: newReservation.checkOut,
      status: (newReservation.status || 'confirmed').toLowerCase(),
      totalAmount: parseFloat(room.room_type?.base_price) * nights || 0,
      paidAmount: 0,
      balance: parseFloat(room.room_type?.base_price) * nights || 0,
      paymentMethod: 'Credit Card',
      createdAt: new Date().toISOString(),
      formattedCheckIn: formatDate(newReservation.checkIn),
      formattedCheckOut: formatDate(newReservation.checkOut),
      formattedCreatedAt: formatDate(new Date()),
      adults: newReservation.adults || 1,
      children: newReservation.children || 0,
      specialRequests: newReservation.specialRequests || 'None',
      reservationGuests: newReservation.additionalGuests || [],
      amenities: room.amenities?.map(a => a.name) || [],
      isTemp: true // Flag to identify temporary reservations
    };
  };

  // Fetch data with error handling
  const fetchData = useCallback(async (endpoint) => {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
      return response.json();
    } catch (err) {
      console.error(`Error fetching from ${endpoint}:`, err);
      throw err;
    }
  }, []);

  // Fetch all data with staggered loading for better UX
  const fetchAllData = useCallback(async () => {
    if (!isMountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch reservations first (most important)
      const reservationsData = await fetchData(API_ENDPOINTS.RESERVATIONS);
      const normalizedReservations = normalizeData(reservationsData);
      
      if (isMountedRef.current) {
        setReservations(processReservations(normalizedReservations));
        
        // Fetch guests and rooms after a short delay for smoother UI
        setTimeout(async () => {
          if (!isMountedRef.current) return;
          
          try {
            const [guestsData, roomsData] = await Promise.all([
              fetchData(API_ENDPOINTS.GUESTS),
              fetchData(API_ENDPOINTS.ROOMS)
            ]);
            
            if (isMountedRef.current) {
              setGuests(guestsData.data || guestsData);
              setRooms(roomsData.data || roomsData);
              setDataInitialized(true);
              retryCountRef.current = 0;
            }
          } catch (err) {
            console.error("Secondary fetch error:", err);
            if (isMountedRef.current) {
              setError("Partially loaded: " + (err.message || 'Failed to load some data'));
            }
          }
        }, DATA_FETCH_DELAY);
      }
    } catch (err) {
      console.error("Primary fetch error:", err);
      if (!isMountedRef.current) return;

      setError(err.message || 'Failed to fetch data');
      
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current += 1;
        fetchTimeoutRef.current = setTimeout(fetchAllData, 3000);
      }
    } finally {
      // Only set loading to false after initial data is loaded
      // Secondary data loading happens in the background
      setTimeout(() => {
        if (isMountedRef.current && reservations.length > 0) {
          setLoading(false);
        }
      }, 100);
    }
  }, [fetchData, processReservations, reservations.length]);

  // Initial data fetch
  useEffect(() => {
    isMountedRef.current = true;
    
    // Use a small delay before initial fetch to allow UI to render
    fetchTimeoutRef.current = setTimeout(fetchAllData, 100);

    return () => {
      isMountedRef.current = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [fetchAllData]);

  // Handle adding a new reservation with optimistic UI
  const handleAddReservation = async (newReservation) => {
    if (!newReservation) return;
    
    setFormSubmitting(true);
    setError(null);
    
    // Create temporary reservation for optimistic UI
    const tempReservation = createTempReservation(newReservation, guests, rooms);
    
    // Optimistically add to the list
    setReservations(prev => [tempReservation, ...prev]);
    
    try {
      const response = await fetch(API_ENDPOINTS.RESERVATIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guest_id: newReservation.guestId,
          check_in: newReservation.checkIn,
          check_out: newReservation.checkOut,
          room_id: newReservation.roomId,
          adults: newReservation.adults || 1,
          children: newReservation.children || 0,
          status: newReservation.status || 'confirmed',
          special_requests: newReservation.specialRequests || 'None',
          additional_guests: newReservation.additionalGuests || []
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create reservation');
      }

      const result = await response.json();
      const processedReservation = processReservations([result.data])[0];
      
      // Replace the temporary reservation with the real one
      setReservations(prev => 
        prev.map(res => 
          res.id === tempReservation.id ? processedReservation : res
        )
      );
      
      // Update guests and rooms if needed
      if (result.data.guest && !guests.some(g => g.guest_id === result.data.guest.guest_id)) {
        setGuests(prev => [...prev, result.data.guest]);
      }
      
      if (result.data.room && !rooms.some(r => r.room_id === result.data.room.room_id)) {
        setRooms(prev => [...prev, result.data.room]);
      }

      setShowForm(false);
    } catch (err) {
      console.error("Create reservation error:", err);
      setError(err.message || 'Failed to create reservation');
      
      // Revert optimistic update on error
      setReservations(prev => prev.filter(res => res.id !== tempReservation.id));
    } finally {
      setFormSubmitting(false);
    }
  };

  // Status update handler
  const handleUpdateStatus = async (reservationId, newStatus) => {
    setActionLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.RESERVATIONS}/${reservationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update reservation status');
      }

      // Optimistic update for better UX
      setReservations(prev => 
        prev.map(res => 
          res.id === reservationId 
            ? { ...res, status: newStatus.toLowerCase() } 
            : res
        )
      );

      // If viewing details, update the selected reservation as well
      if (selectedReservation?.id === reservationId) {
        setSelectedReservation(prev => ({
          ...prev,
          status: newStatus.toLowerCase()
        }));
      }

      return true;
    } catch (err) {
      console.error("Update status error:", err);
      setError(err.message || 'Failed to update status');
      
      // Revert optimistic update on error
      fetchAllData();
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel reservation handler
  const handleCancelReservation = async (reservationId) => {
    setActionLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.RESERVATIONS}/${reservationId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel reservation');
      }

      // Optimistic update
      setReservations(prev => 
        prev.map(res => 
          res.id === reservationId 
            ? { ...res, status: 'cancelled' } 
            : res
        )
      );

      // If viewing details, update the selected reservation as well
      if (selectedReservation?.id === reservationId) {
        setSelectedReservation(prev => ({
          ...prev,
          status: 'cancelled'
        }));
      }

      return true;
    } catch (err) {
      console.error("Cancel reservation error:", err);
      setError(err.message || 'Failed to cancel reservation');
      
      // Revert optimistic update on error
      fetchAllData();
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // Delete reservation handler
  const handleDeleteReservation = async (reservationId) => {
    setActionLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.RESERVATIONS}/${reservationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete reservation');
      }

      // Optimistic update
      setReservations(prev => prev.filter(res => res.id !== reservationId));
      
      // If viewing details of the deleted reservation, go back to list
      if (selectedReservation?.id === reservationId) {
        setSelectedReservation(null);
        setViewMode('list');
      }

      return true;
    } catch (err) {
      console.error("Delete reservation error:", err);
      setError(err.message || 'Failed to delete reservation');
      
      // Revert optimistic update on error
      fetchAllData();
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // Navigation handlers
  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
    setViewMode('detail');
  };

  const handleViewInvoice = () => {
    setViewMode('invoice');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedReservation(null);
  };

  // Memoized filtered reservations for better performance
  const filteredReservations = useMemo(() => {
    return reservations.filter((reservation) => {
      const searchFields = [
        reservation.guestDetails?.name, 
        reservation.code, 
        reservation.roomNumber, 
        reservation.roomType,
        reservation.guestDetails?.email, 
        reservation.guestDetails?.phone
      ].join(' ').toLowerCase();
      
      const matchesSearch = searchTerm 
        ? searchFields.includes(searchTerm.toLowerCase()) 
        : true;
      
      const matchesStatus = !statusFilter.value || 
        (statusFilter.value === 'all' ? true : reservation.status === statusFilter.value);
      
      const matchesDate = !dateFilter || (
        new Date(reservation.checkIn) <= dateFilter && 
        new Date(reservation.checkOut) >= dateFilter
      );
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [reservations, searchTerm, statusFilter, dateFilter]);

  // Render appropriate view based on viewMode
  const renderView = () => {
    switch (viewMode) {
      case 'detail':
        return (
          <ReservationDetail
            selectedReservation={selectedReservation}
            handleBackToList={handleBackToList}
            handleViewInvoice={handleViewInvoice}
            onUpdateStatus={handleUpdateStatus}
            onCancelReservation={handleCancelReservation}
            onDeleteReservation={handleDeleteReservation}
            actionLoading={actionLoading}
          />
        );
      case 'invoice':
        return (
          <ReservationInvoice
            selectedReservation={selectedReservation}
            handleBackToList={handleBackToList}
          />
        );
      default:
        return (
          <>
            {showForm && (
              <CreateReservationForm
                onClose={() => setShowForm(false)}
                onSave={handleAddReservation}
                guests={guests}
                rooms={rooms}
                submitting={formSubmitting}
              />
            )}
            <ReservationTable
              reservations={filteredReservations}
              handleViewDetails={handleViewDetails}
              onUpdateStatus={handleUpdateStatus}
              onCancelReservation={handleCancelReservation}
              onDeleteReservation={handleDeleteReservation}
              actionLoading={actionLoading}
            />
          </>
        );
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-[13px] text-gray-800">
      {viewMode === 'list' && (
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Reservation List</h1>
          <div className="flex items-center gap-3">
            <ReservationFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              loading={loading || actionLoading || formSubmitting}
            />
            <button
              onClick={() => setShowForm(true)}
              className="h-10 flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-md text-sm"
              disabled={loading || actionLoading || formSubmitting}
            >
              <span className="text-lg">+</span> Add Booking
            </button>
          </div>
        </div>
      )}

      {loading && !dataInitialized ? (
        <div className="text-center py-8 text-gray-500">Loading reservations...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">
          {error} {retryCountRef.current < MAX_RETRIES && '(Auto-retrying...)'}
        </div>
      ) : viewMode === 'list' && filteredReservations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No reservations found
          {(searchTerm || statusFilter.value !== 'all' || dateFilter) && (
            <span> matching your filters</span>
          )}
        </div>
      ) : (
        renderView()
      )}
    </div>
  );
};

export default ReservationList;