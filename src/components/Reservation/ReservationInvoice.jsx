import React, { useState, useEffect, useRef } from 'react';
import { FiArrowLeft, FiPrinter, FiDownload, FiMail, FiHome, FiPhone, FiCalendar, FiUser, FiDollarSign, FiCreditCard } from 'react-icons/fi';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ReservationInvoice = ({ selectedReservation, handleBackToList }) => {
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const invoiceRef = useRef();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Status colors for different payment states
  const statusColors = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    confirmed: 'bg-blue-100 text-blue-800',
    default: 'bg-gray-100 text-gray-800'
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate nights function
  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const oneDay = 24 * 60 * 60 * 1000;
    const firstDate = new Date(checkIn);
    const secondDate = new Date(checkOut);
    return Math.round(Math.abs((firstDate - secondDate) / oneDay));
  };

  // Print handler
  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
    pageStyle: `
      @page { size: A4; margin: 0; }
      @media print {
        body { -webkit-print-color-adjust: exact; margin: 0; padding: 0; }
        .no-print { display: none; }
        .print-layout { box-shadow: none; border: none; margin: 0; padding: 0; }
        .invoice-container { width: 100%; max-width: 100%; }
        * { -webkit-print-color-adjust: exact; }
      }
    `,
  });

  // PDF download handler - optimized for single page
  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const element = invoiceRef.current;
      
      // Set a fixed width for A4 paper (210mm in pixels at 96 DPI)
      const pdfWidth = 210;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: 794, // A4 width in pixels at 96 DPI
        windowWidth: 794,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Calculate image dimensions to fit the page
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Save the PDF
      pdf.save(`invoice_${invoiceData?.invoice_number || Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        if (!selectedReservation?.reservation_id) {
          throw new Error('No reservation selected');
        }

        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const reservation = selectedReservation;
        
        const transformedData = {
          invoice_number: `INV-${reservation.reservation_id}`,
          issue_date: new Date(),
          due_date: reservation.check_out,
          status: reservation.status,
          guest_name: `${reservation.guest?.first_name} ${reservation.guest?.last_name}`,
          guest_email: reservation.guest?.email,
          guest_id: reservation.guest?.guest_id,
          reservation_id: reservation.reservation_id,
          checkIn: reservation.check_in,
          checkOut: reservation.check_out,
          roomDetails: [{
            name: reservation.room?.room_type?.name || 'Room',
            room_number: reservation.room?.room_number,
            price: reservation.room?.room_type?.base_price || reservation.total_amount,
            total: reservation.total_amount
          }],
          room_charges: reservation.total_amount,
          additional_charges: 0,
          total_amount: reservation.total_amount,
          paid_amount: reservation.paid_amount,
          balance: reservation.total_amount - reservation.paid_amount,
          payment_status: reservation.status
        };

        setInvoiceData(transformedData);
      } catch (err) {
        console.error('Invoice processing error:', err);
        if (selectedReservation) {
          const reservation = selectedReservation;
          setInvoiceData({
            invoice_number: `INV-${reservation.reservation_id}`,
            guest_name: `${reservation.guest?.first_name} ${reservation.guest?.last_name}`,
            guest_email: reservation.guest?.email,
            guest_id: reservation.guest?.guest_id,
            reservation_id: reservation.reservation_id,
            checkIn: reservation.check_in,
            checkOut: reservation.check_out,
            roomDetails: [{
              name: reservation.room?.room_type?.name || 'Room',
              room_number: reservation.room?.room_number,
              price: reservation.room?.room_type?.base_price || reservation.total_amount,
              total: reservation.total_amount
            }],
            room_charges: reservation.total_amount,
            total_amount: reservation.total_amount,
            paid_amount: reservation.paid_amount,
            balance: reservation.total_amount - reservation.paid_amount,
            payment_status: reservation.status,
            status: reservation.status
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceData();
  }, [selectedReservation]);

  // Calculate duration in nights
  const getStayDuration = () => {
    if (invoiceData?.checkIn && invoiceData?.checkOut) {
      const nights = calculateNights(invoiceData.checkIn, invoiceData.checkOut);
      return `${nights} night${nights !== 1 ? 's' : ''}`;
    }
    return 'N/A';
  };

  const duration = getStayDuration();
  const nights = typeof duration === 'string' ? 
    parseInt(duration.match(/\d+/)?.[0] || 1) : 
    duration;

  // Calculate all invoice totals based on API data
  const calculateInvoiceTotals = () => {
    if (invoiceData) {
      const roomCharges = parseFloat(invoiceData.room_charges || 0);
      const additionalCharges = parseFloat(invoiceData.additional_charges || 0);
      const paidAmount = parseFloat(invoiceData.paid_amount || 0);
      
      const subtotal = roomCharges;
      const total = subtotal + additionalCharges;
      const balance = total - paidAmount;
      
      return {
        room_charges: roomCharges.toFixed(2),
        additional_charges: additionalCharges.toFixed(2),
        subtotal: subtotal.toFixed(2),
        total: total.toFixed(2),
        paid: paidAmount.toFixed(2),
        balance: balance.toFixed(2)
      };
    }

    return {
      room_charges: '0.00',
      additional_charges: '0.00',
      subtotal: '0.00',
      total: '0.00',
      paid: '0.00',
      balance: '0.00'
    };
  };

  const invoiceTotals = calculateInvoiceTotals();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-2 font-sans text-gray-800">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-1 mb-3 text-blue-600 hover:text-blue-800 transition-colors no-print text-sm"
          >
            <FiArrowLeft size={14} /> Back to Reservation
          </button>
          
          <div className="bg-white rounded shadow p-4 text-center">
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-gray-600 text-sm">Loading invoice data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-2 font-sans text-gray-800">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-1 mb-3 text-blue-600 hover:text-blue-800 transition-colors text-sm"
          >
            <FiArrowLeft size={14} /> Back to Reservation
          </button>
          <div className="bg-white rounded shadow p-4">
            <div className="text-red-500 mb-2 text-center py-4">
              <div className="text-3xl mb-2">😞</div>
              <h3 className="text-base font-semibold mb-1">Unable to load invoice</h3>
              <p className="text-gray-600 text-xs">Please try again later or contact support if the problem persists.</p>
            </div>
            <div className="flex justify-center mt-3">
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-2 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto">
        {/* Header with back button */}
        <div className="no-print">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-1 mb-3 text-blue-600 hover:text-blue-800 transition-colors text-sm"
          >
            <FiArrowLeft size={14} /> Back to Reservation
          </button>
        </div>
        
        {/* Invoice Card - optimized for full paper usage */}
        <div ref={invoiceRef} className="bg-white rounded shadow overflow-hidden print-layout invoice-container" style={{ width: '794px', maxWidth: '100%' }}>
          {/* Invoice Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-3">
            <div className="flex flex-col md:flex-row justify-between items-start">
              <div className="mb-2 md:mb-0">
                <h1 className="text-lg font-bold">MOON HOTEL</h1>
                <p className="text-blue-100 text-xs">Luxury Accommodations</p>
              </div>
              
              <div className="text-right">
                <h2 className="text-base font-semibold">INVOICE</h2>
                <p className="text-blue-100 text-xs">#{invoiceData.invoice_number}</p>
              </div>
            </div>
          </div>
          
          {/* Invoice Content */}
          <div className="p-3">
            {/* Details Grid - more compact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
              {/* Hotel Information */}
              <div className="bg-blue-50 p-2 rounded">
                <h3 className="font-semibold text-gray-700 mb-1 flex items-center text-xs">
                  <FiHome className="mr-1 text-blue-600" size={12} />
                  Hotel Information
                </h3>
                <p className="font-medium text-xs">MOON Hotel</p>
                <p className="text-gray-600 text-2xs mt-0.5">123 Phnom Penh, ABC District</p>
                <p className="text-gray-600 text-2xs flex items-center mt-0.5">
                  <FiPhone className="mr-1" size={10} /> +1 (855) 92474158
                </p>
                <p className="text-gray-600 text-2xs flex items-center mt-0.5">
                  <FiMail className="mr-1" size={10} /> reservations@moonhotel.com
                </p>
              </div>
              
              {/* Guest Information */}
              <div className="bg-gray-50 p-2 rounded">
                <h3 className="font-semibold text-gray-700 mb-1 flex items-center text-xs">
                  <FiUser className="mr-1 text-blue-600" size={12} />
                  Guest Information
                </h3>
                <p className="font-medium text-gray-900 text-xs">{invoiceData.guest_name}</p>
                <p className="text-gray-600 text-2xs mt-0.5">ID: {invoiceData.guest_id || 'N/A'}</p>
                <p className="text-gray-600 text-2xs">{invoiceData.guest_email || 'N/A'}</p>
              </div>
            </div>
            
            {/* Stay Details */}
            <div className="bg-gray-50 p-2 rounded mb-3">
              <h3 className="font-semibold text-gray-700 mb-1 flex items-center text-xs">
                <FiCalendar className="mr-1 text-blue-600" size={12} />
                Stay Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <div className="text-2xs text-gray-500">Check-In</div>
                  <div className="font-medium text-xs">{formatDate(invoiceData.checkIn)}</div>
                </div>
                <div>
                  <div className="text-2xs text-gray-500">Check-Out</div>
                  <div className="font-medium text-xs">{formatDate(invoiceData.checkOut)}</div>
                </div>
                <div>
                  <div className="text-2xs text-gray-500">Duration</div>
                  <div className="font-medium text-xs">{duration}</div>
                </div>
              </div>
            </div>
            
            {/* Combined Invoice and Payment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
              <div className="bg-gray-50 p-2 rounded">
                <h3 className="font-semibold text-gray-700 mb-1 flex items-center text-xs">
                  <FiCreditCard className="mr-1 text-blue-600" size={12} />
                  Invoice Details
                </h3>
                <div className="grid grid-cols-2 gap-1 text-2xs">
                  <div className="text-gray-600">Issued:</div>
                  <div>{formatDate(invoiceData.issue_date)}</div>
                  
                  <div className="text-gray-600">Due Date:</div>
                  <div>{formatDate(invoiceData.due_date)}</div>
                  
                  <div className="text-gray-600">Reservation:</div>
                  <div>#{invoiceData.reservation_id}</div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-2 rounded">
                <h3 className="font-semibold text-gray-700 mb-1 flex items-center text-xs">
                  <FiDollarSign className="mr-1 text-blue-600" size={12} />
                  Payment Status
                </h3>
                <div className="flex items-center mb-1">
                  <span className={`px-1.5 py-0.5 rounded-full text-2xs font-semibold ${statusColors[invoiceData.payment_status] || statusColors.default}`}>
                    {invoiceData.payment_status?.charAt(0).toUpperCase() + invoiceData.payment_status?.slice(1) || 'Unknown'}
                  </span>
                </div>
                <div className="text-2xs">
                  <div className="flex justify-between mb-0.5">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-medium">${invoiceTotals.total}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Paid Amount:</span>
                    <span>${invoiceTotals.paid}</span>
                  </div>
                  <div className={`flex justify-between mt-0.5 font-semibold ${parseFloat(invoiceTotals.balance) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    <span>Balance:</span>
                    <span>${invoiceTotals.balance}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Charges Table */}
            <div className="mb-3">
              <h3 className="font-semibold text-gray-700 mb-1 border-b pb-1 text-xs">Charge Breakdown</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-1 px-1 font-medium text-gray-600 text-2xs">Description</th>
                    <th className="text-right py-1 px-1 font-medium text-gray-600 text-2xs">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-1 px-1">
                      <div className="font-medium text-xs">Room Charges</div>
                      <div className="text-2xs text-gray-500">{nights} night{nights !== 1 ? 's' : ''} • Room {invoiceData.roomDetails[0]?.room_number}</div>
                    </td>
                    <td className="py-1 px-1 text-right text-xs">${invoiceTotals.room_charges}</td>
                  </tr>
                  {parseFloat(invoiceTotals.additional_charges) > 0 && (
                    <tr className="border-b border-gray-100">
                      <td className="py-1 px-1 font-medium text-xs">Additional Charges</td>
                      <td className="py-1 px-1 text-right text-xs">${invoiceTotals.additional_charges}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Totals */}
            <div className="ml-auto w-full md:w-56 mb-3">
              <div className="space-y-1 p-1.5 bg-gray-50 rounded text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>${invoiceTotals.subtotal}</span>
                </div>
                {parseFloat(invoiceTotals.additional_charges) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Additional Charges:</span>
                    <span>${invoiceTotals.additional_charges}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-gray-200 font-semibold">
                  <span>Total Amount:</span>
                  <span>${invoiceTotals.total}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Paid Amount:</span>
                  <span>${invoiceTotals.paid}</span>
                </div>
                <div className={`flex justify-between pt-1 border-t border-gray-200 font-semibold ${parseFloat(invoiceTotals.balance) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  <span>Balance:</span>
                  <span>${invoiceTotals.balance}</span>
                </div>
              </div>
            </div>
            
            {/* Thank You Message */}
            <div className="text-center py-2 border-t border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-0.5 text-xs">Thank You For Your Stay</h3>
              <p className="text-gray-600 text-2xs">We hope to see you again soon at MOON Hotel</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="no-print border-t border-gray-200 p-3 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-1.5 justify-center">
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
              >
                <FiPrinter size={12} /> Print Invoice
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="flex items-center justify-center gap-1 px-2 py-1 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 text-xs"
              >
                {isGeneratingPDF ? 'Generating...' : (<><FiDownload size={12} /> Save as PDF</>)}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          body, html {
            margin: 0;
            padding: 0;
            width: 100%;
          }
          .invoice-container {
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none;
            border: none;
          }
        }
      `}</style>
    </div>
  );
};

export default ReservationInvoice;