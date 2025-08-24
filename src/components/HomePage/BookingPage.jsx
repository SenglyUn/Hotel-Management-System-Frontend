// // src/components/HomePage/BookingPage.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { 
//   FiCalendar, 
//   FiUser, 
//   FiCreditCard, 
//   FiArrowLeft,
//   FiCheck,
//   FiStar,
//   FiWifi,
//   FiCoffee,
//   FiTv,
//   FiWind,
//   FiShower,
//   FiLock,
//   FiX,
//   FiPlus,
//   FiMinus
// } from 'react-icons/fi';

// const API_BASE_URL = 'http://localhost:5000';

// const BookingPage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user } = useAuth();
//   const [loading, setLoading] = useState(false);
//   const [step, setStep] = useState(1);
//   const [bookingData, setBookingData] = useState({
//     room: null,
//     checkIn: '',
//     checkOut: '',
//     adults: 1,
//     children: 0,
//     guestInfo: {
//       firstName: '',
//       lastName: '',
//       email: '',
//       phone: '',
//       specialRequests: ''
//     },
//     paymentMethod: 'credit_card'
//   });

//   // Shared input classes
//   const inputClasses = 'w-full h-[42px] px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
//   const labelClasses = 'absolute -top-2 left-3 z-10 bg-white px-1 text-xs text-gray-600';

//   // Get room data from location state or redirect
//   useEffect(() => {
//     if (location.state?.room) {
//       setBookingData(prev => ({
//         ...prev,
//         room: location.state.room,
//         checkIn: location.state.checkIn || '',
//         checkOut: location.state.checkOut || '',
//         adults: location.state.adults || 1,
//         children: location.state.children || 0
//       }));
//     } else {
//       toast.error('No room selected for booking');
//       navigate('/landing');
//     }
//   }, [location, navigate]);

//   const calculateTotal = () => {
//     if (!bookingData.room || !bookingData.checkIn || !bookingData.checkOut) return 0;
    
//     const checkIn = new Date(bookingData.checkIn);
//     const checkOut = new Date(bookingData.checkOut);
//     const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
//     const roomPrice = bookingData.room.type?.base_price || bookingData.room.base_price || 0;
//     const total = roomPrice * nights;
    
