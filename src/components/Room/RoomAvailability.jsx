const RoomAvailability = () => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Room Availability</h2>
      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500" style={{ width: '70%' }}></div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-gray-700">
        <div><strong>Occupied:</strong> 286</div>
        <div><strong>Reserved:</strong> 87</div>
        <div><strong>Available:</strong> 32</div>
        <div><strong>Not Ready:</strong> 13</div>
      </div>
    </div>
  );
};

export default RoomAvailability;
