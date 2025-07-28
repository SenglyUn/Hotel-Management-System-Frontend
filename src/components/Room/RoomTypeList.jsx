// import React, { useState, useEffect } from "react";

// const RoomTypesList = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [editingIndex, setEditingIndex] = useState(null);
//   const [roomTypes, setRoomTypes] = useState([]);
//   const [newRoomType, setNewRoomType] = useState(defaultRoomType());

//   function defaultRoomType() {
//     return {
//       name: "",
//       size: "",
//       bed: "",
//       capacity: 1,
//       floor: 1,
//       description: "",
//       price: "",
//       image: null,
//       rooms: [{ room_number: "", status: "available", image: null }],
//     };
//   }

//   useEffect(() => {
//     fetchRoomTypes();
//   }, []);

//   const fetchRoomTypes = async () => {
//     try {
//       const response = await fetch("http://localhost:5001/api/room-types");
//       const result = await response.json();
//       if (!response.ok) throw new Error(result.message || "Fetch failed");

//       const formatted = result.data.map((item) => ({
//         id: item.id,
//         name: item.name,
//         size: item.size,
//         bed: item.bed,
//         guests: `${item.capacity} guest${item.capacity > 1 ? "s" : ""}`,
//         price: `$${parseFloat(item.price).toFixed(2)}/night`,
//         description: item.description,
//         availability: `${item.rooms.filter((r) => r.status === "available").length}/${item.rooms.length} Rooms`,
//         status: "Available",
//         mainImage: `http://localhost:5001/uploads/${item.image}`, // Main image for room type
//         images: item.rooms.map((r) => `http://localhost:5001/uploads/${r.image || "placeholder.jpg"}`), // Room images
//         rawRooms: item.rooms,
//       }));

//       setRoomTypes(formatted);
//     } catch (err) {
//       alert("Failed to load rooms: " + err.message);
//     }
//   };

//   const handleChange = (e, field, index = null) => {
//     if (index !== null) {
//       const updatedRooms = [...newRoomType.rooms];
//       updatedRooms[index][field] = e.target.value;
//       setNewRoomType({ ...newRoomType, rooms: updatedRooms });
//     } else {
//       setNewRoomType({ ...newRoomType, [field]: e.target.value });
//     }
//   };

//   const handleFileChange = (e, field, index = null) => {
//     const file = e.target.files[0];
//     const imageURL = file ? URL.createObjectURL(file) : null;

//     if (index !== null) {
//       const updatedRooms = [...newRoomType.rooms];
//       updatedRooms[index][field] = imageURL;
//       setNewRoomType({ ...newRoomType, rooms: updatedRooms });
//     } else {
//       setNewRoomType({ ...newRoomType, [field]: imageURL });
//     }
//   };

//   const addRoomField = () => {
//     setNewRoomType({
//       ...newRoomType,
//       rooms: [...newRoomType.rooms, { room_number: "", status: "available", image: null }],
//     });
//   };

//   const removeRoomField = (index) => {
//     const updatedRooms = [...newRoomType.rooms];
//     updatedRooms.splice(index, 1);
//     setNewRoomType({ ...newRoomType, rooms: updatedRooms });
//   };

//   const handleSubmit = async () => {
//     try {
//       const availability = `${newRoomType.rooms.filter((r) => r.status === "available").length}/${newRoomType.rooms.length} Rooms`;
//       const guestsText = `${newRoomType.capacity} guest${newRoomType.capacity > 1 ? "s" : ""}`;

//       const payload = {
//         name: newRoomType.name,
//         size: newRoomType.size,
//         bed: newRoomType.bed,
//         capacity: newRoomType.capacity,
//         floor: newRoomType.floor,
//         price: newRoomType.price,
//         description: newRoomType.description,
//         availability,
//         guests: guestsText,
//         status: "Available",
//         rooms: newRoomType.rooms.map((r) => ({
//           room_number: r.room_number,
//           status: r.status,
//           image: r.image || "",
//         })),
//       };

//       if (isEditMode && editingIndex !== null) {
//         const updated = [...roomTypes];
//         updated[editingIndex] = {
//           ...payload,
//           price: `$${parseFloat(payload.price).toFixed(2)}/night`,
//           images: payload.rooms.map((r) => r.image || "https://via.placeholder.com/150"),
//         };
//         setRoomTypes(updated);
//       } else {
//         setRoomTypes([
//           ...roomTypes,
//           {
//             ...payload,
//             price: `$${parseFloat(payload.price).toFixed(2)}/night`,
//             images: payload.rooms.map((r) => r.image || "https://via.placeholder.com/150"),
//           },
//         ]);
//       }

