import React, { useState } from "react";

const GuestBlacklist = () => {
  const [blacklist, setBlacklist] = useState([
    { id: 1, name: "Theresa Webb", email: "theresa@example.com", reason: "Harassment", notes: "Permanent ban" },
    { id: 2, name: "Jerome Bell", email: "jerome@example.com", reason: "Theft", notes: "Under investigation" },
  ]);

  const removeBlacklist = (id) => {
    setBlacklist(blacklist.filter((guest) => guest.id !== id));
  };

  return (
    <div className="table-container">
      <h2 className="font-semibold text-lg text-red-500">Guest Blacklist</h2>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b bg-gray-100 text-gray-600">
            <th className="p-1 text-left">Name</th>
            <th className="p-1 text-left">Email</th>
            <th className="p-1 text-left">Reason</th>
            <th className="p-1 text-left">Notes</th>
            <th className="p-1 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {blacklist.map((guest) => (
            <tr key={guest.id} className="border-b hover:bg-gray-50">
              <td className="p-1">{guest.name}</td>
              <td className="p-1">{guest.email}</td>
              <td className="p-1">{guest.reason}</td>
              <td className="p-1">{guest.notes}</td>
              <td className="p-1">
                <button onClick={() => removeBlacklist(guest.id)} className="text-red-500 text-xs">Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GuestBlacklist;
