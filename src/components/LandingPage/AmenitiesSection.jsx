// src/components/LandingPage/AmenitiesSection.js
import React from 'react';
import { 
  FaWifi, FaSwimmingPool, FaUtensils, FaParking, 
  FaConciergeBell, FaTv, FaSnowflake, FaGlassMartiniAlt,
  FaSpa, FaDumbbell, FaShuttleVan, FaTree
} from 'react-icons/fa';

const AmenitiesSection = () => {
  const amenities = [
    { 
      icon: <FaWifi className="text-blue-500" size={28} />, 
      name: 'Free WiFi', 
      description: 'High-speed internet access throughout the hotel' 
    },
    { 
      icon: <FaSwimmingPool className="text-blue-400" size={28} />, 
      name: 'Infinity Pool', 
      description: 'Stunning outdoor pool with panoramic views' 
    },
    { 
      icon: <FaUtensils className="text-amber-500" size={28} />, 
      name: 'Gourmet Restaurant', 
      description: 'Fine dining with local and international cuisine' 
    },
    { 
      icon: <FaParking className="text-gray-600" size={28} />, 
      name: 'Valet Parking', 
      description: 'Complimentary secure valet parking service' 
    },
    { 
      icon: <FaConciergeBell className="text-purple-500" size={28} />, 
      name: '24/7 Concierge', 
      description: 'Personalized service available at all times' 
    },
    { 
      icon: <FaTv className="text-indigo-500" size={28} />, 
      name: 'Entertainment', 
      description: 'Premium TV channels and streaming services' 
    },
    { 
      icon: <FaSnowflake className="text-cyan-400" size={28} />, 
      name: 'Climate Control', 
      description: 'Individual temperature control in all rooms' 
    },
    { 
      icon: <FaGlassMartiniAlt className="text-pink-500" size={28} />, 
      name: 'Sky Bar', 
      description: 'Rooftop bar with signature cocktails and city views' 
    },
    { 
      icon: <FaSpa className="text-teal-400" size={28} />, 
      name: 'Luxury Spa', 
      description: 'Rejuvenating treatments and wellness therapies' 
    },
    { 
      icon: <FaDumbbell className="text-red-500" size={28} />, 
      name: 'Fitness Center', 
      description: 'State-of-the-art equipment with personal trainers' 
    },
    { 
      icon: <FaShuttleVan className="text-green-500" size={28} />, 
      name: 'Airport Shuttle', 
      description: 'Complimentary transportation to and from airport' 
    },
    { 
      icon: <FaTree className="text-emerald-600" size={28} />, 
      name: 'Gardens', 
      description: 'Beautifully landscaped gardens and outdoor spaces' 
    }
  ];

  return (
    <section id="amenities" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4 font-serif">Premium Amenities</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Experience unparalleled comfort with our exceptional facilities and services designed for your ultimate relaxation
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {amenities.map((amenity, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center"
            >
              <div className="bg-blue-50 p-4 rounded-full mb-4">
                {amenity.icon}
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">{amenity.name}</h3>
              <p className="text-gray-600 text-sm">{amenity.description}</p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Explore All Amenities
          </button>
        </div>
      </div>
    </section>
  );
};

export default AmenitiesSection;