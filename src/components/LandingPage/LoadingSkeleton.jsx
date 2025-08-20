// src/components/LandingPage/LoadingSkeleton.js
import React from 'react';

const LoadingSkeleton = () => (
  <div className="grid md:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse h-full">
        <div className="h-56 bg-gray-200"></div>
        <div className="p-5 space-y-4">
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;