//     return {
//       nights,
//       roomPrice,
//       subtotal: total,
//       tax: total * 0.12,
//       total: total * 1.12
//     };
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     if (name in bookingData.guestInfo) {
//       setBookingData(prev => ({
//         ...prev,
//         guestInfo: {
//           ...prev.guestInfo,
//           [name]: value
//         }
//       }));
//     } else {
//       setBookingData(prev => ({
//         ...prev,
//         [name]: value
//       }));
//     }
//   };

//   const handleNextStep = () => {
//     if (step === 1 && (!bookingData.checkIn || !bookingData.checkOut)) {
//       toast.error('Please select check-in and check-out dates');
//       return;
//     }
//     if (step === 2) {
//       const { firstName, lastName, email, phone } = bookingData.guestInfo;
//       if (!firstName || !lastName || !email || !phone) {
//         toast.error('Please fill in all required guest information');
//         return;
//       }
//     }
//     setStep(step + 1);
//   };

//   const handlePreviousStep = () => {
//     setStep(step - 1);
//   };

//   const handleBooking = async () => {
//     setLoading(true);
//     try {
//       const total = calculateTotal();
      
//       const bookingPayload = {
//         room_id: bookingData.room.id,
//         check_in: bookingData.checkIn,
//         check_out: bookingData.checkOut,
//         adults: parseInt(bookingData.adults),
//         children: parseInt(bookingData.children),
//         guest_info: bookingData.guestInfo,
//         total_amount: total.total,
//         payment_method: bookingData.paymentMethod
//       };

//       const response = await fetch(`${API_BASE_URL}/api/reservations`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         credentials: 'include',
//         body: JSON.stringify(bookingPayload),
//       });

//       const data = await response.json();

//       if (data.success) {
//         toast.success('Booking confirmed successfully!');
//         navigate('/booking-confirmation', { 
//           state: { 
//             booking: data.data,
//             room: bookingData.room 
//           } 
//         });
//       } else {
//         throw new Error(data.message || 'Booking failed');
//       }
//     } catch (error) {
//       console.error('Booking error:', error);
//       toast.error(error.message || 'Failed to complete booking. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const total = calculateTotal();

//   if (!bookingData.room) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading booking details...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="container mx-auto px-4 max-w-6xl">
//         {/* Header */}
//         <div className="flex items-center mb-8">
//           <button
//             onClick={() => navigate('/landing')}
//             className="flex items-center text-blue-600 hover:text-blue-700 mr-4 text-sm font-medium"
//           >
//             <FiArrowLeft className="mr-2" />
//             Back to Rooms
//           </button>
//           <h1 className="text-2xl font-semibold text-gray-800">Complete Your Booking</h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Left Column - Booking Steps */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Progress Steps */}
//             <div className="bg-white rounded-lg border border-gray-200 p-6">
//               <div className="flex justify-between items-center mb-4">
//                 {[1, 2, 3].map((stepNumber) => (
//                   <div key={stepNumber} className="flex items-center">
//                     <div
//                       className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
//                         step === stepNumber
//                           ? 'bg-blue-600 text-white border-2 border-blue-600'
//                           : step > stepNumber
//                           ? 'bg-green-500 text-white border-2 border-green-500'
//                           : 'bg-white text-gray-400 border-2 border-gray-300'
//                       }`}
//                     >
//                       {step > stepNumber ? <FiCheck size={16} /> : stepNumber}
//                     </div>
//                     {stepNumber < 3 && (
//                       <div
//                         className={`w-12 h-1 mx-2 ${
//                           step > stepNumber ? 'bg-green-500' : 'bg-gray-200'
//                         }`}
//                       />
//                     )}
//                   </div>
//                 ))}
//               </div>

//               <div className="text-sm text-gray-600 flex justify-between">
//                 <span className={step >= 1 ? 'text-blue-600 font-medium' : ''}>
//                   Dates & Guests
//                 </span>
//                 <span className={step >= 2 ? 'text-blue-600 font-medium' : ''}>
//                   Guest Info
//                 </span>
//                 <span className={step >= 3 ? 'text-blue-600 font-medium' : ''}>
//                   Payment
//                 </span>
//               </div>
//             </div>

//             {/* Step 1: Dates & Guests */}
//             {step === 1 && (
//               <div className="bg-white rounded-lg border border-gray-200 p-6">
//                 <h2 className="text-lg font-semibold mb-6 text-gray-800">Select Dates & Guests</h2>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                   <div className="relative">
//                     <label className={labelClasses}>Check-in Date *</label>
//                     <div className="relative">
//                       <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                       <input
//                         type="date"
//                         name="checkIn"
//                         value={bookingData.checkIn}
//                         onChange={handleInputChange}
//                         min={new Date().toISOString().split('T')[0]}
//                         className={`${inputClasses} pl-10`}
//                       />
//                     </div>
//                   </div>

//                   <div className="relative">
//                     <label className={labelClasses}>Check-out Date *</label>
//                     <div className="relative">
//                       <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                       <input
//                         type="date"
//                         name="checkOut"
//                         value={bookingData.checkOut}
//                         onChange={handleInputChange}
//                         min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
//                         className={`${inputClasses} pl-10`}
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="relative">
//                     <label className={labelClasses}>Adults *</label>
//                     <select
//                       name="adults"
//                       value={bookingData.adults}
//                       onChange={handleInputChange}
//                       className={inputClasses}
//                     >
//                       {[1, 2, 3, 4].map(num => (
//                         <option key={num} value={num}>{num} Adult{num > 1 ? 's' : ''}</option>
//                       ))}
//                     </select>
//                   </div>

//                   <div className="relative">
//                     <label className={labelClasses}>Children</label>
//                     <select
//                       name="children"
//                       value={bookingData.children}
//                       onChange={handleInputChange}
//                       className={inputClasses}
//                     >
//                       {[0, 1, 2, 3, 4].map(num => (
//                         <option key={num} value={num}>{num} Child{num !== 1 ? 'ren' : ''}</option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 <div className="mt-8 flex justify-end">
//                   <button
//                     onClick={handleNextStep}
//                     className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-medium"
//                   >
//                     Continue to Guest Info
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Step 2: Guest Information */}
//             {step === 2 && (
//               <div className="bg-white rounded-lg border border-gray-200 p-6">
//                 <h2 className="text-lg font-semibold mb-6 text-gray-800">Guest Information</h2>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                   <div className="relative">
//                     <label className={labelClasses}>First Name *</label>
//                     <input
//                       type="text"
//                       name="firstName"
//                       value={bookingData.guestInfo.firstName}
//                       onChange={handleInputChange}
//                       className={inputClasses}
//                       required
//                     />
//                   </div>

