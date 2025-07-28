import React, { useState } from "react";

// Reservation Management Page for Check-in/Check-out
const CheckInCheckOutPage = () => {
  const [reservations, setReservations] = useState([
    {
      reservation_id: 1,
      guest_name: "David Smith",
      guest_id: 101,
      room_id: 201,
      room_type: "Single Bed",
      check_in_date: "2025-03-20",
      check_out_date: "2025-03-22",
      reservation_date: "2025-03-15",
      status: "Confirmed",
    },
    {
      reservation_id: 2,
      guest_name: "Dianne Rusel",
      guest_id: 102,
      room_id: 202,
      room_type: "Double Bed",
      check_in_date: "2025-03-21",
      check_out_date: "2025-03-24",
      reservation_date: "2025-03-16",
      status: "Confirmed",
    },
  ]);

  // Handle Check-in/Check-out
  const handleCheckInOut = (reservation_id, action) => {
    setReservations((prevReservations) =>
      prevReservations.map((reservation) => {
        if (reservation.reservation_id === reservation_id) {
          return {
            ...reservation,
            status: action === "check-in" ? "Checked-in" : "Checked-out",
          };
        }
        return reservation;
      })
    );
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg text-blue-600">Check-in / Check-out Management</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-gray-200 text-gray-700">
                <th className="p-2 text-left">Reservation ID</th>
                <th className="p-2 text-left">Guest Name</th>
                <th className="p-2 text-left">Room Type</th>
                <th className="p-2 text-left">Check-in Date</th>
                <th className="p-2 text-left">Check-out Date</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.reservation_id} className="border-b hover:bg-gray-100">
                  <td className="p-2">{reservation.reservation_id}</td>
                  <td className="p-2">{reservation.guest_name}</td>
                  <td className="p-2">{reservation.room_type}</td>
                  <td className="p-2">{reservation.check_in_date}</td>
                  <td className="p-2">{reservation.check_out_date}</td>
                  <td className="p-2 font-semibold text-blue-500">{reservation.status}</td>
                  <td className="p-2">
                    {reservation.status === "Confirmed" ? (
                      <button
                        onClick={() => handleCheckInOut(reservation.reservation_id, "check-in")}
                        className="text-green-600 font-medium hover:underline"
                      >
                        Check-in
                      </button>
                    ) : reservation.status === "Checked-in" ? (
                      <button
                        onClick={() => handleCheckInOut(reservation.reservation_id, "check-out")}
                        className="text-red-600 font-medium hover:underline"
                      >
                        Check-out
                      </button>
                    ) : (
                      <span className="text-gray-500">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CheckInCheckOutPage;