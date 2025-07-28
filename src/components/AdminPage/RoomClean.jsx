import { useState } from "react";

const RoomClean = () => {
  const roomsData = [
    { room: "#B25", status: "Dirty", task: "Not Allocated", assignee: "Kristin Watson" },
    { room: "#H29", status: "Clean", task: "Allocated", assignee: "Cameron Will" },
    { room: "#B45", status: "Dirty", task: "Not Allocated", assignee: "None" },
    { room: "#B08", status: "Clean", task: "Allocated", assignee: "None" },
    { room: "#C12", status: "Dirty", task: "Not Allocated", assignee: "John Doe" },
    { room: "#D22", status: "Clean", task: "Allocated", assignee: "Sarah Lee" },
    { room: "#E31", status: "Dirty", task: "Not Allocated", assignee: "None" },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 3;
  const totalPages = Math.ceil(roomsData.length / rowsPerPage);

  const indexOfLastRoom = currentPage * rowsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - rowsPerPage;
  const currentRooms = roomsData.slice(indexOfFirstRoom, indexOfLastRoom);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="bg-white p-2 rounded-lg shadow mt-6 max-h-[180px] overflow-hidden">
      <h2 className="font-bold text-sm mb-1 text-blue-600">Room Clean</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b bg-blue-200 text-gray-700">
              <th className="p-1 text-left">Room</th>
              <th className="p-1 text-left">Status</th>
              <th className="p-1 text-left">Task</th>
              <th className="p-1 text-left">Assignee</th>
            </tr>
          </thead>
          <tbody>
            {currentRooms.map((room, index) => (
              <tr key={index} className="border-b hover:bg-gray-50 transition">
                <td className="p-1">{room.room}</td>
                <td className={`p-1 font-medium ${room.status === "Clean" ? "text-green-600" : "text-red-600"}`}>{room.status}</td>
                <td className="p-1">{room.task}</td>
                <td className="p-1">{room.assignee !== "None" ? room.assignee : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-1">
        <button 
          onClick={prevPage} 
          disabled={currentPage === 1}
          className={`px-2 py-1 text-xs rounded ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
        >
          Previous
        </button>
        <p className="text-gray-600 text-xs">
          Page {currentPage} of {totalPages}
        </p>
        <button 
          onClick={nextPage} 
          disabled={currentPage === totalPages}
          className={`px-2 py-1 text-xs rounded ${currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default RoomClean;
