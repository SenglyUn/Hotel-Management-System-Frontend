import { useState } from "react";

const QuickAction = () => {
  const [roomType, setRoomType] = useState("Single Bed");
  const [roomNumber, setRoomNumber] = useState("#B24");
  const [guestName, setGuestName] = useState("Jerome Bell");
  const [serviceCharge, setServiceCharge] = useState(0);
  const baseCharge = 545.25;
  const totalCharge = baseCharge + serviceCharge;

  const handleServiceChange = (e) => {
    const charge = parseFloat(e.target.value) || 0;
    setServiceCharge(charge);
  };

  return (
    <div className="bg-white rounded-lg shadow-md mt-6 p-4 mb-20 w-800">
      <h2 className="font-bold text-md mb-2 text-blue-600">Quick Action</h2>

      {/* Check-in & Check-out Buttons */}
      <div className="mb-2 flex space-x-2">
        <button className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 transition">
          Check-in
        </button>
        <button className="bg-gray-500 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-600 transition">
          Check-out
        </button>
      </div>

      {/* Room Number & Room Type in Same Row */}
      <div className="mb-2 flex space-x-2">
        <div className="w-1/2">
          <label className="block text-gray-600 text-sm">Room No.</label>
          <input
            type="text"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            className="w-full p-1 border rounded-md text-sm mt-1 focus:ring focus:ring-blue-300"
          />
        </div>
        <div className="w-1/2">
          <label className="block text-gray-600 text-sm ">Room Type</label>
          <select
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            className="w-full p-1 border rounded-md text-sm mt-1 focus:ring focus:ring-blue-300"
          >
            <option>Single Bed</option>
            <option>Double Bed</option>
            <option>Luxury King</option>
            <option>Queen Bed</option>
          </select>
        </div>
      </div>

      {/* Guest Name & Service Charge in Same Row */}
      <div className="mb-2 flex space-x-2">
        <div className="w-1/2">
          <label className="block text-gray-600 text-sm">Guest Name</label>
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="w-full p-1 border rounded-md text-sm mt-1 focus:ring focus:ring-blue-300"
          />
        </div>
        <div className="w-1/2">
          <label className="block text-gray-600 text-sm">Service Charge</label>
          <input
            type="number"
            placeholder="Enter extra charge"
            value={serviceCharge}
            onChange={handleServiceChange}
            className="w-full p-1 border rounded-md text-sm mt-1 focus:ring focus:ring-blue-300"
          />
        </div>
      </div>

      {/* Total Charge Display */}
      <div className="mb-2">
        <p className="text-gray-600 text-sm">Total Charge</p>
        <p className="text-lg font-bold">${totalCharge.toFixed(2)}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button className="bg-gray-200 text-gray-700 px-3 py-1 text-sm rounded-md hover:bg-gray-300 transition">
          Print
        </button>
        <button className="bg-blue-500 text-white px-3 py-1 text-sm rounded-md hover:bg-blue-600 transition">
          Proceed
        </button>
      </div>
    </div>
  );
};

export default QuickAction;