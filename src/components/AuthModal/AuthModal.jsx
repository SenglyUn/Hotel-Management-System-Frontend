// src/components/AuthModal/AuthModal.js
import React from 'react';
import { FaTimes } from 'react-icons/fa';

const AuthModal = ({ showAuthModal, authMode, toggleAuthModal, handleAuth }) => {
  if (!showAuthModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {authMode === 'login' ? 'Login to Your Account' : 'Create an Account'}
        </h2>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const credentials = {
            email: formData.get('email'),
            password: formData.get('password')
          };
          if (authMode === 'register') {
            credentials.firstName = formData.get('firstName');
            credentials.lastName = formData.get('lastName');
          }
          handleAuth(credentials, authMode === 'register');
        }}>
          {authMode === 'register' && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input 
                  name="firstName"
                  type="text" 
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input 
                  name="lastName"
                  type="text" 
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              name="email"
              type="email" 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              name="password"
              type="password" 
              required
              minLength="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button 
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition mb-4"
          >
            {authMode === 'login' ? 'Login' : 'Register'}
          </button>
          
          <div className="text-center">
            <button 
              type="button"
              onClick={() => toggleAuthModal(authMode === 'login' ? 'register' : 'login')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {authMode === 'login' 
                ? "Don't have an account? Register" 
                : "Already have an account? Login"}
            </button>
          </div>
        </form>
        
        <button 
          onClick={() => toggleAuthModal()}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default AuthModal;