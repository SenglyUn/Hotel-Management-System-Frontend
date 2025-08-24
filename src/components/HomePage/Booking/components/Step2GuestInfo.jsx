// src/components/HomePage/Booking/components/Step2GuestInfo.jsx
import React, { useState } from 'react';
import { FiPlus, FiMinus, FiUser } from 'react-icons/fi';

const inputClasses = 'w-full h-[42px] px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
const labelClasses = 'absolute -top-2 left-3 z-10 bg-white px-1 text-xs text-gray-600';

const Step2GuestInfo = ({ bookingData, updateBookingData, addAdditionalGuest, removeAdditionalGuest, onPreviousStep, onNextStep }) => {
  const [newAdditionalGuest, setNewAdditionalGuest] = useState({
    name: '',
    email: '',
    phone: '',
    id_type: 'Passport',
    id_number: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name in bookingData.guestInfo) {
      updateBookingData({
        guestInfo: {
          ...bookingData.guestInfo,
          [name]: value
        }
      });
    } else {
      updateBookingData({ [name]: value });
    }
  };

  const handleAdditionalGuestChange = (e, field) => {
    setNewAdditionalGuest(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleAddAdditionalGuest = () => {
    if (!newAdditionalGuest.name.trim()) {
      alert('Please enter guest name');
      return;
    }

    addAdditionalGuest(newAdditionalGuest);
    setNewAdditionalGuest({
      name: '',
      email: '',
      phone: '',
      id_type: 'Passport',
      id_number: ''
    });
  };

  const handleNext = () => {
    const { firstName, lastName, email, phone } = bookingData.guestInfo;
    if (!firstName || !lastName || !email || !phone) {
      alert('Please fill in all required guest information');
      return;
    }
    onNextStep();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-6 text-gray-800">Guest Information</h2>
      
      {/* Primary Guest Info */}
      <div className="mb-8">
        <h3 className="text-md font-medium mb-4 text-gray-800">Primary Guest</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="relative">
            <label className={labelClasses}>First Name *</label>
            <input
              type="text"
              name="firstName"
              value={bookingData.guestInfo.firstName}
              onChange={handleInputChange}
              className={inputClasses}
              required
            />
          </div>

          <div className="relative">
            <label className={labelClasses}>Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={bookingData.guestInfo.lastName}
              onChange={handleInputChange}
              className={inputClasses}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label className={labelClasses}>Email Address *</label>
            <input
              type="email"
              name="email"
              value={bookingData.guestInfo.email}
              onChange={handleInputChange}
              className={inputClasses}
              required
            />
          </div>

          <div className="relative">
            <label className={labelClasses}>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={bookingData.guestInfo.phone}
              onChange={handleInputChange}
              className={inputClasses}
              required
            />
          </div>
        </div>
      </div>

      {/* Additional Guests */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-medium text-gray-800">Additional Guests</h3>
          <button
            type="button"
            onClick={handleAddAdditionalGuest}
            className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
          >
            <FiPlus className="mr-1" />
            Add Guest
          </button>
        </div>

        {/* Add Guest Form */}
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-xs text-gray-600 mb-2">Name *</label>
              <input
                type="text"
                value={newAdditionalGuest.name}
                onChange={(e) => handleAdditionalGuestChange(e, 'name')}
                className={inputClasses}
                placeholder="Guest name"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-2">Email</label>
              <input
                type="email"
                value={newAdditionalGuest.email}
                onChange={(e) => handleAdditionalGuestChange(e, 'email')}
                className={inputClasses}
                placeholder="guest@email.com"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-2">Phone</label>
              <input
                type="tel"
                value={newAdditionalGuest.phone}
                onChange={(e) => handleAdditionalGuestChange(e, 'phone')}
                className={inputClasses}
                placeholder="Phone number"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-2">ID Type</label>
              <select
                value={newAdditionalGuest.id_type}
                onChange={(e) => handleAdditionalGuestChange(e, 'id_type')}
                className={inputClasses}
              >
                <option value="Passport">Passport</option>
                <option value="ID Card">ID Card</option>
                <option value="Driver License">Driver License</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-2">ID Number</label>
              <input
                type="text"
                value={newAdditionalGuest.id_number}
                onChange={(e) => handleAdditionalGuestChange(e, 'id_number')}
                className={inputClasses}
                placeholder="ID number"
              />
            </div>
          </div>
        </div>

        {/* Additional Guests List */}
        {bookingData.additionalGuests.length > 0 && (
          <div className="space-y-3">
            {bookingData.additionalGuests.map((guest, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
                <div className="flex items-center">
                  <FiUser className="text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium">{guest.name}</p>
                    {guest.email && <p className="text-xs text-gray-600">{guest.email}</p>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeAdditionalGuest(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FiMinus />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative mb-6">
        <label className={labelClasses}>Special Requests</label>
        <textarea
          name="specialRequests"
          value={bookingData.guestInfo.specialRequests}
          onChange={handleInputChange}
          rows={3}
          className={`${inputClasses} resize-none`}
          placeholder="Any special requests or requirements..."
        />
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={onPreviousStep}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition text-sm font-medium"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-medium"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
};

export default Step2GuestInfo;