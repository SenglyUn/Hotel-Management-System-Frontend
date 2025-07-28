const BookingByPlatform = () => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Booking by Platform</h2>
      <div className="flex items-center justify-center">
        {/* Placeholder for Pie Chart */}
        <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
          Chart
        </div>
      </div>
      <ul className="mt-4 space-y-1 text-sm text-gray-700">
        <li>61% Direct Booking</li>
        <li>12% Booking.com</li>
        <li>11% Agoda</li>
        <li>9% Airbnb</li>
        <li>5% Hotels.com</li>
        <li>2% Others</li>
      </ul>
    </div>
  );
};

export default BookingByPlatform;
