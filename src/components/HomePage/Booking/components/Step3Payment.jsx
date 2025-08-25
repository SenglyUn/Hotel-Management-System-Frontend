// src/components/HomePage/Booking/components/Step3Payment.jsx
import React, { useState } from 'react';
import { FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import BookingSummary from './BookingSummary';

const inputClasses = 'w-full h-[42px] px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

const Step3Payment = ({ bookingData, updateBookingData, loading, onPreviousStep, onBooking, total }) => {
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Call the onBooking function which should return a promise
      const result = await onBooking();
      
      // If booking is successful, show confirmation
      if (result && result.success) {
        setBookingConfirmed(true);
        // Generate a random confirmation number (in a real app, this would come from the server)
        setConfirmationNumber('BK' + Math.floor(100000 + Math.random() * 900000));
      }
    } catch (error) {
      console.error('Booking failed:', error);
      // Handle booking failure (show error message, etc.)
    }
  };

  if (bookingConfirmed) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-6">Your reservation has been successfully confirmed.</p>
          <div className="bg-blue-50 p-4 rounded-md mb-6 inline-block">
            <p className="text-sm text-gray-600">Confirmation Number</p>
            <p className="text-xl font-bold text-blue-700">{confirmationNumber}</p>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Booking Summary</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <BookingSummary bookingData={bookingData} total={total} />
            
            {/* Payment Information */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h4 className="text-sm font-semibold mb-3 text-gray-800">Payment Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Payment Method:</p>
                  <p className="font-medium">
                    {bookingData.paymentMethod === 'credit_card' && 'Credit Card'}
                    {bookingData.paymentMethod === 'paypal' && 'PayPal'}
                    {bookingData.paymentMethod === 'cash' && 'Pay at Hotel'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Status:</p>
                  <p className="font-medium text-green-600">Paid</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => window.print()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition text-sm font-medium mr-4"
          >
            Print Receipt
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-medium"
          >
            Book Another Room
          </button>
        </div>
      </div>
    );
  }

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