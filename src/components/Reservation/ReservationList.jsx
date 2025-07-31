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

const ReservationList = () => {
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
  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);

  const normalizeData = (data) => {
    if (!data || !data.success) return [];
    if (data.data.reservations) {
      return data.data.reservations;
    }
    return Array.isArray(data.data) ? data.data : [data.data];
  };

  const processReservations = useCallback((reservationsData) => {
    return reservationsData.map(reservation => {
      const guest = reservation.guest || {};
      const room = reservation.room || {};
      const nights = calculateNights(reservation.check_in, reservation.check_out) || 1;
      
      const roomDetails = [{
        id: room.room_id || reservation.room_id,
        name: room.room_number || `Room ${reservation.room_id}`,
        type: room.type_id || 'Standard',
        price: 0,
        total: 0
      }];

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
        roomNumber: room.room_number || 'N/A', // This will be used for the Room column
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
        reservationGuests: reservation.reservation_guests || []
      };
    });
  }, []);

  const fetchData = useCallback(async (endpoint) => {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
    return response.json();
  }, []);

  const fetchAllData = useCallback(async () => {
    if (!isMountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const reservationsData = await fetchData(API_ENDPOINTS.RESERVATIONS);
      const normalizedReservations = normalizeData(reservationsData);

      // Extract unique guests and rooms from reservations
      const uniqueGuests = [];
      const uniqueRooms = [];
      const guestIds = new Set();
      const roomIds = new Set();

      normalizedReservations.forEach(reservation => {
        if (reservation.guest && !guestIds.has(reservation.guest.guest_id)) {
          guestIds.add(reservation.guest.guest_id);
          uniqueGuests.push(reservation.guest);
        }
        if (reservation.room && !roomIds.has(reservation.room.room_id)) {
          roomIds.add(reservation.room.room_id);
          uniqueRooms.push(reservation.room);
        }
      });

      if (isMountedRef.current) {
        setGuests(uniqueGuests);
        setRooms(uniqueRooms);
        setReservations(processReservations(normalizedReservations));
        retryCountRef.current = 0;
      }
    } catch (err) {
      console.error("Fetch error:", err);
      if (!isMountedRef.current) return;

      setError(err.message || 'Failed to fetch data');
      
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current += 1;
        setTimeout(fetchAllData, 3000);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchData, processReservations]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchAllData();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchAllData]);

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
          guest_id: newReservation.guestId,
          check_in: newReservation.checkIn,
          check_out: newReservation.checkOut,
          room_id: newReservation.roomIds?.[0] || null,
          adults: newReservation.adults || 1,
          children: newReservation.children || 0,
          status: newReservation.status || 'confirmed',
          special_requests: newReservation.specialRequests || 'None'
        })
      });

      if (!response.ok) throw new Error('Failed to create reservation');
      
      await fetchAllData();
      setShowForm(false);
    } catch (err) {
      console.error("Create reservation error:", err);
      setError(err.message || 'Failed to create reservation');
    } finally {
      setLoading(false);
    }
  };

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

  const filteredReservations = useMemo(() => {
    return reservations.filter((reservation) => {
      const searchFields = [
        reservation.guestDetails?.name, 
        reservation.code, 
        reservation.roomNumber, 
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