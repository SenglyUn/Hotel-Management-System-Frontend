import React, { useState } from 'react';
import { FiPlus, FiX, FiEdit2, FiLogOut, FiSearch, FiCalendar, FiClock } from 'react-icons/fi';

const ParkingManagement = () => {
  const [activeTab, setActiveTab] = useState('current');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newParking, setNewParking] = useState({
    licensePlate: '',
    guestName: '',
    roomNumber: '',
    checkIn: '',
    checkOut: '',
    status: 'active'
  });

  // Sample parking data
  const parkingData = {
    current: [
      { id: 1, licensePlate: 'ABC-1234', guestName: 'John Doe', roomNumber: '201', checkIn: '2023-05-15 14:30', checkOut: '2023-05-17 11:00', status: 'active' },
      { id: 2, licensePlate: 'XYZ-5678', guestName: 'Jane Smith', roomNumber: '305', checkIn: '2023-05-16 16:45', checkOut: '2023-05-18 10:00', status: 'active' },
      { id: 3, licensePlate: 'DEF-9012', guestName: 'Robert Johnson', roomNumber: '102', checkIn: '2023-05-17 12:15', checkOut: '2023-05-19 12:00', status: 'active' },
    ],
    history: [
      { id: 4, licensePlate: 'GHI-3456', guestName: 'Emily Davis', roomNumber: '208', checkIn: '2023-05-10 15:20', checkOut: '2023-05-12 10:30', status: 'completed' },
      { id: 5, licensePlate: 'JKL-7890', guestName: 'Michael Wilson', roomNumber: '401', checkIn: '2023-05-11 18:10', checkOut: '2023-05-14 09:45', status: 'completed' },
    ]
  };

  // Filter data based on search query
  const filteredData = parkingData[activeTab].filter(item =>
    item.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddParking = (e) => {
    e.preventDefault();
    // In a real app, you would save to your backend here
    setShowAddModal(false);
    setNewParking({
      licensePlate: '',
      guestName: '',
      roomNumber: '',
      checkIn: '',
      checkOut: '',
      status: 'active'
    });
  };

  const handleCheckOut = (id) => {
    // In a real app, you would update your backend here
    console.log(`Checked out parking with id: ${id}`);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Parking Management</h1>
          <p className="text-gray-500">Manage guest vehicles and parking history</p>
        </div>
        
        <div className="flex space-x-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search vehicles..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            <FiPlus />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`pb-3 px-4 font-medium text-sm relative ${activeTab === 'current' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('current')}
        >
          Current Parking
          {activeTab === 'current' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
          )}
          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${activeTab === 'current' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
            {parkingData.current.length}
          </span>
        </button>
        <button
          className={`pb-3 px-4 font-medium text-sm relative ${activeTab === 'history' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('history')}
        >
          Parking History
          {activeTab === 'history' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
          )}
          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${activeTab === 'history' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
            {parkingData.history.length}
          </span>
        </button>
      </div>

      {/* Parking Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  License Plate
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <FiClock className="mr-1" /> Check-In
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <FiClock className="mr-1" /> Check-Out
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {activeTab === 'current' && (
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length > 0 ? (
                filteredData.map((parking) => (
                  <tr key={parking.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{parking.licensePlate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{parking.guestName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{parking.roomNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{parking.checkIn}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{parking.checkOut}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full 
                        ${parking.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {parking.status}
                      </span>
                    </td>
                    {activeTab === 'current' && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <button
                          onClick={() => handleCheckOut(parking.id)}
                          className="text-gray-500 hover:text-gray-700 transition"
                          title="Check Out"
                        >
                          <FiLogOut />
                        </button>
                        <button 
                          className="text-gray-500 hover:text-gray-700 transition"
                          title="Edit"
                        >
                          <FiEdit2 />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={activeTab === 'current' ? 7 : 6} className="px-6 py-4 text-center text-gray-500">
                    No parking records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Parking Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="text-lg font-medium text-gray-900">Add New Vehicle</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-500 rounded-full p-1"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleAddParking} className="p-5 space-y-4">
              <div>
                <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
                <input
                  type="text"
                  id="licensePlate"
                  value={newParking.licensePlate}
                  onChange={(e) => setNewParking({...newParking, licensePlate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                  placeholder="ABC-1234"
                />
              </div>
              <div>
                <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label>
                <input
                  type="text"
                  id="guestName"
                  value={newParking.guestName}
                  onChange={(e) => setNewParking({...newParking, guestName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                <input
                  type="text"
                  id="roomNumber"
                  value={newParking.roomNumber}
                  onChange={(e) => setNewParking({...newParking, roomNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                  placeholder="201"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-1">Check-In</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="datetime-local"
                      id="checkIn"
                      value={newParking.checkIn}
                      onChange={(e) => setNewParking({...newParking, checkIn: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-1">Check-Out</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="datetime-local"
                      id="checkOut"
                      value={newParking.checkOut}
                      onChange={(e) => setNewParking({...newParking, checkOut: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                >
                  Add Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingManagement;