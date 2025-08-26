// src/components/LandingPage/Footer.jsx
import React from 'react';
import { 
  FaFacebookF, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedinIn, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaArrowRight
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold mb-6">LuxuryStay</h3>
            <p className="text-gray-400 leading-relaxed mb-6">
              Experience the pinnacle of luxury and comfort with our exceptional accommodations and unparalleled service.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-gray-800 p-3 rounded-lg hover:bg-blue-600 transition-colors">
                <FaFacebookF className="text-lg" />
              </a>
              <a href="#" className="bg-gray-800 p-3 rounded-lg hover:bg-blue-400 transition-colors">
                <FaTwitter className="text-lg" />
              </a>
              <a href="#" className="bg-gray-800 p-3 rounded-lg hover:bg-pink-600 transition-colors">
                <FaInstagram className="text-lg" />
              </a>
              <a href="#" className="bg-gray-800 p-3 rounded-lg hover:bg-blue-700 transition-colors">
                <FaLinkedinIn className="text-lg" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 pb-2 border-b border-gray-700">Quick Links</h4>
            <ul className="space-y-3">
              {['Rooms & Suites', 'Amenities', 'Contact Us', 'Special Offers', 'Gallery', 'Testimonials'].map((item) => (
                <li key={item}>
                  <a 
                    href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} 
                    className="text-gray-400 hover:text-white transition-colors flex items-center group"
                  >
                    <FaArrowRight className="text-xs mr-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="group-hover:translate-x-2 transition-transform">{item}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6 pb-2 border-b border-gray-700">Contact Info</h4>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-gray-800 p-2 rounded-lg mr-4 mt-1">
                  <FaMapMarkerAlt className="text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-400">123 Luxury Avenue</p>
                  <p className="text-gray-400">City, State 12345</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="bg-gray-800 p-2 rounded-lg mr-4">
                  <FaPhone className="text-blue-400" />
                </div>
                <p className="text-gray-400">(123) 456-7890</p>
              </div>
              
              <div className="flex items-center">
                <div className="bg-gray-800 p-2 rounded-lg mr-4">
                  <FaEnvelope className="text-blue-400" />
                </div>
                <p className="text-gray-400">info@luxurystay.com</p>
              </div>
            </div>
          </div>
          
          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-6 pb-2 border-b border-gray-700">Stay Updated</h4>
            <p className="text-gray-400 mb-4">Subscribe to our newsletter for exclusive offers and updates.</p>
            <form className="space-y-3">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
              />
              <button 
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg font-medium"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} LuxuryStay. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;