// src/components/HomePage/Booking/components/ProgressSteps.jsx
import React from 'react';
import { FiCheck } from 'react-icons/fi';

const ProgressSteps = ({ currentStep }) => {
  const steps = [
    { number: 1, label: 'Dates & Guests' },
    { number: 2, label: 'Guest Info' },
    { number: 3, label: 'Payment' }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === step.number
                  ? 'bg-blue-600 text-white border-2 border-blue-600'
                  : currentStep > step.number
                  ? 'bg-green-500 text-white border-2 border-green-500'
                  : 'bg-white text-gray-400 border-2 border-gray-300'
              }`}
            >
              {currentStep > step.number ? <FiCheck size={16} /> : step.number}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-1 mx-2 ${
                  currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="text-sm text-gray-600 flex justify-between">
        {steps.map(step => (
          <span
            key={step.number}
            className={currentStep >= step.number ? 'text-blue-600 font-medium' : ''}
          >
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ProgressSteps;