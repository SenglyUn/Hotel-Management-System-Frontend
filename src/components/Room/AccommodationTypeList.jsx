// import { useState, useEffect } from "react";
// import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";
// import axios from "axios";

// const ACCOMMODATION_API = "http://localhost:5001/api/accommodation-types";

// const AccommodationTypeList = () => {
//   const [accommodationTypes, setAccommodationTypes] = useState([]);
//   const [search, setSearch] = useState("");
//   const [newAccommodationType, setNewAccommodationType] = useState({
//     name: "", // Updated to match backend
//     description: "",
//   });
//   const [editing, setEditing] = useState(false);
//   const [selectedAccommodationType, setSelectedAccommodationType] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const rowsPerPage = 5;

//   useEffect(() => {
//     axios
//       .get(ACCOMMODATION_API)
//       .then((response) => setAccommodationTypes(response.data))
//       .catch((error) => console.error("Error fetching accommodation types:", error));
//   }, []);

//   const handleInputChange = (e) => {
//     setNewAccommodationType({ ...newAccommodationType, [e.target.name]: e.target.value });
//   };

//   const addAccommodationType = () => {
//     axios
//       .post(ACCOMMODATION_API, newAccommodationType)
//       .then((response) => {
//         setAccommodationTypes([...accommodationTypes, { ...newAccommodationType, id: response.data.id }]);
//         setNewAccommodationType({ name: "", description: "" });
//       })
//       .catch((error) => console.error("Error adding accommodation type:", error));
//   };

//   const editAccommodationType = (type) => {
//     setSelectedAccommodationType(type);
//     setNewAccommodationType({
//       name: type.name, // Updated to match backend
//       description: type.description,
//     });
//     setEditing(true);
//   };

//   const updateAccommodationType = () => {
//     axios
//       .put(`${ACCOMMODATION_API}/${selectedAccommodationType.id}`, newAccommodationType)
//       .then((response) => {
//         setAccommodationTypes(
//           accommodationTypes.map((type) =>
//             type.id === selectedAccommodationType.id ? { ...type, ...newAccommodationType } : type
//           )
//         );
//         setEditing(false);
//         setSelectedAccommodationType(null);
//         setNewAccommodationType({ name: "", description: "" });
//       })
//       .catch((error) => console.error("Error updating accommodation type:", error));
//   };

//   const deleteAccommodationType = (id) => {
//     const isConfirmed = window.confirm("Are you sure you want to delete this accommodation type?");
//     if (isConfirmed) {
//       axios
//         .delete(`${ACCOMMODATION_API}/${id}`)
//         .then(() => setAccommodationTypes(accommodationTypes.filter((type) => type.id !== id)))
//         .catch((error) => console.error("Error deleting accommodation type:", error));
//     }
//   };

//   const filteredAccommodationTypes = accommodationTypes.filter((type) =>
//     type.name.toLowerCase().includes(search.toLowerCase()) // Updated to match backend
//   );

//   const indexOfLastAccommodationType = currentPage * rowsPerPage;
//   const indexOfFirstAccommodationType = indexOfLastAccommodationType - rowsPerPage;
//   const currentAccommodationTypes = filteredAccommodationTypes.slice(indexOfFirstAccommodationType, indexOfLastAccommodationType);

//   const pageNumbers = [];
//   for (let i = 1; i <= Math.ceil(filteredAccommodationTypes.length / rowsPerPage); i++) {
//     pageNumbers.push(i);
//   }

//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   const handlePrevPage = () => {
//     if (currentPage > 1) setCurrentPage(currentPage - 1);
//   };

//   const handleNextPage = () => {
//     if (currentPage < pageNumbers.length) setCurrentPage(currentPage + 1);
//   };

//   return (
//     <div className="flex space-x-4 p-4">
//       <div className="w-2/3 bg-white rounded-lg shadow-md p-4">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-lg font-semibold text-blue-600">Accommodation Types</h2>
//           <div className="relative">
//             <FaSearch className="absolute left-2 top-3 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="pl-8 pr-4 py-2 border rounded-md text-sm focus:ring focus:ring-blue-300"
//             />
//           </div>
//         </div>
//         <table className="w-full text-sm border-collapse">
//           <thead>
//             <tr className="bg-gray-100">
//               <th className="p-2 text-left">Accommodation Type</th>
//               <th className="p-2 text-left">Description</th>
//               <th className="p-2 text-left">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {currentAccommodationTypes.map((type) => (
//               <tr key={type.id} className="border-b hover:bg-gray-50 cursor-pointer">
//                 <td className="p-2">{type.name}</td> {/* Updated to match backend */}
//                 <td className="p-2">{type.description}</td>
//                 <td className="p-2 flex space-x-2">
//                   <button className="text-yellow-500 hover:text-yellow-700" onClick={() => editAccommodationType(type)}>
//                     <FaEdit />
//                   </button>
//                   <button className="text-red-500 hover:text-red-700" onClick={() => deleteAccommodationType(type.id)}>
//                     <FaTrash />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         <div className="flex justify-between items-center mt-4">
//           <button
//             onClick={handlePrevPage}
//             disabled={currentPage === 1}
//             className={`px-2 py-1 bg-blue-500 text-white rounded-md ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''}`}
//           >
//             Prev
//           </button>
//           <div>
//             {pageNumbers.map((number) => (
//               <button
//                 key={number}
//                 onClick={() => handlePageChange(number)}
//                 className={`px-2 py-1 mx-1 rounded-md ${currentPage === number ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
//               >
//                 {number}
//               </button>
//             ))}
//           </div>
//           <button
//             onClick={handleNextPage}
//             disabled={currentPage === pageNumbers.length}
//             className={`px-2 py-1 bg-blue-500 text-white rounded-md ${currentPage === pageNumbers.length ? 'cursor-not-allowed opacity-50' : ''}`}
//           >
//             Next
//           </button>
//         </div>
//       </div>
//       <div className="w-1/3 bg-white rounded-lg shadow-md p-4">
//         <h2 className="text-lg font-semibold mb-4">{editing ? "Edit Accommodation Type" : "Add Accommodation Type"}</h2>
//         <input
//           type="text"
//           name="name" // Updated to match backend
//           placeholder="Accommodation Type Name"
//           value={newAccommodationType.name}
//           onChange={handleInputChange}
//           className="w-full p-2 border rounded-md text-sm mb-2"
//         />
//         <input
//           type="text"
//           name="description"
//           placeholder="Description"
//           value={newAccommodationType.description}
//           onChange={handleInputChange}
//           className="w-full p-2 border rounded-md text-sm mb-2"
//         />
//         <button
//           onClick={editing ? updateAccommodationType : addAccommodationType}
//           className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition w-full"
//         >
//           {editing ? "Update Accommodation Type" : "Add Accommodation Type"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AccommodationTypeList;