import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiSearch,
  FiUserPlus,
  FiEdit2,
  FiTrash2,
  FiChevronUp,
  FiChevronDown,
  FiX,
  FiEye
} from "react-icons/fi";

const Guests = () => {
  const [guests, setGuests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", national_id: "", address: "" });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  const API_URL = "http://localhost:5001/api/guests";

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      const response = await axios.get(API_URL);
      setGuests(response.data.data || response.data);
      setError(null);
    } catch (err) {
      console.error("Fetch guests failed", err);
      setError("Failed to fetch guests. Please try again later.");
      alert("Failed to fetch guests. Please try again later.");
    }
  };

  const deleteGuest = async (id) => {
    if (!window.confirm("Are you sure you want to delete this guest?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setGuests((prev) => prev.filter((g) => (g._id || g.id) !== id));
      setError(null);
    } catch (err) {
      console.error("Delete failed", err);
      setError("Failed to delete guest. Please try again.");
      alert("Failed to delete guest. Please try again.");
    }
  };

  const openModal = (guest = null) => {
    setError(null);
    if (guest) {
      const { _id, id, name, email, phone, national_id, address } = guest;
      setEditingId(_id || id);
      setFormData({ name: name || "", email: email || "", phone: phone || "", national_id: national_id || "", address: address || "" });
    } else {
      setEditingId(null);
      setFormData({ name: "", email: "", phone: "", national_id: "", address: "" });
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Basic client-side validation
    if (!formData.name || !formData.email || !formData.phone) {
      setError("Name, email, and phone are required fields");
      alert("Name, email, and phone are required fields");
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData);
        alert("Guest updated successfully!");
      } else {
        await axios.post(API_URL, formData);
        alert("Guest created successfully!");
      }
      fetchGuests();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Submit failed", err);
      
      let errorMessage = "An error occurred. Please try again.";
      if (err.response) {
        // Handle different HTTP status codes
        switch (err.response.status) {
          case 400:
            errorMessage = "Validation error: " + 
              (err.response.data.message || "Please check your input");
            break;
          case 409:
            errorMessage = "Conflict: " + 
              (err.response.data.message || "This guest already exists");
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = err.response.data.message || errorMessage;
        }
      }
      
      setError(errorMessage);
      alert(errorMessage);
    }
  };

  const sharedInput = (label, name, value, required = false, placeholder = '') => (
    <div className="relative mt-6">
      <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs text-gray-600 peer-focus:text-blue-600 transition-all">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={handleInputChange}
        required={required}
        placeholder={placeholder || label}
        className="peer w-full h-[42px] px-3 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );

  const filteredGuests = guests.filter((g) => {
    const t = searchTerm.toLowerCase();
    return (
      g.name?.toLowerCase().includes(t) ||
      g.email?.toLowerCase().includes(t) ||
      g.phone?.includes(searchTerm) ||
      g.national_id?.includes(searchTerm)
    );
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-[13px] text-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Guest List</h1>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm"
              type="text"
              placeholder="Search guest name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => openModal()}
            className="h-10 flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-md text-sm"
          >
            <FiUserPlus className="text-base" /> Add Guest
          </button>
        </div>
      </div>

      {/* Error message display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="grid grid-cols-5 gap-3 px-6 py-3 border-b font-semibold bg-gray-50 text-gray-700 text-[13px]">
          {["Name", "Contact", "ID", "Address", "Action"].map((header) => (
            <div key={header} className="flex flex-col items-start gap-[1px]">
              <span className="flex items-center gap-0.5">
                {header}
                <span className="flex flex-col justify-center text-gray-400 text-[8px] mt-1">
                  <FiChevronUp className="w-2 h-2 mb-[1px]" />
                  <FiChevronDown className="w-2 h-2" />
                </span>
              </span>
            </div>
          ))}
        </div>

        {filteredGuests.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm ? "No guests match your search" : "No guests found"}
          </div>
        ) : (
          filteredGuests.map((g, i) => (
            <div
              key={g._id || g.id || i}
              className="grid grid-cols-5 gap-3 px-6 py-4 border-b items-center text-[13px] text-gray-800 hover:bg-gray-50"
            >
              <div>
                <div className="font-medium">{g.name}</div>
                <div className="text-[12px] text-gray-500">{g.email}</div>
              </div>
              <div className="text-sm text-gray-600">{g.phone}</div>
              <div className="text-sm text-gray-600">{g.national_id}</div>
              <div className="text-sm text-gray-600 truncate">{g.address}</div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md bg-white hover:bg-gray-100 transition">
                  <FiEye className="text-sm" />
                </button>
                <button
                  className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md bg-white hover:bg-gray-100 transition"
                  onClick={() => openModal(g)}
                >
                  <FiEdit2 className="text-sm" />
                </button>
                <button
                  onClick={() => deleteGuest(g._id || g.id)}
                  className="px-3 py-1 rounded-md text-sm font-medium bg-rose-100 text-rose-600 hover:bg-rose-200 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-3xl rounded-lg p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{editingId ? 'Edit Guest' : 'Add Guest'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 text-lg">×</button>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sharedInput('Name', 'name', formData.name, true)}
              {sharedInput('Email', 'email', formData.email, true)}
              {sharedInput('Phone', 'phone', formData.phone, true)}
              {sharedInput('National Id', 'national_id', formData.national_id, true)}
              <div className="md:col-span-2">
                {sharedInput('Address', 'address', formData.address, true)}
              </div>
              <div className="md:col-span-2 flex justify-end mt-4">
                <button
                  type="submit"
                  className="h-[42px] px-6 border border-blue-500 text-blue-600 font-semibold rounded-md text-sm hover:bg-blue-50 transition"
                >
                  {editingId ? 'Update Guest' : 'Create Guest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guests;