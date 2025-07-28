import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt, FaBed, FaSearch, FaArrowLeft } from "react-icons/fa";

const Explore = () => {
  const navigate = useNavigate();
  const [roomTypes, setRoomTypes] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedRoomIds, setSelectedRoomIds] = useState([]);
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date(Date.now() + 86400000));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatImagePath = (imagePath) => {
    if (!imagePath) return "https://source.unsplash.com/800x600/?hotel-room";
    
    if (imagePath.startsWith("http")) return imagePath;
    
    const normalizedPath = imagePath.replace(/\\/g, "/");
    const cleanPath = normalizedPath.replace(/^\/+/, "");
    return `http://localhost:5001/${cleanPath}`;
  };

  useEffect(() => {
    const fetchRoomTypes = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5001/api/room-types");
        const data = await response.json();
        setRoomTypes(data.data || []);
      } catch (err) {
        setError("Failed to load room types");
      } finally {
        setLoading(false);
      }
    };

    fetchRoomTypes();
  }, []);

  const checkRoomAvailability = async () => {
    if (!selectedType || !checkInDate || !checkOutDate) return;

    setLoading(true);
    setError(null);
    setSelectedRoomIds([]);

    try {
      const from = checkInDate.toISOString().split("T")[0];
      const to = checkOutDate.toISOString().split("T")[0];
      
      const response = await fetch(
        `http://localhost:5001/api/rooms/availability/check?from=${from}&to=${to}&type=${selectedType.id}`
      );
      const data = await response.json();

      if (data.status === "success") {
        setAvailableRooms(data.data || []);
      } else {
        setError(data.message || "No rooms available");
        setAvailableRooms([]);
      }
    } catch (err) {
      setError("Failed to check availability");
      setAvailableRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (selectedRoomIds.length === 0) return;

    try {
      const bookingData = {
        guest_id: 1, // Replace with actual user ID from auth
        room_ids: selectedRoomIds,
        check_in_date: checkInDate.toISOString().split("T")[0],
        check_out_date: checkOutDate.toISOString().split("T")[0],
      };

      const response = await fetch("http://localhost:5001/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (data.status === "success") {
        alert(`Booking successful! Reservation ID: ${data.data.id}`);
        setSelectedRoomIds([]);
        // navigate(`/booking-confirmation/${data.data.id}`);
      } else {
        throw new Error(data.message || "Booking failed");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Explore Rooms</h1>
        <button
          onClick={() => navigate("/")}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft className="mr-2" />
          Back to Home
        </button>
      </div>

      {/* Room Type Selection */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-6 text-gray-700">Select Room Type</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {roomTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => {
                setSelectedType(type);
                setAvailableRooms([]);
              }}
              className={`cursor-pointer rounded-xl overflow-hidden shadow-md transition-all duration-200 border-2 ${
                selectedType?.id === type.id
                  ? "border-blue-500 scale-[1.02]"
                  : "border-transparent hover:border-blue-300"
              }`}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={formatImagePath(type.image)}
                  alt={type.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  onError={(e) => {
                    e.target.src = "https://source.unsplash.com/800x600/?hotel-room";
                  }}
                />
              </div>
              <div className="p-4 bg-white">
                <h3 className="font-bold text-lg mb-1">{type.name}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{type.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 font-medium">
                    ${parseFloat(type.price).toFixed(2)}/night
                  </span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {type.capacity} {type.capacity > 1 ? "guests" : "guest"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedType && (
        <section className="bg-white rounded-xl shadow-sm p-6 mb-12 border border-gray-200">
          {/* Room Type Header */}
          <div className="flex items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              {selectedType.name} Rooms
            </h2>
            {availableRooms.length > 0 && (
              <span className="ml-auto bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                {availableRooms.length} available
              </span>
            )}
          </div>

          {/* Date Selection */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-In Date
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                <DatePicker
                  selected={checkInDate}
                  onChange={(date) => setCheckInDate(date)}
                  minDate={new Date()}
                  selectsStart
                  startDate={checkInDate}
                  endDate={checkOutDate}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-Out Date
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                <DatePicker
                  selected={checkOutDate}
                  onChange={(date) => setCheckOutDate(date)}
                  minDate={checkInDate}
                  selectsEnd
                  startDate={checkInDate}
                  endDate={checkOutDate}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={checkRoomAvailability}
                disabled={!checkInDate || !checkOutDate}
                className={`px-6 py-2 rounded-md flex items-center gap-2 ${
                  !checkInDate || !checkOutDate
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                <FaSearch />
                Check Availability
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-3 text-gray-600">Searching for available rooms...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={checkRoomAvailability}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Try again
              </button>
            </div>
          )}

          {/* Available Rooms */}
          {availableRooms.length > 0 && !loading && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableRooms.map((room) => (
                  <div
                    key={room.id}
                    className={`border rounded-lg overflow-hidden transition-all ${
                      selectedRoomIds.includes(room.id)
                        ? "ring-2 ring-blue-500 border-blue-500"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={formatImagePath(room.image || room.room_type?.image)}
                        alt={room.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://source.unsplash.com/800x600/?hotel-room";
                        }}
                      />
                      <input
                        type="checkbox"
                        checked={selectedRoomIds.includes(room.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRoomIds([...selectedRoomIds, room.id]);
                          } else {
                            setSelectedRoomIds(
                              selectedRoomIds.filter((id) => id !== room.id)
                            );
                          }
                        }}
                        className="absolute top-3 left-3 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span
                        className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full ${
                          room.status === "available"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {room.status}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1">{room.name}</h3>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-blue-600 font-medium">
                          ${parseFloat(room.room_type?.price || room.price).toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center">
                          <FaBed className="mr-1" />
                          {room.room_type?.bed || "1 bed"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {room.room_type?.description ||
                          "Comfortable accommodation with all necessary amenities"}
                      </p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Size: {room.room_type?.size || "Medium"}</span>
                        <span>
                          Capacity: {room.room_type?.capacity || room.capacity || 2}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Booking Button */}
              {selectedRoomIds.length > 0 && (
                <div className="mt-8 text-center">
                  <button
                    onClick={handleBooking}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow-md font-medium transition-colors"
                  >
                    Book {selectedRoomIds.length} Room{selectedRoomIds.length > 1 ? "s" : ""}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
};

export default Explore;