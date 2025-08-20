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

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    username: "", 
    email: "", 
    first_name: "", 
    last_name: "", 
    role: "user",
    status: "active",
    phone: "", 
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const API_URL = "http://localhost:5000/api/users";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(API_URL);
      setUsers(response.data);
      setError(null);
    } catch (err) {
      console.error("Fetch users failed", err);
      setError("Failed to fetch users. Please try again later.");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setUsers(prev => prev.filter(u => u.user_id !== id));
      setError(null);
      setSuccess("User deleted successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Delete failed", err);
      setError("Failed to delete user. Please try again.");
    }
  };

  const openModal = (user = null) => {
    setError(null);
    if (user) {
      setEditingId(user.user_id);
      setFormData({
        username: user.username || "",
        email: user.email || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        role: user.role || "user",
        status: user.status || "active",
        phone: user.phone || "",
      });
    } else {
      setEditingId(null);
      setFormData({ 
        username: "", 
        email: "", 
        first_name: "", 
        last_name: "", 
        role: "user",
        status: "active",
        phone: "", 
      });
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.username || !formData.email) {
      setError("Username and email are required fields");
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData);
        setSuccess("User updated successfully");
      } else {
        await axios.post(API_URL, formData);
        setSuccess("User created successfully");
      }
      fetchUsers();
      setIsModalOpen(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Submit failed", err);
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    }
  };

  const sharedInput = (label, name, value, required = false, type = "text", placeholder = '') => (
    <div className="relative mt-6">
      <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs text-gray-600 peer-focus:text-blue-600 transition-all">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={handleInputChange}
        required={required}
        placeholder={placeholder || label}
        className="peer w-full h-[42px] px-3 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );

  const sharedSelect = (label, name, value, options, required = false) => (
    <div className="relative mt-6">
      <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs text-gray-600 peer-focus:text-blue-600 transition-all">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={handleInputChange}
        required={required}
        className="peer w-full h-[42px] px-3 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase();
    return (
      user.username?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.first_name?.toLowerCase().includes(search) ||
      user.last_name?.toLowerCase().includes(search) ||
      user.phone?.includes(searchTerm)
    );
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-[13px] text-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm"
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => openModal()}
            className="h-10 flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-md text-sm"
          >
            <FiUserPlus className="text-base" /> Add User
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="grid grid-cols-6 gap-3 px-6 py-3 border-b font-semibold bg-gray-50 text-gray-700 text-[13px]">
          {["Username", "Name", "Email", "Role", "Status", "Action"].map((header) => (
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

        {filteredUsers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm ? "No users match your search" : "No users found"}
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.user_id}
              className="grid grid-cols-6 gap-3 px-6 py-4 border-b items-center text-[13px] text-gray-800 hover:bg-gray-50"
            >
              <div className="font-medium">{user.username}</div>
              <div>{user.first_name} {user.last_name}</div>
              <div className="text-sm text-gray-600">{user.email}</div>
              <div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role}
                </span>
              </div>
              <div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md bg-white hover:bg-gray-100 transition">
                  <FiEye className="text-sm" />
                </button>
                <button
                  className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md bg-white hover:bg-gray-100 transition"
                  onClick={() => openModal(user)}
                >
                  <FiEdit2 className="text-sm" />
                </button>
                <button
                  onClick={() => deleteUser(user.user_id)}
                  className="px-3 py-1 rounded-md text-sm font-medium bg-rose-100 text-rose-600 hover:bg-rose-200 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-3xl rounded-lg p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{editingId ? 'Edit User' : 'Add User'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 text-lg">×</button>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sharedInput('Username', 'username', formData.username, true)}
              {sharedInput('Email', 'email', formData.email, true, 'email')}
              {sharedInput('First Name', 'first_name', formData.first_name, false)}
              {sharedInput('Last Name', 'last_name', formData.last_name, false)}
              {sharedInput('Phone', 'phone', formData.phone, false, 'tel')}
              {sharedSelect('Role', 'role', formData.role, [
                { value: 'user', label: 'User' },
                { value: 'admin', label: 'Admin' }
              ], true)}
              {sharedSelect('Status', 'status', formData.status, [
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ], true)}
              
              <div className="md:col-span-2 flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-[42px] px-6 border border-gray-300 text-gray-700 font-medium rounded-md text-sm hover:bg-gray-50 transition mr-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-[42px] px-6 border border-blue-500 bg-blue-500 text-white font-semibold rounded-md text-sm hover:bg-blue-600 transition"
                >
                  {editingId ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;