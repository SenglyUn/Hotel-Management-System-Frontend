// src/components/LandingPage/HeroSection.jsx
import React from 'react';

const HeroSection = ({ isLoggedIn, navigate, toggleAuthModal }) => {
  return (
    <section className="relative bg-blue-900 text-white py-20">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')" }}
      ></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Experience Luxury Redefined</h1>
          <p className="text-xl mb-8 opacity-90">Discover unparalleled comfort in our meticulously designed accommodations</p>
          
          {isLoggedIn ? (
            <button 
              onClick={() => document.getElementById('rooms').scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-lg"
            >
              Book Now
            </button>
          ) : (
            <button 
              onClick={() => toggleAuthModal('register')}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-lg"
            >
              Create Account to Book
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;