//       setIsModalOpen(false);
//       setIsEditMode(false);
//       setNewRoomType(defaultRoomType());
//     } catch (err) {
//       alert("Error: " + err.message);
//     }
//   };

//   const handleEdit = (index) => {
//     const room = roomTypes[index];
//     setNewRoomType({
//       name: room.name,
//       size: room.size,
//       bed: room.bed,
//       capacity: parseInt(room.guests),
//       floor: 1,
//       description: room.description,
//       price: room.price.replace(/[^0-9.]/g, ""),
//       image: room.mainImage,
//       rooms: room.rawRooms.map((r) => ({
//         room_number: r.room_number || "",
//         status: r.status || "available",
//         image: r.image ? `http://localhost:5001/uploads/${r.image}` : null,
//       })),
//     });
//     setEditingIndex(index);
//     setIsEditMode(true);
//     setIsModalOpen(true);
//   };

//   const handleDelete = (index) => {
//     if (window.confirm("Are you sure you want to delete this room type?")) {
//       const updated = [...roomTypes];
//       updated.splice(index, 1);
//       setRoomTypes(updated);
//     }
//   };

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-gray-800">Rooms</h1>
//         <div className="flex gap-2">
//           <input
//             type="text"
//             placeholder="Search Rooms Types etc"
//             className="px-3 py-2 border rounded-md"
//           />
//           <select className="px-3 py-2 border rounded-md">
//             <option>Popular</option>
//           </select>
//           <select className="px-3 py-2 border rounded-md">
//             <option>All Type</option>
//           </select>
//           <button
//             onClick={() => {
//               setIsEditMode(false);
//               setNewRoomType(defaultRoomType());
//               setIsModalOpen(true);
//             }}
//             className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
//           >
//             + Add Room
//           </button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {roomTypes.map((room, index) => (
//           <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
//             {/* Display Main Image of the Room Type */}
//             <img
//               src={room.mainImage}
//               alt={`${room.name} Main`}
//               className="w-full h-48 object-cover"
//             />

//             <div className="p-4">
//               <div className="flex justify-between items-start">
//                 <h2 className="text-lg font-semibold text-gray-800">{room.name}</h2>
//                 <span
//                   className={`text-sm font-semibold ${
//                     room.status === "Available" ? "text-green-500" : "text-blue-500"
//                   }`}
//                 >
//                   {room.status}
//                 </span>
//               </div>
//               <div className="text-gray-600 text-sm flex gap-4 mt-1">
//                 <span>{room.size}</span>
//                 <span>{room.bed}</span>
//                 <span>{room.capacity} guest{room.capacity > 1 ? "s" : ""}</span>
//               </div>
//               <p className="text-gray-600 text-sm mt-2 line-clamp-2">{room.description}</p>
//               <div className="flex justify-between items-center mt-3">
//                 <span className="text-sm font-medium text-gray-700">Availability: {room.availability}</span>
//                 <span className="text-lg font-semibold text-gray-800">{room.price}</span>
//               </div>
//               {/* Display Room Images */}
//               <div className="grid grid-cols-3 gap-2 mt-4">
//                 {room.images.map((img, i) => (
//                   <img
//                     key={i}
//                     src={img}
//                     alt={`Image ${i + 1}`}
//                     className="w-full h-20 object-cover rounded-md border hover:scale-105 transition-transform duration-200"
//                   />
//                 ))}
//               </div>
//               <div className="flex justify-end gap-2 mt-4 text-sm">
//                 <button
//                   onClick={() => handleEdit(index)}
//                   className="text-blue-600 hover:underline"
//                 >
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => handleDelete(index)}
//                   className="text-red-600 hover:underline"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Modal Section remains unchanged from your code */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
//           <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//             <h2 className="text-xl font-bold mb-4">
//               {isEditMode ? "Edit Room Type" : "Add New Room Type"}
//             </h2>
//             {/* Form content stays the same */}
//             {/* Buttons */}
//             <div className="flex justify-end gap-2 mt-6">
//               <button
//                 className="bg-gray-300 px-4 py-2 rounded"
//                 onClick={() => setIsModalOpen(false)}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="bg-green-500 text-white px-4 py-2 rounded"
//                 onClick={handleSubmit}
//               >
//                 {isEditMode ? "Update" : "Save"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default RoomTypesList;
