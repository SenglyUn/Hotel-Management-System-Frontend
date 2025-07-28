import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import html2pdf from "html2pdf.js";

const InvoiceShow = () => {
    const { id } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const invoiceRef = useRef();

    useEffect(() => {
        axios
            .get(`http://localhost:5001/api/invoices/${id}`)
            .then((res) => {
                setInvoice(res.data.data);
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to load invoice.");
                setLoading(false);
            });
    }, [id]);

    const handleCopy = () => {
        const text = invoiceRef.current?.innerText;
        navigator.clipboard.writeText(text)
            .then(() => alert("Invoice copied to clipboard!"))
            .catch(() => alert("Failed to copy."));
    };

    const handleDownloadPDF = () => {
        const element = invoiceRef.current;
        html2pdf()
            .set({
                margin: 0.5,
                filename: `invoice_${invoice.id}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            })
            .from(element)
            .save();
    };

    if (loading) return <div className="text-center mt-20 text-gray-600">Loading invoice...</div>;
    if (error) return <div className="text-center mt-20 text-red-500">{error}</div>;

    return (
        <div className="max-w-3xl mx-auto p-6 mt-10">
            <div className="flex justify-end mb-4 gap-2">
                <button onClick={handleCopy} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Copy</button>
                <button onClick={handleDownloadPDF} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Download PDF</button>
            </div>

            <div ref={invoiceRef} className="bg-white shadow-lg rounded-md p-6 border border-gray-200">
                <h1 className="text-2xl font-bold mb-4">Invoice #{invoice.id}</h1>
                <div className="space-y-2">
                    <div className="flex justify-between"><strong>Invoice Date:</strong><span>{new Date(invoice.invoice_date).toLocaleDateString()}</span></div>
                    <div className="flex justify-between"><strong>Reservation ID:</strong><span>{invoice.reservation_id}</span></div>
                    <div className="flex justify-between"><strong>Guest ID:</strong><span>{invoice.guest_id}</span></div>
                    <div className="flex justify-between"><strong>Total Price:</strong><span>${invoice.total_price}</span></div>
                    <div className="flex justify-between"><strong>Tax:</strong><span>${invoice.tax}</span></div>
                    <div className="flex justify-between"><strong>Discount:</strong><span>${invoice.discount}</span></div>
                    <div className="flex justify-between">
                        <strong>Payment Status:</strong>
                        <span className={`px-2 py-1 rounded text-white text-sm ${
                            invoice.payment_status === 'paid' ? 'bg-green-500' :
                            invoice.payment_status === 'unpaid' ? 'bg-red-500' :
                            'bg-yellow-500'
                        }`}>
                            {invoice.payment_status}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceShow;