//                   <div className="relative">
//                     <label className={labelClasses}>Last Name *</label>
//                     <input
//                       type="text"
//                       name="lastName"
//                       value={bookingData.guestInfo.lastName}
//                       onChange={handleInputChange}
//                       className={inputClasses}
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                   <div className="relative">
//                     <label className={labelClasses}>Email Address *</label>
//                     <input
//                       type="email"
//                       name="email"
//                       value={bookingData.guestInfo.email}
//                       onChange={handleInputChange}
//                       className={inputClasses}
//                       required
//                     />
//                   </div>

//                   <div className="relative">
//                     <label className={labelClasses}>Phone Number *</label>
//                     <input
//                       type="tel"
//                       name="phone"
//                       value={bookingData.guestInfo.phone}
//                       onChange={handleInputChange}
//                       className={inputClasses}
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div className="relative mb-6">
//                   <label className={labelClasses}>Special Requests</label>
//                   <textarea
//                     name="specialRequests"
//                     value={bookingData.guestInfo.specialRequests}
//                     onChange={handleInputChange}
//                     rows={3}
//                     className={`${inputClasses} resize-none`}
//                     placeholder="Any special requests or requirements..."
//                   />
//                 </div>

//                 <div className="mt-8 flex justify-between">
//                   <button
//                     onClick={handlePreviousStep}
//                     className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition text-sm font-medium"
//                   >
//                     Back
//                   </button>
//                   <button
//                     onClick={handleNextStep}
//                     className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-medium"
//                   >
//                     Continue to Payment
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Step 3: Payment */}
//             {step === 3 && (
//               <div className="bg-white rounded-lg border border-gray-200 p-6">
//                 <h2 className="text-lg font-semibold mb-6 text-gray-800">Payment Method</h2>
                
//                 <div className="mb-6">
//                   <label className="block text-sm font-medium text-gray-700 mb-4">
//                     Select Payment Method
//                   </label>
//                   <div className="space-y-3">
//                     <label className="flex items-center p-4 border border-gray-300 rounded-md cursor-pointer hover:border-blue-500 transition">
//                       <input
//                         type="radio"
//                         name="paymentMethod"
//                         value="credit_card"
//                         checked={bookingData.paymentMethod === 'credit_card'}
//                         onChange={handleInputChange}
//                         className="text-blue-600 focus:ring-blue-500"
//                       />
//                       <FiCreditCard className="mx-4 text-gray-600" />
//                       <span className="text-sm">Credit Card</span>
//                     </label>

//                     <label className="flex items-center p-4 border border-gray-300 rounded-md cursor-pointer hover:border-blue-500 transition">
//                       <input
//                         type="radio"
//                         name="paymentMethod"
//                         value="paypal"
//                         checked={bookingData.paymentMethod === 'paypal'}
//                         onChange={handleInputChange}
//                         className="text-blue-600 focus:ring-blue-500"
//                       />
//                       <div className="mx-4 w-6 h-6 bg-blue-500 rounded"></div>
//                       <span className="text-sm">PayPal</span>
//                     </label>

//                     <label className="flex items-center p-4 border border-gray-300 rounded-md cursor-pointer hover:border-blue-500 transition">
//                       <input
//                         type="radio"
//                         name="paymentMethod"
//                         value="cash"
//                         checked={bookingData.paymentMethod === 'cash'}
//                         onChange={handleInputChange}
//                         className="text-blue-600 focus:ring-blue-500"
//                       />
//                       <div className="mx-4 w-6 h-6 bg-green-500 rounded"></div>
//                       <span className="text-sm">Pay at Hotel</span>
//                     </label>
//                   </div>
//                 </div>

//                 {bookingData.paymentMethod === 'credit_card' && (
//                   <div className="bg-gray-50 p-4 rounded-md mb-6">
//                     <h3 className="text-sm font-medium mb-4 text-gray-800">Credit Card Details</h3>
//                     <div className="grid grid-cols-2 gap-3 mb-3">
//                       <div>
//                         <label className="block text-xs text-gray-600 mb-2">Card Number</label>
//                         <input
//                           type="text"
//                           placeholder="1234 5678 9012 3456"
//                           className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-xs text-gray-600 mb-2">CVV</label>
//                         <input
//                           type="text"
//                           placeholder="123"
//                           className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                     </div>
//                     <div className="grid grid-cols-2 gap-3">
//                       <div>
//                         <label className="block text-xs text-gray-600 mb-2">Expiry Date</label>
//                         <input
//                           type="text"
//                           placeholder="MM/YY"
//                           className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-xs text-gray-600 mb-2">Card Holder</label>
//                         <input
//                           type="text"
//                           placeholder="John Doe"
//                           className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 <div className="mt-8 flex justify-between">
//                   <button
//                     onClick={handlePreviousStep}
//                     className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition text-sm font-medium"
//                   >
//                     Back
//                   </button>
//                   <button
//                     onClick={handleBooking}
//                     disabled={loading}
//                     className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition text-sm font-medium"
//                   >
//                     {loading ? 'Processing...' : 'Confirm Booking'}
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Right Column - Booking Summary */}
//           <div className="lg:col-span-1">
//             <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
//               <h2 className="text-lg font-semibold mb-6 text-gray-800">Booking Summary</h2>
              
