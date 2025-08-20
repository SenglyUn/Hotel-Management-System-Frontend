import { useState, useEffect } from 'react';

const BookingByPlatform = () => {
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  // Mock API call - replace with actual API endpoint
  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        setLoading(true);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - replace with actual API response
        const mockData = {
          direct: { percentage: 61, bookings: 124, revenue: 18500 },
          booking_com: { percentage: 12, bookings: 24, revenue: 3600 },
          agoda: { percentage: 11, bookings: 22, revenue: 3300 },
          airbnb: { percentage: 9, bookings: 18, revenue: 2700 },
          hotels_com: { percentage: 5, bookings: 10, revenue: 1500 },
          others: { percentage: 2, bookings: 4, revenue: 600 }
        };
        
        setBookingData(mockData);
      } catch (error) {
        console.error('Error fetching booking data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [timeRange]);

  // Function to calculate SVG path for pie chart segments
  const calculateArc = (percentage, index, totalSegments) => {
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const arcLength = (percentage / 100) * circumference;
    const strokeDasharray = `${arcLength} ${circumference}`;
    
    // Offset each segment based on previous segments
    let offset = 0;
    for (let i = 0; i < index; i++) {
      const segmentPercentage = Object.values(bookingData)[i].percentage;
      offset += (segmentPercentage / 100) * circumference;
    }
    
    return {
      strokeDasharray,
      strokeDashoffset: circumference - offset
    };
  };

  // Modern, clean color palette
  const colorMap = {
    direct: '#4F46E5',      // Soft indigo
    booking_com: '#0EA5E9', // Sky blue
    agoda: '#10B981',       // Emerald green
    airbnb: '#8B5CF6',      // Light purple
    hotels_com: '#F59E0B',  // Amber
    others: '#64748B'       // Slate gray
  };

  // Light background colors for each platform
  const bgColorMap = {
    direct: 'bg-indigo-50',
    booking_com: 'bg-sky-50',
    agoda: 'bg-emerald-50',
    airbnb: 'bg-purple-50',
    hotels_com: 'bg-amber-50',
    others: 'bg-slate-100'
  };

  // Platform name mapping for display
  const platformNames = {
    direct: 'Direct Booking',
    booking_com: 'Booking.com',
    agoda: 'Agoda',
    airbnb: 'Airbnb',
    hotels_com: 'Hotels.com',
    others: 'Others'
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Booking by Platform</h2>
          <div className="h-8 w-32 bg-gray-100 rounded-md animate-pulse"></div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="w-40 h-40 rounded-full bg-gray-100 animate-pulse"></div>
        </div>
        <div className="mt-6 space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Booking by Platform</h2>
        <div className="flex space-x-1 bg-gray-50 p-1 rounded-lg border border-gray-200">
          {['week', 'month', 'quarter'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeRange === range
                  ? 'bg-white text-indigo-600 shadow-xs border border-gray-200 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center">
        {/* Pie Chart Visualization */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {Object.entries(bookingData).map(([platform, data], index) => (
              <circle
                key={platform}
                cx="50%"
                cy="50%"
                r="80"
                fill="transparent"
                stroke={colorMap[platform]}
                strokeWidth="40"
                {...calculateArc(data.percentage, index, Object.keys(bookingData).length)}
                className="transition-all duration-500 ease-in-out"
              />
            ))}
          </svg>
          <div className="absolute text-center">
            <p className="text-2xl font-bold text-gray-800">
              {Object.values(bookingData).reduce((total, platform) => total + platform.bookings, 0)}
            </p>
            <p className="text-sm text-gray-500">Total Bookings</p>
          </div>
        </div>

        {/* Platform Breakdown */}
        <div className="flex-1 mt-6 md:mt-0 md:ml-6">
          <div className="grid grid-cols-1 gap-3">
            {Object.entries(bookingData).map(([platform, data]) => (
              <div
                key={platform}
                className={`flex items-center justify-between p-3 rounded-xl transition-all ${bgColorMap[platform]} border border-transparent hover:border-${platform === 'direct' ? 'indigo' : platform === 'booking_com' ? 'sky' : platform === 'agoda' ? 'emerald' : platform === 'airbnb' ? 'purple' : platform === 'hotels_com' ? 'amber' : 'slate'}-200`}
              >
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: colorMap[platform] }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">
                    {platformNames[platform]}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{data.percentage}%</p>
                  <p className="text-xs text-gray-500">
                    {data.bookings} bookings
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <p className="text-2xl font-bold text-indigo-600">
              {Math.max(...Object.values(bookingData).map(p => p.percentage))}%
            </p>
            <p className="text-xs text-indigo-800 mt-1">Top Platform Share</p>
          </div>
          <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <p className="text-2xl font-bold text-emerald-600">
              ${Object.values(bookingData).reduce((total, platform) => total + platform.revenue, 0).toLocaleString()}
            </p>
            <p className="text-xs text-emerald-800 mt-1">Total Revenue</p>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-2xl font-bold text-amber-600">
              {Object.values(bookingData).reduce((total, platform) => total + platform.bookings, 0)}
            </p>
            <p className="text-xs text-amber-800 mt-1">Total Bookings</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingByPlatform;