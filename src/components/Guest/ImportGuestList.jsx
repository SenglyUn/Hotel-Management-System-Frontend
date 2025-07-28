import React, { useState } from "react";

const ImportGuestList = () => {
  const [status, setStatus] = useState("");
  const [guests, setGuests] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    // Mock guest list import (In a real scenario, parse CSV and add guests)
    if (file) {
      setGuests([
        ...guests,
        { id: guests.length + 1, name: "John Doe", email: "john@example.com", phone: "123-456-7890", status: "Active" },
      ]);
      setStatus("Import successful.");
    } else {
      setStatus("No file selected.");
    }
  };

  return (
    <div className="table-container">
      <h2 className="font-semibold text-lg text-blue-500">Import Guest List</h2>
      <input
        type="file"
        onChange={handleFileChange}
        className="border p-2"
      />
      {status && <p>{status}</p>}
      <h3 className="font-semibold text-lg mt-4">Imported Guests</h3>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b bg-gray-100 text-gray-600">
            <th className="p-1 text-left">Name</th>
            <th className="p-1 text-left">Email</th>
            <th className="p-1 text-left">Phone</th>
            <th className="p-1 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {guests.map((guest) => (
            <tr key={guest.id} className="border-b hover:bg-gray-50">
              <td className="p-1">{guest.name}</td>
              <td className="p-1">{guest.email}</td>
              <td className="p-1">{guest.phone}</td>
              <td className="p-1 text-green-500 font-semibold">{guest.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ImportGuestList;
