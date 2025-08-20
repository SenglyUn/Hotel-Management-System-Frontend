// src/components/LandingPage/ContactSection.js
import React from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

const ContactSection = () => {
  return (
    <section id="contact" className="mb-16">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Contact Us</h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-bold text-xl mb-4">Get in Touch</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <FaMapMarkerAlt className="text-blue-600 mt-1" />
              <div>
                <h4 className="font-medium">Address</h4>
                <p className="text-gray-600">123 Luxury Street, Phnom Penh, Cambodia</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FaPhone className="text-blue-600 mt-1" />
              <div>
                <h4 className="font-medium">Phone</h4>
                <p className="text-gray-600">+855 23 456 7890</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FaEnvelope className="text-blue-600 mt-1" />
              <div>
                <h4 className="font-medium">Email</h4>
                <p className="text-gray-600">info@moonhotel.com</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-bold text-xl mb-4">Send Us a Message</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
              <input 
                type="email" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea 
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your message"
              ></textarea>
            </div>
            <button 
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;