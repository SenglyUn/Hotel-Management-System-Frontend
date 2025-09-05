import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FaHome, FaUsers, FaBed, FaEnvelope, FaCog,
  FaCalendarCheck, FaBell, FaUserCircle, FaSearch,
  FaUtensils, FaParking, FaBars, FaTimes, FaSignOutAlt,
  FaUserCog, FaUserPlus, FaUserFriends, FaChevronDown,
  FaEdit, FaTrash, FaPlus, FaFilter
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

// ========================
// Sidebar Component
// ========================
const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();

  const baseMenuItems = [
    { name: "Dashboard", icon: FaHome, path: "/home", roles: ['admin', 'staff'] },
    { name: "Guests", icon: FaUsers, path: "/guests", roles: ['admin', 'staff'] },
    { name: "Reservations", icon: FaCalendarCheck, path: "/reservations", roles: ['admin', 'staff'] },
    { name: "Rooms", icon: FaBed, path: "/rooms", roles: ['admin', 'staff'] }
  ];

  const adminMenuItems = [
    { name: "Users", icon: FaUserCog, path: "/users", roles: ['admin'] },
    { name: "Restaurant", icon: FaUtensils, path: "/restaurant", roles: ['admin'] },
    { name: "Parking", icon: FaParking, path: "/parking", roles: ['admin'] },
    { name: "Messages", icon: FaEnvelope, path: "/messages", roles: ['admin'] },
    { name: "Settings", icon: FaCog, path: "/settings", roles: ['admin'] }
  ];

  const allMenuItems = [...baseMenuItems, ...adminMenuItems];
  const filteredMenuItems = allMenuItems.filter(item => 
    item.roles.includes(user?.role?.toLowerCase())
  );

  return (
    <aside className={`bg-indigo-900 text-white h-screen flex flex-col fixed top-0 left-0 z-30 transition-all duration-300 ease-in-out ${isOpen ? "w-64" : "w-20"}`}>
      <div className="flex items-center justify-between p-4 border-b border-indigo-800">
        {isOpen && <h1 className="text-xl font-bold text-white">Moon Hotel</h1>}
        <button 
          onClick={toggleSidebar} 
          className="text-white p-2 rounded-lg hover:bg-indigo-800 transition-colors"
        >
          {isOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {filteredMenuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={index}>
                <NavLink
                  to={item.path}
                  className={`flex items-center p-3 rounded-lg transition-all duration-200
                    ${isOpen ? "justify-start" : "justify-center"} 
                    ${isActive 
                      ? "bg-white text-indigo-700 shadow-md" 
                      : "text-indigo-100 hover:bg-indigo-800 hover:text-white"}`}
                >
                  <Icon className="text-lg flex-shrink-0" />
                  {isOpen && <span className="ml-3 text-sm font-medium">{item.name}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={`p-4 border-t border-indigo-800 ${isOpen ? "text-center" : "flex justify-center"}`}>
        <p className="text-indigo-300 text-xs">
          {isOpen ? "Moon Hotel v1.0 © 2023" : "v1.0"}
        </p>
      </div>
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
    <header className={`bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between fixed top-0 z-20 shadow-sm transition-all duration-300 ${sidebarOpen ? "ml-64 w-[calc(100%-16rem)]" : "ml-20 w-[calc(100%-5rem)]"}`}>
      <div className="flex-1 max-w-xl">
        <div className="bg-gray-100 rounded-lg px-4 py-2.5 flex items-center shadow-inner">
          <FaSearch className="text-gray-500 mr-3 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search anything..."
            className="bg-transparent focus:outline-none w-full text-sm text-gray-700 placeholder-gray-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative">
          <button className="relative w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
            <FaBell />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </button>
        </div>
        
        <div className="relative">
          <div 
            className="flex items-center gap-3 bg-gray-100 rounded-full pl-1 pr-3 py-1 cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div className="leading-tight">
              <p className="font-medium text-gray-800 text-sm">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role}
              </p>
            </div>
            <FaChevronDown className={`text-gray-500 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
          </div>
          
          {showDropdown && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-200 py-1">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-800">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FaSignOutAlt className="mr-2 text-gray-500" />
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
    { id: 1, name: "John Doe", email: "john@moonhotel.com", role: "admin", status: "active", lastLogin: "2023-04-15", avatarColor: "bg-blue-500" },
    { id: 2, name: "Jane Smith", email: "jane@moonhotel.com", role: "staff", status: "active", lastLogin: "2023-04-14", avatarColor: "bg-green-500" },
    { id: 3, name: "Robert Johnson", email: "robert@moonhotel.com", role: "staff", status: "inactive", lastLogin: "2023-04-10", avatarColor: "bg-purple-500" },
    { id: 4, name: "Sarah Williams", email: "sarah@moonhotel.com", role: "staff", status: "active", lastLogin: "2023-04-16", avatarColor: "bg-yellow-500" },
  ]);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "staff",
    password: ""
  });

  // Filter users based on role, status, and search term
  const filteredUsers = users.filter(user => {
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesStatus && matchesSearch;
  });

  const handleAddUser = (e) => {
    e.preventDefault();
    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-yellow-500", "bg-pink-500", "bg-red-500"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const user = {
      id: users.length + 1,
      name: `${newUser.firstName} ${newUser.lastName}`,
      email: newUser.email,
      role: newUser.role,
      status: "active",
      lastLogin: new Date().toISOString().split('T')[0],
      avatarColor: randomColor
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
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your hotel staff and administrators</p>
        </div>
        <button 
          onClick={() => setShowAddUserModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center whitespace-nowrap"
        >
          <FaPlus className="mr-2" size={12} />
          Add User
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button 
              onClick={() => {
                setFilterRole("all");
                setFilterStatus("all");
                setSearchTerm("");
              }}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center"
            >
              <FaFilter className="mr-2" size={12} />
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
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
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-medium ${user.avatarColor}`}>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => toggleUserStatus(user.id)}
                        className={`p-2 rounded-md ${user.status === 'active' ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                        title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {user.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        onClick={() => deleteUser(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  No users found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Add New User</h3>
            </div>
            <form onSubmit={handleAddUser} className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="user@moonhotel.com"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  minLength="6"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="At least 6 characters"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
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
      <main className={`transition-all duration-300 pt-20 pb-6 px-6 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;