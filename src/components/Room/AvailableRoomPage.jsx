// import React, { useState } from "react";

// const AvailableRoomPage = () => {
//   const [rooms, setRooms] = useState([
//     { id: 1, roomNumber: "101", type: "Single Bed", price: "$50", status: "Available" },
//     { id: 2, roomNumber: "102", type: "Double Bed", price: "$80", status: "Available" },
//     { id: 3, roomNumber: "103", type: "Luxury King", price: "$150", status: "Occupied" },
//     { id: 4, roomNumber: "104", type: "Queen Bed", price: "$100", status: "Available" },
//   ]);
//   const [search, setSearch] = useState("");

//   const filteredRooms = rooms.filter((room) =>
//     room.roomNumber.includes(search) || room.type.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
//         <h2 className="text-lg font-semibold text-blue-500 mb-4">Available Rooms</h2>
//         <input
//           type="text"
//           placeholder="Search by Room Number or Type"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="w-full border rounded-md p-2 mb-4"
//         />
//         <table className="w-full text-sm border-collapse">
//           <thead>
//             <tr className="border-b bg-gray-100 text-gray-600">
//               <th className="p-2 text-left">Room Number</th>
//               <th className="p-2 text-left">Type</th>
//               <th className="p-2 text-left">Price</th>
//               <th className="p-2 text-left">Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredRooms.map((room) => (
//               <tr key={room.id} className="border-b hover:bg-gray-50">
//                 <td className="p-2">{room.roomNumber}</td>
//                 <td className="p-2 font-medium text-blue-500">{room.type}</td>
//                 <td className="p-2">{room.price}</td>
//                 <td className={`p-2 font-semibold ${room.status === "Available" ? "text-green-500" : "text-red-500"}`}>{room.status}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default AvailableRoomPage;