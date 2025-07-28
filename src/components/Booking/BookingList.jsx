import { useState, useEffect } from 'react';
import axios from 'axios';

const BookingSystem = () => {
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [bookingForm, setBookingForm] = useState({
    guestName: '',
    checkInDate: '',
    checkOutDate: '',
    specialRequests: ''
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('book');

  // Load existing reservations
  useEffect(() => {
    if (activeTab === 'view') {
      setLoading(true);
      axios.get('http://localhost:5001/api/reservations')
        .then((res) => {
          setBookings(res.data.data || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching bookings:', err);
          setError('Failed to fetch bookings. Please try again.');
          setLoading(false);
        });
    }
  }, [activeTab]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleRoomSelection = (roomId) => {
    setSelectedRooms((prev) =>
      prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId]
    );
  };

  const handleSearchAvailableRooms = () => {
    const { checkInDate, checkOutDate } = bookingForm;
    
    if (!checkInDate || !checkOutDate) {
      setError('Please select both check-in and check-out dates first');
      return;
    }

    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      setError('Check-out date must be after check-in date');
      return;
    }

    setLoading(true);
    setSelectedRooms([]);
    
    axios.get(`http://localhost:5001/api/rooms/available?from=${checkInDate}&to=${checkOutDate}`)
      .then((res) => {
        setAvailableRooms(res.data.data?.availableRooms || []);
        setError(null);
      })
      .catch((err) => {
        console.error('Error fetching available rooms:', err);
        setError('Failed to fetch available rooms. Please try again.');
        setAvailableRooms([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSubmitReservation = async () => {
    const { guestName, checkInDate, checkOutDate, specialRequests } = bookingForm;
    
    setError(null);

    if (!guestName) {
      setError('Please enter guest name');
      return;
    }
    if (!checkInDate || !checkOutDate) {
      setError('Please select both check-in and check-out dates');
      return;
    }
    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      setError('Check-out date must be after check-in date');
      return;
    }
    if (selectedRooms.length === 0) {
      setError('Please select at least one room');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        'http://localhost:5001/api/reservations',
        {
          guest_name: guestName,
          check_in_date: checkInDate,
          check_out_date: checkOutDate,
          special_requests: specialRequests,
          room_ids: selectedRooms
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.success) {
        alert('Reservation created successfully!');
        setSelectedRooms([]);
        setAvailableRooms([]);
        setBookingForm({
          guestName: '',
          checkInDate: '',
          checkOutDate: '',
          specialRequests: ''
        });
        setActiveTab('view');
      } else {
        setError(response.data?.message || 'Failed to create reservation: Unknown error');
      }
    } catch (err) {
      console.error('Reservation error:', err);
      let errorMessage = 'Failed to create reservation';
      
      if (err.response) {
        errorMessage = err.response.data?.message || 
                       err.response.data?.error || 
                       `Server error: ${err.response.status}`;
      } else if (err.request) {
        errorMessage = 'No response from server. Please try again.';
      } else {
        errorMessage = err.message || 'Request setup error';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    if (activeTab === 'book') {
      return (
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <h2 className="text-xl font-bold">New Reservation</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name *</label>
              <input
                type="text"
                name="guestName"
                value={bookingForm.guestName}
                onChange={handleFormChange}
                className="w-full p-2 border rounded"
                required
                placeholder="Enter guest name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date *</label>
              <input
                type="date"
                name="checkInDate"
                value={bookingForm.checkInDate}
                onChange={handleFormChange}
                className="w-full p-2 border rounded"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date *</label>
              <input
                type="date"
                name="checkOutDate"
                value={bookingForm.checkOutDate}
                onChange={handleFormChange}
                className="w-full p-2 border rounded"
                min={bookingForm.checkInDate || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
              <input
                type="text"
                name="specialRequests"
                value={bookingForm.specialRequests}
                onChange={handleFormChange}
                className="w-full p-2 border rounded"
                placeholder="Any special requirements"
              />
            </div>
          </div>

          <button
            onClick={handleSearchAvailableRooms}
            disabled={!bookingForm.checkInDate || !bookingForm.checkOutDate || loading}
            className={`px-4 py-2 mt-2 text-white rounded ${
              !bookingForm.checkInDate || !bookingForm.checkOutDate || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {loading ? 'Searching...' : 'Search Available Rooms'}
          </button>

          {availableRooms.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Available Rooms</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {availableRooms.map((room) => (
                  <div
                    key={room.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedRooms.includes(room.id)
                        ? 'border-2 border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => toggleRoomSelection(room.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{room.name}</h4>
                        <p className="text-sm text-gray-600">{room.type}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedRooms.includes(room.id)}
                        readOnly
                        className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="mt-2 text-sm">
                      <p>Price: ${room.price}/night</p>
                      <p>Capacity: {room.capacity} person(s)</p>
                      {room.amenities && (
                        <p className="text-xs text-gray-500 mt-1">
                          Amenities: {room.amenities.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedRooms.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium">Selected Rooms: {selectedRooms.length}</p>
                  <ul className="mt-1 list-disc list-inside">
                    {availableRooms
                      .filter(room => selectedRooms.includes(room.id))
                      .map(room => (
                        <li key={room.id} className="text-sm">
                          {room.name} (${room.price}/night)
                        </li>
                      ))}
                  </ul>
                  <p className="mt-2 font-medium">
                    Total: ${availableRooms
                      .filter(room => selectedRooms.includes(room.id))
                      .reduce((sum, room) => sum + room.price, 0)}
                  </p>
                </div>
              )}
            </div>
          )}

          {availableRooms.length === 0 && bookingForm.checkInDate && bookingForm.checkOutDate && !loading && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p>No rooms available for selected dates</p>
            </div>
          )}

          <button
            onClick={handleSubmitReservation}
            disabled={selectedRooms.length === 0 || loading}
            className={`mt-6 px-6 py-3 rounded-md text-white font-medium w-full ${
              selectedRooms.length === 0 || loading
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
              `Create Reservation (${selectedRooms.length} ${selectedRooms.length === 1 ? 'room' : 'rooms'} selected)`
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rooms</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {booking.guest_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {(booking.room_names || []).join(', ')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(booking.check_in_date).toLocaleDateString()} -{' '}
                      {new Date(booking.check_out_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        booking.payment_status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.payment_status || 'pending'}
                      </span>
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