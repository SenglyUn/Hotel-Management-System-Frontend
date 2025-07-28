import React, { useState, useEffect, useRef } from 'react';
import { FiArrowLeft, FiPrinter, FiDownload } from 'react-icons/fi';
import { statusColors } from './constants';
import { formatDate, calculateNights } from './utils';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import PrintInvoice from './PrintInvoice';

const ReservationInvoice = ({
  selectedReservation,
  handleBackToList
}) => {
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPrintView, setShowPrintView] = useState(false);
  const invoiceRef = useRef();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Print handler
  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
    pageStyle: `
      @page { size: A4; margin: 10mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        .no-print { display: none; }
      }
    `,
  });

  // PDF download handler
  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const element = invoiceRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`invoice_${invoiceData?.id || Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        if (!selectedReservation?.id) {
          throw new Error('No reservation selected');
        }

        setLoading(true);
        setError(null);
        
        const response = await axios.get('http://localhost:5001/api/invoices', {
          params: { reservation_id: selectedReservation.id },
          timeout: 5000
        });

        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Invalid invoice data received');
        }

        // Find the most recent invoice for this reservation
        const invoices = response.data.data || [];
        const latestInvoice = invoices.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        )[0];

        if (!latestInvoice) {
          throw new Error('No invoice found for this reservation');
        }

        setInvoiceData({
          ...latestInvoice,
          // Merge with reservation data as fallback
          guest_name: latestInvoice.guest_name || selectedReservation.guestDetails?.name,
          guest_email: latestInvoice.guest_email || selectedReservation.guestDetails?.email,
          guest_id: latestInvoice.guest_id || selectedReservation.guestId,
          roomDetails: selectedReservation.roomDetails || [],
          checkIn: selectedReservation.checkIn,
          checkOut: selectedReservation.checkOut
        });
      } catch (err) {
        console.error('Invoice fetch error:', err);
        setError(err.message);
        // Fallback to reservation data if API fails
        if (selectedReservation) {
          setInvoiceData({
            ...selectedReservation,
            payment_status: selectedReservation.status,
            final_price: selectedReservation.totalAmount,
            total_price: selectedReservation.roomDetails?.reduce(
              (sum, room) => sum + (room.total || 0), 0
            ),
            tax: selectedReservation.tax,
            discount: selectedReservation.discount,
            guest_name: selectedReservation.guestDetails?.name,
            guest_email: selectedReservation.guestDetails?.email,
            guest_id: selectedReservation.guestId
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
      return calculateNights(invoiceData.checkIn, invoiceData.checkOut);
    }
    return selectedReservation?.duration || 'N/A';
  };

  const duration = getStayDuration();
  const nights = typeof duration === 'string' ? 
    parseInt(duration.match(/\d+/)?.[0] || 1) : 
    duration;

  // Calculate invoice totals
  const calculateInvoiceTotals = () => {
    // Use API data if available
    if (invoiceData?.final_price) {
      return {
        subtotal: parseFloat(invoiceData.total_price || 0).toFixed(2),
        tax: parseFloat(invoiceData.tax || 0).toFixed(2),
        discount: parseFloat(invoiceData.discount || 0).toFixed(2),
        total: parseFloat(invoiceData.final_price || 0).toFixed(2)
      };
    }

    // Fallback calculation
    const roomDetails = invoiceData?.roomDetails || selectedReservation?.roomDetails || [];
    const subtotal = roomDetails.reduce((sum, room) => sum + (room.total || 0), 0);
    const taxRate = 0.10; // Default tax rate if not provided
    const tax = invoiceData?.tax || subtotal * taxRate;
    const discount = invoiceData?.discount || 0;
    const total = subtotal + tax - discount;

    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      discount: discount.toFixed(2),
      total: total.toFixed(2)
    };
  };

  const invoice = calculateInvoiceTotals();

  if (loading && !invoiceData) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-800">
        <button
          onClick={handleBackToList}
          className="flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-800"
        >
          <FiArrowLeft /> Back to Reservation
        </button>
        <div className="bg-white shadow-md rounded-lg overflow-hidden p-8 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-800">
        <button
          onClick={handleBackToList}
          className="flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-800"
        >
          <FiArrowLeft /> Back to Reservation
        </button>
        <div className="bg-white shadow-md rounded-lg overflow-hidden p-8">
          <div className="text-red-500 mb-4">
            {error || 'No invoice data available'}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-800">
      {showPrintView && (
        <PrintInvoice 
          invoiceData={invoiceData} 
          onClose={() => setShowPrintView(false)}
          onPrint={handlePrint}
        />
      )}

      <div className="no-print">
        <button
          onClick={handleBackToList}
          className="flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-800"
        >
          <FiArrowLeft /> Back to Reservation
        </button>
        
        {error && (
          <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded-md">
            Note: {error} - Showing fallback data
          </div>
        )}
      </div>
      
      <div ref={invoiceRef} className="bg-white shadow-md rounded-lg overflow-hidden p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Hotel Invoice</h1>
            <p className="text-gray-600">
              Invoice #{invoiceData.code || invoiceData.id || 'N/A'}
            </p>
            <p className="text-gray-600 text-sm">
              Date: {formatDate(invoiceData.invoice_date || invoiceData.createdAt || new Date())}
            </p>
          </div>
          <div className="no-print">
            <div className="flex gap-2">
              <button
                onClick={() => setShowPrintView(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <FiPrinter /> Print Invoice
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
              >
                {isGeneratingPDF ? 'Generating...' : (
                  <>
                    <FiDownload /> Save as PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Hotel Information</h3>
            <p>Grand Hotel</p>
            <p>123 Main Street</p>
            <p>New York, NY 10001</p>
            <p>Phone: (123) 456-7890</p>
          </div>

          <div className="text-right">
            <h3 className="font-semibold text-gray-700 mb-2">Guest Information</h3>
            <p>{invoiceData.guest_name || 'N/A'}</p>
            <p>Guest ID: {invoiceData.guest_id || 'N/A'}</p>
            <p>Reservation: {invoiceData.reservation_id || 'N/A'}</p>
            <p>Email: {invoiceData.guest_email || 'N/A'}</p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-semibold text-gray-700 mb-2">Stay Details</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="font-medium">Check-In</p>
              <p>{formatDate(invoiceData.checkIn)}</p>
            </div>
            <div>
              <p className="font-medium">Check-Out</p>
              <p>{formatDate(invoiceData.checkOut)}</p>
            </div>
            <div>
              <p className="font-medium">Duration</p>
              <p>{duration}</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-semibold text-gray-700 mb-4">Room Charges</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left py-2 px-4 border">Room</th>
                <th className="text-right py-2 px-4 border">Rate</th>
                <th className="text-right py-2 px-4 border">Nights</th>
                <th className="text-right py-2 px-4 border">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(invoiceData.roomDetails || []).length > 0 ? (
                invoiceData.roomDetails.map((room, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4 border">{room.name || `Room ${index + 1}`}</td>
                    <td className="py-2 px-4 border text-right">${(room.price || 0).toFixed(2)}</td>
                    <td className="py-2 px-4 border text-right">{nights}</td>
                    <td className="py-2 px-4 border text-right">
                      ${((room.price || 0) * nights).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-2 px-4 border text-center text-gray-500">
                    No room information available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="ml-auto w-64">
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">Subtotal:</span>
            <span>${invoice.subtotal}</span>
          </div>
          {parseFloat(invoice.discount) > 0 && (
            <div className="flex justify-between py-2 border-b text-green-600">
              <span className="font-medium">Discount:</span>
              <span>-${invoice.discount}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">Tax:</span>
            <span>${invoice.tax}</span>
          </div>
          <div className="flex justify-between py-2 font-bold text-lg">
            <span>Total:</span>
            <span>${invoice.total}</span>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <h3 className="font-semibold text-gray-700 mb-2">Payment Information</h3>
          <p>Status: 
            <span className={`ml-2 px-2 py-1 rounded-md text-xs font-semibold ${
              statusColors[invoiceData.payment_status] || statusColors.default
            }`}>
              {invoiceData.payment_status 
                ? invoiceData.payment_status.charAt(0).toUpperCase() + 
                  invoiceData.payment_status.slice(1)
                : 'Unknown'}
            </span>
          </p>
          <p className="mt-2">
            Invoice Date: {formatDate(invoiceData.invoice_date || invoiceData.createdAt)}
          </p>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Thank you for choosing our hotel!</p>
          <p>For any inquiries, please contact us at info@grandhotel.com</p>
        </div>
      </div>
    </div>
  );
};

export default ReservationInvoice;