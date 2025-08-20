import { useEffect, useState } from "react";
import { 
  FaCheck, 
  FaSignOutAlt, 
  FaBed, 
  FaClipboardList, 
  FaMoneyBillWave,
  FaCalendarAlt
} from "react-icons/fa";
import axios from "axios";

const Overview = () => {
  const [dateRange, setDateRange] = useState({
    from: new Date().toISOString().split('T')[0],
    to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [stats, setStats] = useState({
    checkIn: 0,
    checkOut: 0,
    available: 0,
    reserved: 0,
    revenue: 0,
    totalRooms: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (dateRange.from && dateRange.to) {
        setLoading(true);
        try {
          // Fetch available rooms for the date range
          const availabilityResponse = await axios.get(
            `http://localhost:5000/api/reservations/availability/rooms`,
            {
              params: {
                check_in: dateRange.from,
                check_out: dateRange.to
              }
            }
          );
          
          // Fetch reservation stats for the date range
          const reservationsResponse = await axios.get(
            `http://localhost:5000/api/reservations`,
            {
              params: {
                from: dateRange.from,
                to: dateRange.to
              }
            }
          );
          
          const availabilityData = availabilityResponse.data;
          const reservationsData = reservationsResponse.data;
          
          if (availabilityData.success && reservationsData.success) {
            const reservations = reservationsData.data.reservations;
            
            // Calculate stats from reservations
            const checkIns = reservations.filter(r => 
              r.status === 'confirmed' && r.check_in === dateRange.from
            ).length;
            
            const checkOuts = reservations.filter(r => 
              r.status === 'confirmed' && r.check_out === dateRange.to
            ).length;
            
            const reserved = reservations.filter(r => 
              r.status === 'confirmed' && 
              new Date(r.check_in) <= new Date(dateRange.to) && 
              new Date(r.check_out) >= new Date(dateRange.from)
            ).length;
            
            const revenue = reservations
              .filter(r => r.status === 'confirmed')
              .reduce((sum, r) => sum + parseFloat(r.total_amount || 0), 0);

            setStats({
              checkIn: checkIns,
              checkOut: checkOuts,
              available: availabilityData.data.meta.total_available,
              totalRooms: availabilityData.data.rooms.length + availabilityData.data.meta.total_available,
              reserved: reserved,
              revenue: revenue,
            });
          }
        } catch (err) {
          console.error("Failed to fetch data:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [dateRange]);

  const overviewData = [
    {
      title: "Check-ins",
      value: stats.checkIn,
      color: "bg-green-50 border-l-4 border-green-500",
      textColor: "text-green-700",
      icon: <FaCheck className="text-xl text-green-500" />,
    },
    {
      title: "Check-outs",
      value: stats.checkOut,
      color: "bg-red-50 border-l-4 border-red-500",
      textColor: "text-red-700",
      icon: <FaSignOutAlt className="text-xl text-red-500" />,
    },
    {
      title: "Available Rooms",
      value: `${stats.available}/${stats.totalRooms}`,
      color: "bg-blue-50 border-l-4 border-blue-500",
      textColor: "text-blue-700",
      icon: <FaBed className="text-xl text-blue-500" />,
    },
    {
      title: "Reserved Rooms",
      value: stats.reserved,
      color: "bg-amber-50 border-l-4 border-amber-500",
      textColor: "text-amber-700",
      icon: <FaClipboardList className="text-xl text-amber-500" />,
    },
    {
      title: "Total Revenue",
      value: `$${stats.revenue.toLocaleString()}`,
      color: "bg-purple-50 border-l-4 border-purple-500",
      textColor: "text-purple-700",
      icon: <FaMoneyBillWave className="text-xl text-purple-500" />,
    },
  ];

  return (
    <div className="w-full px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Overview</h2>
          <p className="text-gray-500 text-sm mt-1">
            Key metrics for your property
          </p>
        </div>
        
        {/* Date Range Selector */}
        <div className="flex items-center mt-4 md:mt-0">
          <div className="flex items-center bg-white rounded-lg border border-gray-200 p-2 shadow-sm">
            <FaCalendarAlt className="text-gray-400 mr-2" />
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({...prev, from: e.target.value}))}
              className="bg-transparent outline-none text-sm w-32"
            />
          </div>
          <span className="mx-3 text-gray-500">to</span>
          <div className="flex items-center bg-white rounded-lg border border-gray-200 p-2 shadow-sm">
            <FaCalendarAlt className="text-gray-400 mr-2" />
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({...prev, to: e.target.value}))}
              className="bg-transparent outline-none text-sm w-32"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {overviewData.map((item, index) => (
          <div
            key={index}
            className={`p-5 rounded-lg ${item.color} transition-all hover:shadow-md`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className={`text-2xl font-bold ${item.textColor}`}>
                  {loading ? "-" : item.value}
                </h3>
                <p className="text-gray-600 text-sm mt-1">{item.title}</p>
              </div>
              <div className={`p-2 rounded-full bg-white shadow-sm`}>
                {item.icon}
              </div>
            </div>
            
            {/* Progress indicator for available rooms */}
            {item.title === "Available Rooms" && !loading && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(stats.available / stats.totalRooms) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round((stats.available / stats.totalRooms) * 100)}% occupancy
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Overview;