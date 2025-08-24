// src/components/HomePage/Booking/components/Step3Payment.jsx
import React from 'react';
import { FiCreditCard } from 'react-icons/fi';

const inputClasses = 'w-full h-[42px] px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

const Step3Payment = ({ bookingData, updateBookingData, loading, onPreviousStep, onBooking }) => {
  const handlePaymentMethodChange = (e) => {
    const { name, value } = e.target;
    updateBookingData({ [name]: value });
  };

  const handleCardDetailsChange = (e) => {
    const { name, value } = e.target;
    updateBookingData({
      cardDetails: {
        ...bookingData.cardDetails,
        [name]: value
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onBooking();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-6 text-gray-800">Payment Method</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Select Payment Method *
          </label>
          <div className="space-y-3">
            <label className="flex items-center p-4 border border-gray-300 rounded-md cursor-pointer hover:border-blue-500 transition">
              <input
                type="radio"
                name="paymentMethod"
                value="credit_card"
                checked={bookingData.paymentMethod === 'credit_card'}
                onChange={handlePaymentMethodChange}
                className="text-blue-600 focus:ring-blue-500"
                required
              />
              <FiCreditCard className="mx-4 text-gray-600" />
              <span className="text-sm">Credit Card</span>
            </label>

            <label className="flex items-center p-4 border border-gray-300 rounded-md cursor-pointer hover:border-blue-500 transition">
              <input
                type="radio"
                name="paymentMethod"
                value="paypal"
                checked={bookingData.paymentMethod === 'paypal'}
                onChange={handlePaymentMethodChange}
                className="text-blue-600 focus:ring-blue-500"
                required
              />
              <div className="mx-4 w-6 h-6 bg-blue-500 rounded"></div>
              <span className="text-sm">PayPal</span>
            </label>

            <label className="flex items-center p-4 border border-gray-300 rounded-md cursor-pointer hover:border-blue-500 transition">
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={bookingData.paymentMethod === 'cash'}
                onChange={handlePaymentMethodChange}
                className="text-blue-600 focus:ring-blue-500"
                required
              />
              <div className="mx-4 w-6 h-6 bg-green-500 rounded"></div>
              <span className="text-sm">Pay at Hotel</span>
            </label>
          </div>
        </div>

        {bookingData.paymentMethod === 'credit_card' && (
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h3 className="text-sm font-medium mb-4 text-gray-800">Credit Card Details *</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-gray-600 mb-2">Card Number *</label>
                <input
                  type="text"
                  name="cardNumber"
                  value={bookingData.cardDetails.cardNumber}
                  onChange={handleCardDetailsChange}
                  placeholder="1234 5678 9012 3456"
                  className={inputClasses}
                  required
                  maxLength="16"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-2">CVV *</label>
                <input
                  type="text"
                  name="cvv"
                  value={bookingData.cardDetails.cvv}
                  onChange={handleCardDetailsChange}
                  placeholder="123"
                  className={inputClasses}
                  required
                  maxLength="4"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-2">Expiry Date *</label>
                <input
                  type="text"
                  name="expiryDate"
                  value={bookingData.cardDetails.expiryDate}
                  onChange={handleCardDetailsChange}
                  placeholder="MM/YY"
                  className={inputClasses}
                  required
                  maxLength="5"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-2">Card Holder *</label>
                <input
                  type="text"
                  name="cardHolder"
                  value={bookingData.cardDetails.cardHolder}
                  onChange={handleCardDetailsChange}
                  placeholder="John Doe"
                  className={inputClasses}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Terms and Conditions */}
        <div className="mb-6 p-4 bg-blue-50 rounded-md">
          <label className="flex items-start">
            <input
              type="checkbox"
              required
              className="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              I agree to the terms and conditions and understand that this booking is subject to the hotel's cancellation policy.
            </span>
          </label>
        </div>

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={onPreviousStep}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition text-sm font-medium"
            disabled={loading}
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition text-sm font-medium"
          >
            {loading ? (
              <>
                <span className="animate-spin inline-block mr-2">⏳</span>
                Processing...
              </>
            ) : (
              'Confirm Booking'
            )}
          </button>
        </div>
      </form>

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-gray-100 rounded-md text-xs">
          <strong>Debug Info:</strong>
          <div>Payment Method: {bookingData.paymentMethod}</div>
          <div>Loading: {loading ? 'Yes' : 'No'}</div>
          <div>Card Details: {JSON.stringify(bookingData.cardDetails)}</div>
        </div>
      )}
    </div>
  );
};

export default Step3Payment;