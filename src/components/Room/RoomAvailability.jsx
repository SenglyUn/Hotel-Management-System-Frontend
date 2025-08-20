import { useState, useEffect } from 'react';

const RoomAvailability = () => {
  const [availabilityData, setAvailabilityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    checkIn: '2025-08-20',
    checkOut: '2025-08-21'
  });

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Format dates to YYYY-MM-DD to ensure consistency
        const checkInFormatted = new Date(dateRange.checkIn).toISOString().split('T')[0];
        const checkOutFormatted = new Date(dateRange.checkOut).toISOString().split('T')[0];
        
        const response = await fetch(
          `http://localhost:5000/api/reservations/availability/rooms?check_in=${checkInFormatted}&check_out=${checkOutFormatted}`
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch room availability: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setAvailabilityData(data.data);
        } else {
          throw new Error('API returned unsuccessful response');
        }
      } catch (err) {
        setError(err.message);
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [dateRange]);

  const calculateOccupancyPercentage = () => {
    if (!availabilityData) return 0;
    
    // This is a simplified calculation - you might need to adjust based on your actual data
    const totalRooms = 100; // Assuming 100 total rooms for calculation
    const availableRooms = availabilityData.meta.total_available;
    return ((totalRooms - availableRooms) / totalRooms) * 100;
  };

  const getOccupancyStatus = (percentage) => {
    if (percentage < 30) return { text: 'Low', color: 'bg-emerald-500', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700' };
    if (percentage < 70) return { text: 'Moderate', color: 'bg-amber-500', bgColor: 'bg-amber-50', textColor: 'text-amber-700' };
    return { text: 'High', color: 'bg-rose-500', bgColor: 'bg-rose-50', textColor: 'text-rose-700' };
  };

  const occupancyStatus = getOccupancyStatus(calculateOccupancyPercentage());

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="h-7 w-40 bg-gray-200 rounded-md animate-pulse mb-2"></div>
            <div className="h-4 w-60 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
          <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="animate-pulse">
          <div className="w-full h-3 bg-gray-200 rounded-full mb-4"></div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Room Availability</h2>
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">
          <p className="font-medium">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-rose-600 hover:text-rose-800 font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Room Availability</h2>
          <p className="text-sm text-gray-500 mt-1">Current occupancy status and room details</p>
        </div>
        <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Check-in</label>
            <input
              type="date"
              value={dateRange.checkIn}
              onChange={(e) => setDateRange({...dateRange, checkIn: e.target.value})}
              className="bg-white text-sm rounded-lg border-0 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <span className="text-gray-400 mt-5">—</span>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Check-out</label>
            <input
              type="date"
              value={dateRange.checkOut}
              onChange={(e) => setDateRange({...dateRange, checkOut: e.target.value})}
              className="bg-white text-sm rounded-lg border-0 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Occupancy Overview */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-700">Occupancy Rate</span>
          <span className={`text-sm font-semibold ${occupancyStatus.textColor} px-3 py-1 ${occupancyStatus.bgColor} rounded-full`}>
            {occupancyStatus.text} • {calculateOccupancyPercentage().toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${occupancyStatus.color} transition-all duration-700 ease-out rounded-full`} 
            style={{ width: `${calculateOccupancyPercentage()}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <p className="text-sm text-blue-700 font-medium">Available Rooms</p>
          </div>
          <p className="text-2xl font-bold text-blue-800 mt-2">{availabilityData.meta.total_available}</p>
        </div>
        
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
            <p className="text-sm text-emerald-700 font-medium">Total Guests</p>
          </div>
          <p className="text-2xl font-bold text-emerald-800 mt-2">{availabilityData.meta.total_guests}</p>
        </div>
        
        <div className="bg-violet-50 p-4 rounded-xl border border-violet-100">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-violet-500 mr-2"></div>
            <p className="text-sm text-violet-700 font-medium">Check-in</p>
          </div>
          <p className="text-lg font-semibold text-violet-800 mt-2">{availabilityData.meta.check_in}</p>
        </div>
        
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
            <p className="text-sm text-amber-700 font-medium">Check-out</p>
          </div>
          <p className="text-lg font-semibold text-amber-800 mt-2">{availabilityData.meta.check_out}</p>
        </div>
      </div>

      {/* Available Rooms */}
      {availabilityData.rooms.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Available Room Types</h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              {availabilityData.rooms.length} options
            </span>
          </div>
          <div className="space-y-3">
            {availabilityData.rooms.map(room => (
              <div key={room.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-all duration-200">
                <div>
                  <p className="font-semibold text-gray-800">{room.number}</p>
                  <p className="text-sm text-gray-600 mt-1">{room.type.name}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                      {room.type.capacity} guests
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{room.pricing.currency} {room.pricing.total}</p>
                  <p className="text-xs text-gray-500 mt-1">per night</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {availabilityData.rooms.length === 0 && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
          </div>
          <p className="text-gray-500">No rooms available for selected dates</p>
        </div>
      )}
    </div>
  );
};

export default RoomAvailability;