import { useState, useEffect } from "react";

const GuestList = () => {
  const [guests, setGuests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 3;

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/guests");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const result = await response.json();
        const guestData = result.data || [];
        setGuests(guestData);
      } catch (error) {
        console.error("Error fetching guest data:", error);
      }
    };

    fetchGuests();
  }, []);

  const totalPages = Math.ceil(guests.length / rowsPerPage);
  const indexOfLastGuest = currentPage * rowsPerPage;
  const indexOfFirstGuest = indexOfLastGuest - rowsPerPage;
  const currentGuests = guests.slice(indexOfFirstGuest, indexOfLastGuest);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mt-6 mb-30 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-sm text-blue-600">Guest List</h2>
        <button className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 transition">
          Add Guest
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b bg-blue-200 text-gray-600">
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Phone</th>
              <th className="p-2 text-left">NID</th>
              <th className="p-2 text-left">Address</th>
            </tr>
          </thead>
          <tbody>
            {currentGuests.map((guest, index) => (
              <tr key={guest.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{indexOfFirstGuest + index + 1}</td>
                <td className="p-2">{guest.name}</td>
                <td className="p-2">{guest.email}</td>
                <td className="p-2">{guest.phone}</td>
                <td className="p-2">{guest.national_id}</td>
                <td className="p-2">{guest.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-3">
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className={`px-3 py-1 text-xs rounded ${
            currentPage === 1
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Prev
        </button>
        <p className="text-gray-500 text-xs">
          Page {currentPage} of {totalPages}
        </p>
        <button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 text-xs rounded ${
            currentPage === totalPages
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default GuestList;
