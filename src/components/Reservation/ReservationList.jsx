import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReservationFilters from './ReservationFilters';
import ReservationTable from './ReservationTable';
import ReservationDetail from './ReservationDetail';
import ReservationInvoice from './ReservationInvoice';
import CreateReservationForm from './CreateReservationForm';
import { statusOptions } from './constants';
import { formatDate, calculateNights } from './utils';

// Centralized API endpoints
const API_ENDPOINTS = {
  RESERVATIONS: 'http://localhost:5001/api/reservations',
  GUESTS: 'http://localhost:5001/api/guests',
  ROOMS: 'http://localhost:5001/api/rooms'
};

// Max retry attempts for failed fetches
const MAX_RETRIES = 3;

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
  const [retryCount, setRetryCount] = useState(0);

  // Normalize API data
  const normalizeData = (data) => {
    if (!data || !data.success) return [];
    return Array.isArray(data.data) ? data.data : [data.data];
  };

  // Process reservation data with room and guest details
  const processReservations = useCallback((reservationsData, guestsData, roomsData) => {
    const guestMap = guestsData.reduce((map, guest) => {
      map[guest.id] = guest;
      return map;
    }, {});

    const roomMap = roomsData.reduce((map, room) => {
      map[room.id] = room;
      return map;
    }, {});

    return reservationsData.map(reservation => {
      const guest = guestMap[reservation.guestId] || {};
      const nights = calculateNights(reservation.checkInDate, reservation.checkOutDate) || 1;
      
      const roomDetails = (reservation.roomIds || []).map((roomId, index) => {
        const roomInfo = roomMap[roomId] || {};
        const price = parseFloat(roomInfo.price || reservation.roomPrices?.[index] || 0);
        return {
          id: roomId,
          name: roomInfo.name || reservation.roomNames?.[index] || `Room ${roomId}`,
          type: roomInfo.type || 'Standard',
          price,
          total: price * nights
        };
      });

      const roomCharges = roomDetails.reduce((sum, room) => sum + room.total, 0);
      const tax = parseFloat(reservation.tax) || 0;
      const discount = parseFloat(reservation.discount) || 0;
      const totalAmount = roomCharges + tax - discount;

      return {
        ...reservation,
        id: reservation.id || 'N/A',
        guestId: reservation.guestId || 'N/A',
        guestDetails: {
          name: guest.name || `Guest #${reservation.guestId || 'N/A'}`,
          email: guest.email || 'N/A',
          phone: guest.phone || 'N/A',
          address: guest.address || 'N/A',
          nationalId: guest.nationalId || 'N/A'
        },
        code: `R-${(reservation.id || '').toString().padStart(6, '0')}`,
        room: roomDetails.map(r => r.name).join(', ') || 'None',
        roomDetails,
        duration: `${nights} nights`,
        checkIn: reservation.checkInDate,
        checkOut: reservation.checkOutDate,
        status: (reservation.paymentStatus || 'pending').toLowerCase(),
        totalAmount,
        tax,
        discount,
        paymentMethod: reservation.paymentMethod || 'Credit Card',
        createdAt: reservation.reservationDate || new Date().toISOString(),
        formattedCheckIn: formatDate(reservation.checkInDate),
        formattedCheckOut: formatDate(reservation.checkOutDate),
        formattedCreatedAt: formatDate(reservation.reservationDate || new Date().toISOString())
      };
    });
  }, []);

  // Fetch all data with retry logic
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [reservationsRes, guestsRes, roomsRes] = await Promise.all([
        fetch(API_ENDPOINTS.RESERVATIONS),
        fetch(API_ENDPOINTS.GUESTS),
        fetch(API_ENDPOINTS.ROOMS)
      ]);

      if (!reservationsRes.ok) throw new Error('Failed to fetch reservations');
      if (!guestsRes.ok) throw new Error('Failed to fetch guests');
      if (!roomsRes.ok) throw new Error('Failed to fetch rooms');

      const [reservationsData, guestsData, roomsData] = await Promise.all([
        reservationsRes.json(),
        guestsRes.json(),
        roomsRes.json()
      ]);

      const normalizedGuests = normalizeData(guestsData);
      const normalizedRooms = normalizeData(roomsData);
      const normalizedReservations = normalizeData(reservationsData);

      setGuests(normalizedGuests);
      setRooms(normalizedRooms);
      setReservations(processReservations(normalizedReservations, normalizedGuests, normalizedRooms));
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || 'Failed to fetch data');
      
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchAllData(), 3000);
      }
    } finally {
      setLoading(false);
    }
  }, [processReservations, retryCount]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Create new reservation
  const handleAddReservation = async (newReservation) => {
    if (!newReservation) return;
    
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.RESERVATIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guestId: newReservation.guestId,
          checkInDate: newReservation.checkIn,
          checkOutDate: newReservation.checkOut,
          roomIds: newReservation.roomIds || [],
          roomNames: newReservation.roomNames || [],
          roomPrices: newReservation.roomPrices || [],
          paymentStatus: newReservation.status || 'pending',
          paymentMethod: newReservation.paymentMethod || 'Credit Card',
          specialRequests: newReservation.request || 'None',
          tax: newReservation.tax || 0,
          discount: newReservation.discount || 0,
          reservationDate: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to create reservation');
      const result = await response.json();

      if (!result.success) throw new Error(result.message || 'Failed to create reservation');

      // Refetch data to ensure consistency
      await fetchAllData();
      
      setShowForm(false);
      setError(null);
    } catch (err) {
      console.error("Create reservation error:", err);
      setError(err.message || 'Failed to create reservation');
    } finally {
      setLoading(false);
    }
  };

  // View management
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

  // Memoized filtered reservations
  const filteredReservations = useMemo(() => {
    return reservations.filter((reservation) => {
      const searchFields = [
        reservation.guestDetails?.name, 
        reservation.code, 
        reservation.room, 
        reservation.guestDetails?.email, 
        reservation.guestDetails?.phone
      ].join(' ').toLowerCase();
      
      const matchesSearch = searchTerm 
        ? searchFields.includes(searchTerm.toLowerCase()) 
        : true;
      
      const matchesStatus = !statusFilter.value || reservation.status === statusFilter.value;
      
      const matchesDate = !dateFilter || (
        new Date(reservation.checkIn) <= dateFilter && 
        new Date(reservation.checkOut) >= dateFilter
      );
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [reservations, searchTerm, statusFilter, dateFilter]);

  // Render different views based on viewMode
  const renderView = () => {
    switch (viewMode) {
      case 'detail':
        return (
          <ReservationDetail
            selectedReservation={selectedReservation}
            handleBackToList={handleBackToList}
            handleViewInvoice={handleViewInvoice}
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
              />
            )}
            <ReservationTable
              reservations={filteredReservations}
              handleViewDetails={handleViewDetails}
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
              loading={loading}
            />
            <button
              onClick={() => setShowForm(true)}
              className="h-10 flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-md text-sm"
              disabled={loading}
            >
              <span className="text-lg">+</span> Add Booking
            </button>
          </div>
        </div>
      )}

      {loading && !showForm ? (
        <div className="text-center py-8 text-gray-500">Loading reservations...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">
          {error} {retryCount < MAX_RETRIES && '(Auto-retrying...)'}
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