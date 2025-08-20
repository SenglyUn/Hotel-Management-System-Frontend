import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  FaHome, FaUsers, FaBed, FaEnvelope, FaCog,
  FaCalendarCheck, FaBell, FaUserCircle, FaSearch,
  FaUtensils, FaParking, FaBars, FaTimes, FaSignOutAlt,
  FaUserCog, FaUserPlus, FaUserFriends
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

// ========================
// Sidebar Component
// ========================
const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth(); // Get the current user from auth context

  // Base menu items that everyone gets
  const baseMenuItems = [
    { name: "Dashboard", icon: FaHome, path: "/home", roles: ['admin', 'staff'] },
    { name: "Guests", icon: FaUsers, path: "/guests", roles: ['admin', 'staff'] },
    { name: "Reservations", icon: FaCalendarCheck, path: "/reservations", roles: ['admin', 'staff'] },
    { name: "Rooms", icon: FaBed, path: "/rooms", roles: ['admin', 'staff'] }
  ];

  // Admin-only menu items
  const adminMenuItems = [
    { name: "Users", icon: FaUserCog, path: "/users", roles: ['admin'] },
    { name: "Restaurant", icon: FaUtensils, path: "/restaurant", roles: ['admin'] },
    { name: "Parking", icon: FaParking, path: "/parking", roles: ['admin'] },
    { name: "Message", icon: FaEnvelope, path: "/message", roles: ['admin'] },
    { name: "Settings", icon: FaCog, path: "/settings", roles: ['admin'] }
  ];

  // Combine all possible menu items
  const allMenuItems = [...baseMenuItems, ...adminMenuItems];

  // Filter menu items based on user role
  const filteredMenuItems = allMenuItems.filter(item => 
    item.roles.includes(user?.role?.toLowerCase())
  );

  return (
    <aside className={`bg-gray-900 text-gray-300 h-screen flex flex-col fixed top-0 left-0 z-30 transition-all duration-300 ${isOpen ? "w-64 p-6 pt-4" : "w-16 p-4"}`}>
      <div className="flex items-center justify-between mb-6">
        <button onClick={toggleSidebar} className="text-white text-xl focus:outline-none">
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
        {isOpen && <h1 className="text-xl font-bold text-white ml-2">Moon Hotel</h1>}
      </div>

      <ul className="space-y-2 flex-1 overflow-y-auto">
        {filteredMenuItems.map((item, index) => (
          <li key={index}>
            <NavLink
              to={item.path}
              className={({ isActive }) => 
                `flex items-center space-x-4 p-3 rounded-md transition-all 
                ${isOpen ? "" : "justify-center"} 
                ${isActive 
                  ? "bg-blue-600 text-white" 
                  : "hover:bg-gray-700 hover:text-white"}`
              }
            >
              <item.icon className="text-lg" />
              {isOpen && <span className="text-sm font-medium">{item.name}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
};

// ========================
// Header Component
// ========================
const Header = ({ sidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className={`bg-white border-b border-gray-200 px-6 py-2 flex items-center justify-between fixed top-0 z-20 shadow-sm transition-all duration-300 w-full ${sidebarOpen ? "pl-64" : "pl-16"}`}>
      <div className="relative flex-1 max-w-xl">
        <div className="bg-gray-100 rounded-sm px-4 py-2 flex items-center shadow-sm ml-4">
          <FaSearch className="text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="Search anything"
            className="bg-transparent focus:outline-none w-full text-sm text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-4">
        <div className="relative w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <FaBell className="text-gray-600" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
            3
          </span>
        </div>
        <div 
          className="flex items-center gap-3 bg-gray-100 rounded-full px-3 py-1 cursor-pointer relative"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <FaUserCircle className="w-8 h-8 text-gray-500" />
          <div className="leading-tight">
            <p className="font-medium text-gray-800 text-sm">
              {user?.firstName || 'User'} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role || 'role'}
            </p>
          </div>
          
          {showDropdown && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50">
              <button 
                onClick={handleLogout}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FaSignOutAlt className="mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// ========================
// Users Management Component
// ========================
const UsersManagement = () => {
  const [users, setUsers] = useState([
    { id: 1, name: "John Doe", email: "john@moonhotel.com", role: "admin", status: "active", lastLogin: "2023-04-15" },
    { id: 2, name: "Jane Smith", email: "jane@moonhotel.com", role: "staff", status: "active", lastLogin: "2023-04-14" },
    { id: 3, name: "Robert Johnson", email: "robert@moonhotel.com", role: "staff", status: "inactive", lastLogin: "2023-04-10" },
    { id: 4, name: "Sarah Williams", email: "sarah@moonhotel.com", role: "staff", status: "active", lastLogin: "2023-04-16" },
  ]);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "staff",
    password: ""
  });

  const handleAddUser = (e) => {
    e.preventDefault();
    const user = {
      id: users.length + 1,
      name: `${newUser.firstName} ${newUser.lastName}`,
      email: newUser.email,
      role: newUser.role,
      status: "active",
      lastLogin: new Date().toISOString().split('T')[0]
    };
    
    setUsers([...users, user]);
    setShowAddUserModal(false);
    setNewUser({ firstName: "", lastName: "", email: "", role: "staff", password: "" });
  };

  const toggleUserStatus = (id) => {
    setUsers(users.map(user => 
      user.id === id 
        ? { ...user, status: user.status === "active" ? "inactive" : "active" } 
        : user
    ));
  };

  const deleteUser = (id) => {
    setUsers(users.filter(user => user.id !== id));
  };

  return (
    <div className="bg-white rounded-xl shadow-xs p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
        <button 
          onClick={() => setShowAddUserModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
        >
          <FaUserPlus className="mr-2" />
          Add User
        </button>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <FaUserCircle className="h-10 w-10 text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.lastLogin}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => toggleUserStatus(user.id)}
                    className={`mr-3 ${user.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                  >
                    {user.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button 
                    onClick={() => deleteUser(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Add New User</h3>
            <form onSubmit={handleAddUser}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ========================
// Main Layout Component
// ========================
const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <Header 
        sidebarOpen={sidebarOpen}
      />
      <main className={`transition-all duration-300 pt-20 px-6 ${sidebarOpen ? "pl-64" : "pl-16"}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;