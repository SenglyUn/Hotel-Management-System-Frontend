// src/components/AuthModal/AuthModal.js
import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AuthModal = ({ showAuthModal, authMode, toggleAuthModal }) => {
  const navigate = useNavigate();
  
  if (!showAuthModal) return null;

  const handleRedirect = () => {
    toggleAuthModal(); // Close the modal first
    if (authMode === 'login') {
      navigate('/login');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-md w-full relative">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {authMode === 'login' ? 'Login to Your Account' : 'Create an Account'}
        </h2>
        
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-4">
            {authMode === 'login' 
              ? 'You will be redirected to our login page' 
              : 'You will be redirected to our registration page'}
          </p>
          
          <button 
            onClick={handleRedirect}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            {authMode === 'login' ? 'Continue to Login' : 'Continue to Sign Up'}
          </button>
        </div>
        
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