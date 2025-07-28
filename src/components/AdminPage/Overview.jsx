import { useEffect, useState } from "react";
import { FaCheck, FaSignOutAlt, FaBed, FaClipboardList, FaMoneyBillWave } from "react-icons/fa";
import { FiCalendar } from "react-icons/fi";
import axios from "axios";

const Overview = () => {
  const [dateRange, setDateRange] = useState({
    from: "",
    to: ""
  });
  const [stats, setStats] = useState({
    checkIn: 0,
    checkOut: 0,
    available: 0,
    reserved: 0,
    revenue: 0,
    totalRooms: 0,
  });

  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      // Fetch available rooms for the date range
      axios
        .get(`http://localhost:5001/api/rooms/availability/check`, {
          params: {
            from: dateRange.from,
            to: dateRange.to
          }
        })
        .then((res) => {
          const availableRooms = res.data.data.filter(room => room.availability === "available");
          setStats((prev) => ({
            ...prev,
            available: availableRooms.length,
            totalRooms: res.data.data.length, // Total rooms is the length of all rooms returned
          }));
        })
        .catch((err) => {
          console.error("Failed to fetch available rooms:", err);
        });

      // Fetch reservation stats for the date range
      axios
        .get(`http://localhost:5001/api/reservations`, {
          params: {
            from: dateRange.from,
            to: dateRange.to
          }
        })
        .then((res) => {
          const statsFromServer = res.data.stats || {};
          setStats((prev) => ({
            ...prev,
            checkIn: statsFromServer.checkIn || 0,
            checkOut: statsFromServer.checkOut || 0,
            reserved: statsFromServer.reserved || 0,
            revenue: statsFromServer.revenue || 0,
          }));
        })
        .catch((err) => {
          console.error("Failed to fetch reservation stats:", err);
        });
    }
  }, [dateRange]);

  const overviewData = [
    {
      title: "Check-ins",
      value: stats.checkIn,
      color: "bg-green-100",
      textColor: "text-green-800",
      icon: <FaCheck className="text-2xl" />,
    },
    {
      title: "Check-outs",
      value: stats.checkOut,
      color: "bg-red-100",
      textColor: "text-red-800",
      icon: <FaSignOutAlt className="text-2xl" />,
    },
    {
      title: "Rooms Available",
      value: `${stats.available}/${stats.totalRooms}`,
      color: "bg-blue-100",
      textColor: "text-blue-800",
      icon: <FaBed className="text-2xl" />,
    },
    {
      title: "Rooms Reserved",
      value: stats.reserved,
      color: "bg-yellow-100",
      textColor: "text-yellow-800",
      icon: <FaClipboardList className="text-2xl" />,
    },
    {
      title: "Total Revenue",
      value: `$${stats.revenue.toLocaleString()}`,
      color: "bg-purple-100",
      textColor: "text-purple-800",
      icon: <FaMoneyBillWave className="text-2xl" />,
    },
  ];

  return (
    <div className="relative px-8 py-6">
      <div className="flex justify-between items-center mb-8 max-w-screen-xl mx-auto">
        <h2 className="text-2xl font-semibold text-blue-600">Overview</h2>
        <div className="flex space-x-2">
          <label className="flex items-center border border-gray-300 rounded-md px-4 py-2 bg-white text-gray-500 shadow-sm cursor-pointer hover:shadow-md transition">
            <FiCalendar className="mr-2 text-lg" />
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({...prev, from: e.target.value}))}
              className="bg-transparent outline-none text-sm w-full"
            />
          </label>
          <span className="flex items-center">to</span>
          <label className="flex items-center border border-gray-300 rounded-md px-4 py-2 bg-white text-gray-500 shadow-sm cursor-pointer hover:shadow-md transition">
            <FiCalendar className="mr-2 text-lg" />
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({...prev, to: e.target.value}))}
              className="bg-transparent outline-none text-sm w-full"
            />
          </label>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-5 gap-6 w-full">
          {overviewData.map((item, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl shadow-md flex items-center justify-between ${item.color} hover:shadow-lg transition min-w-0`}
            >
              <div className="min-w-0">
                <h3 className={`text-xl font-bold ${item.textColor}`}>{item.value}</h3>
                <p className="text-gray-600 truncate">{item.title}</p>
              </div>
              <div className={`text-2xl ${item.textColor} ml-4`}>{item.icon}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview;