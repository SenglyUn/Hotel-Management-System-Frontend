import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BookingPage = () => {
  const navigate = useNavigate();
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [guestName, setGuestName] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/room-types");
        const data = await response.json();
        setRoomTypes(data.data);
      } catch (error) {
        console.error("Failed to fetch room types:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomTypes();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedRoom || !guestName || !checkIn || !checkOut) {
      alert("Please fill in all fields.");
      return;
    }

    // You can add real booking API logic here
    alert(`Booking confirmed for ${guestName} in ${selectedRoom.name}`);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16 px-4">
      <div className="max-w-3xl mx-auto bg-white p-10 rounded-2xl shadow-xl">
        <h1 className="text-4xl font-bold text-center text-blue-800 mb-10">
          Room Booking
        </h1>

        {loading ? (
          <p className="text-center text-gray-600">Loading room types...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Room Selection */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Choose Room Type
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedRoom?.id || ""}
                onChange={(e) => {
                  const room = roomTypes.find(
                    (r) => r.id === parseInt(e.target.value)
                  );
                  setSelectedRoom(room);
                }}
              >
                <option value="">-- Select Room --</option>
                {roomTypes.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name} – ${room.price}/night
                  </option>
                ))}
              </select>
            </div>

            {/* Guest Name */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Guest Name
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
            </div>

            {/* Check-in and Check-out */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Check-in Date
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Check-out Date
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-xl text-lg font-semibold hover:bg-blue-700 transition"
            >
              Confirm Booking
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
