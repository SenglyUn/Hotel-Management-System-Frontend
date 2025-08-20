// src/components/LandingPage/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">LuxuryStay</h3>
            <p className="text-gray-400">Experience the pinnacle of luxury and comfort with our exceptional accommodations.</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#rooms" className="text-gray-400 hover:text-white transition">Rooms & Suites</a></li>
              <li><a href="#amenities" className="text-gray-400 hover:text-white transition">Amenities</a></li>
              <li><a href="#contact" className="text-gray-400 hover:text-white transition">Contact Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Special Offers</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact Info</h4>
            <address className="text-gray-400 not-italic">
              <p>123 Luxury Avenue</p>
              <p>City, State 12345</p>
              <p className="mt-2">Phone: (123) 456-7890</p>
              <p>Email: info@luxurystay.com</p>
            </address>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-facebook-f text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-linkedin-in text-xl"></i>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} LuxuryStay. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;