import React, { useRef } from 'react';
import { FiX, FiPrinter, FiDownload, FiSave } from 'react-icons/fi';
import { formatDate, calculateNights } from './utils';
import { statusColors } from './constants';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';

const PrintInvoice = ({ invoiceData, onClose }) => {
  const invoiceRef = useRef();

  // Handle regular printing
  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
    pageStyle: `
      @page { 
        size: A4; 
        margin: 10mm;
      }
      @media print {
        body { 
          -webkit-print-color-adjust: exact;
        }
        .no-print { 
          display: none; 
        }
      }
    `,
    onAfterPrint: () => console.log('Invoice printed successfully!')
  });

  // Save as PDF without file-saver
  const handleSavePDF = async () => {
    try {
      const element = invoiceRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Create download link without file-saver
      const link = document.createElement('a');
      link.download = `hotel_invoice_${invoiceData.id || Date.now()}.pdf`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Save as HTML file without file-saver
  const handleSaveHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoiceData.id || ''}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
  </style>
</head>
<body>
  ${invoiceRef.current.innerHTML}
</body>
</html>`;
    
    // Create download link without file-saver
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hotel_invoice_${invoiceData.id || Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Calculate invoice totals
  const calculateTotals = () => {
    const subtotal = parseFloat(invoiceData.total_price) || 0;
    const tax = parseFloat(invoiceData.tax) || 0;
    const discount = parseFloat(invoiceData.discount) || 0;
    const total = parseFloat(invoiceData.final_price) || subtotal + tax - discount;

    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      discount: discount.toFixed(2),
      total: total.toFixed(2),
    };
  };

  const totals = calculateTotals();
  
  // Calculate stay duration
  const duration = invoiceData.checkIn && invoiceData.checkOut 
    ? calculateNights(invoiceData.checkIn, invoiceData.checkOut)
    : invoiceData.duration || 'N/A';
  
  const nights = typeof duration === 'string' 
    ? parseInt(duration.match(/\d+/)?.[0] || 1) 
    : duration;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div ref={invoiceRef} className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          {/* Header with action buttons */}
          <div className="flex justify-between items-start mb-8 no-print">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Hotel Invoice</h1>
              <p className="text-gray-600">
                Invoice #{invoiceData.code || invoiceData.id || 'N/A'}
              </p>
              <p className="text-gray-600 text-sm">
                Date: {formatDate(invoiceData.invoice_date || invoiceData.createdAt || new Date())}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                title="Print Invoice"
              >
                <FiPrinter /> Print
              </button>
              <button
                onClick={handleSavePDF}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                title="Save as PDF"
              >
                <FiDownload /> PDF
              </button>
              <button
                onClick={handleSaveHTML}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                title="Save as HTML"
              >
                <FiSave /> HTML
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="Close"
              >
                <FiX size={24} />
              </button>
            </div>
          </div>

          {/* Rest of the invoice content remains the same as in previous examples */}
          {/* ... */}

        </div>
      </div>
    </div>
  );
};

export default PrintInvoice;