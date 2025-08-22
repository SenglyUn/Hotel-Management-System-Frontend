import React, { useState, useEffect, useRef } from 'react';
import { FiArrowLeft, FiPrinter, FiDownload, FiMail, FiHome, FiPhone, FiCalendar, FiUser, FiDollarSign } from 'react-icons/fi';
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
      const imgWidth = 210;
      const pageHeight = 295;
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

      pdf.save(`invoice_${invoiceData?.invoice_number || Date.now()}.pdf`);
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
        if (!selectedReservation?.reservation_id) {
          throw new Error('No reservation selected');
        }

        setLoading(true);
        setError(null);
        
        // Updated API endpoint to match your backend
        const response = await axios.get(`http://localhost:3000/api/reservations/${selectedReservation.reservation_id}/invoice`, {
          timeout: 5000
        });

        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Invalid invoice data received');
        }

        const apiInvoiceData = response.data.data?.invoice || response.data.data;
        
        if (!apiInvoiceData) {
          throw new Error('No invoice data received from API');
        }

        // Transform API data to match component expectations
        const transformedData = {
          // Invoice metadata
          invoice_number: apiInvoiceData.invoice_number,
          issue_date: apiInvoiceData.issue_date,
          due_date: apiInvoiceData.due_date,
          status: apiInvoiceData.status,
          
          // Guest information
          guest_name: `${apiInvoiceData.guest?.first_name || ''} ${apiInvoiceData.guest?.last_name || ''}`.trim(),
          guest_email: apiInvoiceData.guest?.email,
          guest_id: apiInvoiceData.guest?.guest_id,
          
          // Reservation information
          reservation_id: apiInvoiceData.reservation?.reservation_id,
          checkIn: apiInvoiceData.reservation?.check_in,
          checkOut: apiInvoiceData.reservation?.check_out,
          
          // Financial information
          room_charges: apiInvoiceData.charges?.room_charges,
          additional_charges: apiInvoiceData.charges?.additional_charges,
          total_amount: apiInvoiceData.charges?.total,
          paid_amount: apiInvoiceData.charges?.paid,
          balance: apiInvoiceData.charges?.balance,
          
          // Room details from reservation
          roomDetails: [{
            name: apiInvoiceData.reservation?.room?.room_type?.name || 'Room',
            room_number: apiInvoiceData.reservation?.room?.room_number,
            price: apiInvoiceData.reservation?.room?.room_type?.base_price || apiInvoiceData.charges?.room_charges,
            total: apiInvoiceData.charges?.room_charges
          }],
          
          // Payment status
          payment_status: apiInvoiceData.status
        };

        setInvoiceData(transformedData);
      } catch (err) {
        console.error('Invoice fetch error:', err);
        setError(err.message);
        
        // Fallback to reservation data if API fails
        if (selectedReservation) {
          setInvoiceData({
            invoice_number: `INV-${selectedReservation.reservation_id}`,
            guest_name: `${selectedReservation.guest?.first_name} ${selectedReservation.guest?.last_name}`,
            guest_email: selectedReservation.guest?.email,
            guest_id: selectedReservation.guest?.guest_id,
            reservation_id: selectedReservation.reservation_id,
            checkIn: selectedReservation.check_in,
            checkOut: selectedReservation.check_out,
            roomDetails: [{
              name: selectedReservation.room?.room_type?.name || 'Room',
              room_number: selectedReservation.room?.room_number,
              price: selectedReservation.room?.room_type?.base_price || selectedReservation.total_amount,
              total: selectedReservation.total_amount
            }],
            room_charges: selectedReservation.total_amount,
            total_amount: selectedReservation.total_amount,
            paid_amount: selectedReservation.paid_amount,
            balance: selectedReservation.total_amount - selectedReservation.paid_amount,
            payment_status: selectedReservation.status,
            status: selectedReservation.status
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
      // Parse all values as numbers
      const roomCharges = parseFloat(invoiceData.room_charges || 0);
      const additionalCharges = parseFloat(invoiceData.additional_charges || 0);
      const paidAmount = parseFloat(invoiceData.paid_amount || 0);
      
      // Calculate all values
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

  if (loading && !invoiceData) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-800">
        <button
          onClick={handleBackToList}
          className="flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <FiArrowLeft /> Back to Reservation
        </button>
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
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
          className="flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <FiArrowLeft /> Back to Reservation
        </button>
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-red-500 mb-4">
            {error || 'No invoice data available'}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
          className="flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <FiArrowLeft /> Back to Reservation
        </button>
        
        {error && (
          <div className="mb-4 p-4 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200">
            Note: {error} - Showing fallback data
          </div>
        )}
      </div>
      
      <div ref={invoiceRef} className="bg-white rounded-xl shadow-sm overflow-hidden p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">GRAND HOTEL</h1>
            <div className="flex items-center text-gray-500 mt-1">
              <FiHome className="mr-2" />
              <span>123 Luxury Avenue, Prestige District</span>
            </div>
            <div className="flex items-center text-gray-500 mt-1">
              <FiPhone className="mr-2" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center text-gray-500 mt-1">
              <FiMail className="mr-2" />
              <span>reservations@grandhotel.com</span>
            </div>
          </div>
          
          <div className="text-right">
            <h2 className="text-2xl font-semibold text-gray-800">INVOICE</h2>
            <p className="text-gray-500 mt-1">
              # {invoiceData.invoice_number || 'N/A'}
            </p>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
              <FiUser className="mr-2" />
              Guest Information
            </h3>
            <p className="font-medium text-gray-900">{invoiceData.guest_name || 'N/A'}</p>
            <p className="text-gray-600">ID: {invoiceData.guest_id || 'N/A'}</p>
            <p className="text-gray-600">{invoiceData.guest_email || 'N/A'}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
              <FiCalendar className="mr-2" />
              Invoice Details
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-gray-600">Issued:</div>
              <div>{formatDate(invoiceData.issue_date || new Date())}</div>
              
              <div className="text-gray-600">Due Date:</div>
              <div>{formatDate(invoiceData.due_date || new Date())}</div>
              
              <div className="text-gray-600">Reservation:</div>
              <div>#{invoiceData.reservation_id || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Stay Details */}
        <div className="bg-gray-50 p-4 rounded-lg mb-8">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
            <FiCalendar className="mr-2" />
            Stay Details
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500">Check-In</div>
              <div className="font-medium">{formatDate(invoiceData.checkIn)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Check-Out</div>
              <div className="font-medium">{formatDate(invoiceData.checkOut)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Duration</div>
              <div className="font-medium">{duration}</div>
            </div>
          </div>
        </div>

        {/* Charges Table */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-700 mb-4">Charge Breakdown</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Description</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4">
                  <div className="font-medium">Room Charges</div>
                  <div className="text-sm text-gray-500">{nights} night{nights !== 1 ? 's' : ''}</div>
                </td>
                <td className="py-3 px-4 text-right">${invoiceTotals.room_charges}</td>
              </tr>
              {parseFloat(invoiceTotals.additional_charges) > 0 && (
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium">Additional Charges</td>
                  <td className="py-3 px-4 text-right">${invoiceTotals.additional_charges}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="ml-auto w-80 mb-8">
          <div className="space-y-3">
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
            <div className="flex justify-between pt-3 border-t border-gray-200 font-semibold text-lg">
              <span>Total Amount:</span>
              <span>${invoiceTotals.total}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Paid Amount:</span>
              <span>${invoiceTotals.paid}</span>
            </div>
            <div className={`flex justify-between pt-3 border-t border-gray-200 font-semibold text-lg ${
              parseFloat(invoiceTotals.balance) > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              <span>Balance:</span>
              <span>${invoiceTotals.balance}</span>
            </div>
          </div>
        </div>

        {/* Status & Footer */}
        <div className="grid grid-cols-2 gap-8 mt-8 pt-8 border-t border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Payment Status</h3>
            <div className="flex items-center">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                statusColors[invoiceData.payment_status] || statusColors.default
              }`}>
                {invoiceData.payment_status 
                  ? invoiceData.payment_status.charAt(0).toUpperCase() + 
                    invoiceData.payment_status.slice(1)
                  : 'Unknown'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <h3 className="font-semibold text-gray-700 mb-2">Thank You</h3>
            <p className="text-gray-600">We appreciate your business</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="no-print mt-8 pt-8 border-t border-gray-100">
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowPrintView(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiPrinter /> Print Invoice
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
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
    </div>
  );
};

export default ReservationInvoice;