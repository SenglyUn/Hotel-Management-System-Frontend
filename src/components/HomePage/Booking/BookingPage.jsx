// src/components/HomePage/Booking/BookingPage.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import BookingHeader from './components/BookingHeader';
import ProgressSteps from './components/ProgressSteps';
import Step1DatesGuests from './components/Step1DatesGuests';
import Step2GuestInfo from './components/Step2GuestInfo';
import Step3Payment from './components/Step3Payment';
import BookingSummary from './components/BookingSummary';
import { useBooking } from './hooks/useBooking';
import 'react-toastify/dist/ReactToastify.css';

const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser } = useAuth();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authUser) {
      toast.error('Please log in to book a room');
      navigate('/login', { state: { from: location } });
    }
  }, [authUser, navigate, location]);

  const {
    bookingData,
    loading,
    step,
    total,
    updateBookingData,
    addAdditionalGuest,
    removeAdditionalGuest,
    setStep,
    handleBooking,
    calculateTotal
  } = useBooking(location, navigate);

  if (!authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (!bookingData.room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1DatesGuests
            bookingData={bookingData}
            updateBookingData={updateBookingData}
            onNextStep={() => setStep(2)}
          />
        );
      case 2:
        return (
          <Step2GuestInfo
            bookingData={bookingData}
            updateBookingData={updateBookingData}
            addAdditionalGuest={addAdditionalGuest}
            removeAdditionalGuest={removeAdditionalGuest}
            onPreviousStep={() => setStep(1)}
            onNextStep={() => setStep(3)}
          />
        );
      case 3:
        return (
          <Step3Payment
            bookingData={bookingData}
            updateBookingData={updateBookingData}
            loading={loading}
            onPreviousStep={() => setStep(2)}
            onBooking={handleBooking}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <BookingHeader onBack={() => navigate('/landing')} />
        
        <ProgressSteps currentStep={step} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Booking Steps */}
          <div className="lg:col-span-2 space-y-6">
            {renderStep()}
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-1">
            <BookingSummary 
              bookingData={bookingData} 
              total={total} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;