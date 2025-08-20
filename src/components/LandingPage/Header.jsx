// src/components/LandingPage/Header.jsx
import React from 'react';

const Header = ({ isLoggedIn, userData, handleLogout, toggleAuthModal }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-800">LuxuryStay</h1>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#rooms" className="text-gray-700 hover:text-blue-600 transition">Rooms</a>
            <a href="#amenities" className="text-gray-700 hover:text-blue-600 transition">Amenities</a>
            <a href="#contact" className="text-gray-700 hover:text-blue-600 transition">Contact</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Welcome, {userData?.name || userData?.email}</span>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => toggleAuthModal('login')}
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 transition"
                >
                  Login
                </button>
                <button 
                  onClick={() => toggleAuthModal('register')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;