//               {/* Room Details */}
//               <div className="mb-6">
//                 <div className="relative h-40 rounded-md overflow-hidden mb-4">
//                   <img
//                     src={bookingData.room.type?.image_url || bookingData.room.image_url || 'https://picsum.photos/800/600?hotel'}
//                     alt={bookingData.room.type?.name || bookingData.room.name}
//                     className="w-full h-full object-cover"
//                     onError={(e) => {
//                       e.target.src = 'https://picsum.photos/800/600?hotel';
//                     }}
//                   />
//                 </div>
//                 <h3 className="text-base font-semibold mb-2 text-gray-800">
//                   {bookingData.room.type?.name || bookingData.room.name}
//                 </h3>
//                 <p className="text-sm text-gray-600 mb-2">
//                   Room {bookingData.room.room_number || bookingData.room.number}
//                 </p>
//                 <div className="flex items-center mb-3">
//                   <FiStar className="text-yellow-400 mr-1" size={14} />
//                   <span className="text-xs text-gray-600">4.8 (120 reviews)</span>
//                 </div>
                
//                 {/* Amenities */}
//                 <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
//                   <div className="flex items-center">
//                     <FiWifi className="mr-2" size={12} />
//                     Free WiFi
//                   </div>
//                   <div className="flex items-center">
//                     <FiCoffee className="mr-2" size={12} />
//                     Breakfast
//                   </div>
//                   <div className="flex items-center">
//                     <FiTv className="mr-2" size={12} />
//                     TV
//                   </div>
//                   <div className="flex items-center">
//                     <FiWind className="mr-2" size={12} />
//                     AC
//                   </div>
//                 </div>
//               </div>

//               {/* Price Breakdown */}
//               <div className="border-t border-gray-200 pt-6">
//                 <h3 className="text-sm font-semibold mb-4 text-gray-800">Price Details</h3>
//                 <div className="space-y-2 text-xs">
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">${total.roomPrice} × {total.nights} nights</span>
//                     <span className="font-medium">${total.subtotal.toFixed(2)}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Tax (12%)</span>
//                     <span className="font-medium">${total.tax.toFixed(2)}</span>
//                   </div>
//                   <div className="flex justify-between text-green-600">
//                     <span>Discount</span>
//                     <span>-$0.00</span>
//                   </div>
//                   <div className="border-t border-gray-200 pt-2 mt-2">
//                     <div className="flex justify-between font-semibold text-sm">
//                       <span className="text-gray-800">Total</span>
//                       <span className="text-blue-600">${total.total.toFixed(2)}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Dates Info */}
//               <div className="border-t border-gray-200 pt-6 mt-6">
//                 <h3 className="text-sm font-semibold mb-4 text-gray-800">Stay Details</h3>
//                 <div className="space-y-2 text-xs">
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Check-in</span>
//                     <span className="font-medium">
//                       {bookingData.checkIn ? new Date(bookingData.checkIn).toLocaleDateString() : '-'}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Check-out</span>
//                     <span className="font-medium">
//                       {bookingData.checkOut ? new Date(bookingData.checkOut).toLocaleDateString() : '-'}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Guests</span>
//                     <span className="font-medium">
//                       {bookingData.adults} adult{bookingData.adults !== 1 ? 's' : ''}
//                       {bookingData.children > 0 && `, ${bookingData.children} child${bookingData.children !== 1 ? 'ren' : ''}`}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Policies */}
//               <div className="border-t border-gray-200 pt-6 mt-6">
//                 <h3 className="text-sm font-semibold mb-4 text-gray-800">Policies</h3>
//                 <div className="text-xs text-gray-600 space-y-1">
//                   <p>• Free cancellation up to 24 hours before check-in</p>
//                   <p>• No smoking allowed</p>
//                   <p>• Before 12:00 PM check-in, 12:00 PM check-out</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BookingPage;