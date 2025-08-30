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
  FiEye,
  FiAlertCircle
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Users = () => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    username: "", 
    email: "", 
    firstName: "", 
    lastName: "", 
    roleId: 3,
    isActive: true,
    password: "" // Added password field for new users
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  // Create axios instance with auth header
  const createApiInstance = () => {
    const instance = axios.create({
      baseURL: API_BASE,
      withCredentials: true,
    });

    // Add auth token to requests
    const token = localStorage.getItem('token');
    if (token) {
      instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    return instance;
  };

  useEffect(() => {
    if (user) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const api = createApiInstance();
      const response = await api.get("/api/users");
      if (response.data && Array.isArray(response.data.users)) {
        setUsers(response.data.users);
      } else {
        setUsers(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error("Fetch users failed", err);
      if (err.response?.status === 401) {
        setError("Authentication required. Please log in.");
        logout();
      } else {
        setError("Failed to fetch users. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const api = createApiInstance();
      await api.delete(`/api/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
      setError(null);
      setSuccess("User deleted successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Delete failed", err);
      if (err.response?.status === 401) {
        setError("Authentication required. Please log in again.");
        logout();
      } else {
        setError("Failed to delete user. Please try again.");
      }
    }
  };

  const openModal = (user = null) => {
    setError(null);
    if (user) {
      setEditingId(user.id);
      setFormData({
        username: user.username || "",
        email: user.email || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        roleId: user.roleId || 3,
        isActive: user.isActive || true,
        password: "" // Don't include password when editing
      });
    } else {
      setEditingId(null);
      setFormData({ 
        username: "", 
        email: "", 
        firstName: "", 
        lastName: "", 
        roleId: 3,
        isActive: true,
        password: "" // Include password for new users
      });
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!formData.username || !formData.email) {
      setError("Username and email are required fields");
      return;
    }
    
    // For new users, password is required
    if (!editingId && !formData.password) {
      setError("Password is required for new users");
      return;
    }

    try {
      const api = createApiInstance();
      
      // Prepare data for API
      const submitData = { ...formData };
      
      // Don't send password field when editing (unless it's being changed)
      if (editingId && !submitData.password) {
        delete submitData.password;
      }
      
      if (editingId) {
        await api.put(`/api/users/${editingId}`, submitData);
        setSuccess("User updated successfully");
      } else {
        await api.post("/api/users", submitData);
        setSuccess("User created successfully");
      }
      
      fetchUsers();
      setIsModalOpen(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Submit failed", err);
      
      // Improved error handling
      if (err.response?.status === 400) {
        // Server validation error
        const errorMessage = err.response.data?.message || 
                            err.response.data?.error || 
                            "Invalid data. Please check your inputs.";
        setError(errorMessage);
      } else if (err.response?.status === 401) {
        setError("Authentication required. Please log in again.");
        logout();
      } else {
        setError(err.response?.data?.message || "An error occurred. Please try again.");
      }
    }
  };

  const getRoleName = (roleId) => {
    switch(roleId) {
      case 1: return "admin";
      case 2: return "staff";
      case 3: return "guest";
      default: return "guest";
    }
  };

  const handleRetry = () => {
    setError(null);
    fetchUsers();
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

  const sharedCheckbox = (label, name, checked) => (
    <div className="flex items-center mt-6">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={handleInputChange}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <label className="ml-2 block text-sm text-gray-900">
        {label}
      </label>
    </div>
  );

  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase();
    return (
      user.username?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.firstName?.toLowerCase().includes(search) ||
      user.lastName?.toLowerCase().includes(search)
    );
  });

  if (!user) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen font-sans text-[13px] text-gray-800 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center mb-4 text-red-600">
            <FiAlertCircle className="mr-2 text-xl" />
            <h2 className="text-xl font-semibold">Authentication Required</h2>
          </div>
          <p className="mb-4">You need to be logged in to access this page.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

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
          <button
            onClick={handleRetry}
            className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm"
          >
            Retry
          </button>
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

        {loading ? (
          <div className="p-6 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
            <p>Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm ? "No users match your search" : "No users found"}
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-6 gap-3 px-6 py-4 border-b items-center text-[13px] text-gray-800 hover:bg-gray-50"
            >
              <div className="font-medium">{user.username}</div>
              <div>{user.firstName} {user.lastName}</div>
              <div className="text-sm text-gray-600">{user.email}</div>
              <div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  getRoleName(user.roleId) === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : getRoleName(user.roleId) === 'staff'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {getRoleName(user.roleId)}
                </span>
              </div>
              <div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.isActive ? 'active' : 'inactive'}
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
                  onClick={() => deleteUser(user.id)}
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
              {sharedInput('First Name', 'firstName', formData.firstName, false)}
              {sharedInput('Last Name', 'lastName', formData.lastName, false)}
              
              {/* Password field only for new users */}
              {!editingId && sharedInput('Password', 'password', formData.password, true, 'password')}
              
              {sharedSelect('Role', 'roleId', formData.roleId, [
                { value: 1, label: 'Admin' },
                { value: 2, label: 'Staff' },
                { value: 3, label: 'Guest' }
              ], true)}
              {sharedCheckbox('Active', 'isActive', formData.isActive)}
              
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