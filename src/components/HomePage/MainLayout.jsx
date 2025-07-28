import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom"; // Added NavLink
import {
  FaHome, FaUsers, FaBed, FaEnvelope, FaCog,
  FaCalendarCheck, FaBell, FaUserCircle, FaSearch,
  FaUtensils, FaParking, FaBars, FaTimes, FaSignOutAlt
} from "react-icons/fa";

// ========================
// Sidebar Component
// ========================
const Sidebar = ({ isOpen, toggleSidebar }) => {
  const menuItems = [
    { name: "Dashboard", icon: FaHome, path: "/home" },
    { name: "Guests", icon: FaUsers, path: "/guests" },
    { name: "Reservations", icon: FaCalendarCheck, path: "/reservations" },
    { name: "Rooms", icon: FaBed, path: "/rooms" },
    { name: "Restaurant", icon: FaUtensils, path: "/restaurant" },
    { name: "Parking", icon: FaParking, path: "/parking" },
    { name: "Message", icon: FaEnvelope, path: "/message" },
    { name: "Settings", icon: FaCog, path: "/settings" }
  ];

  return (
    <aside className={`bg-gray-900 text-gray-300 h-screen flex flex-col fixed top-0 left-0 z-30 transition-all duration-300 ${isOpen ? "w-64 p-6 pt-4" : "w-16 p-4"}`}>
      <div className="flex items-center justify-between mb-6">
        <button onClick={toggleSidebar} className="text-white text-xl focus:outline-none">
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
        {isOpen && <h1 className="text-xl font-bold text-white ml-2">Moon Hotel</h1>}
      </div>

      <ul className="space-y-2 flex-1 overflow-y-auto">
        {menuItems.map((item, index) => (
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
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
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
        <div className="flex items-center gap-3 bg-gray-100 rounded-full px-3 py-1 cursor-pointer group relative">
          <FaUserCircle className="w-8 h-8 text-gray-500" />
          <div className="leading-tight">
            <p className="font-medium text-gray-800 text-sm">Admin User</p>
            <p className="text-xs text-gray-500">admin</p>
          </div>
          <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-md shadow-lg hidden group-hover:block z-50">
            <button 
              onClick={handleLogout}
              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
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