import React, { useEffect, useState } from 'react';

const ReceiptViewer = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReceipts = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/receipts');
      const data = await res.json();
      if (data.success) setReceipts(data.data);
    } catch (err) {
      console.error('Error fetching receipts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Receipt List</h1>
        {loading ? (
          <p>Loading...</p>
        ) : receipts.length === 0 ? (
          <p>No receipts available.</p>
        ) : (
          <table className="w-full table-auto border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left text-sm font-semibold">#</th>
                <th className="p-2 text-left text-sm font-semibold">Invoice ID</th>
                <th className="p-2 text-left text-sm font-semibold">Amount</th>
                <th className="p-2 text-left text-sm font-semibold">Method</th>
                <th className="p-2 text-left text-sm font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((receipt) => (
                <tr key={receipt.id} className="border-t">
                  <td className="p-2 text-sm">{receipt.id}</td>
                  <td className="p-2 text-sm">{receipt.invoice_id}</td>
                  <td className="p-2 text-sm">${parseFloat(receipt.amount_paid).toFixed(2)}</td>
                  <td className="p-2 text-sm">{receipt.payment_method}</td>
                  <td className="p-2 text-sm">{new Date(receipt.payment_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ReceiptViewer;
