// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Add this import
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FiUser,
  FiMail,
  FiEdit2,
  FiSave,
  FiX,
  FiLock,
  FiCamera,
  FiCalendar,
  FiPhone,
  FiMapPin,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    avatar: '',
    dateOfBirth: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  // Create axios instance with proper authentication
  const createApiInstance = () => {
    const instance = axios.create({
      baseURL: API_BASE,
      withCredentials: true,
    });

    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    return instance;
  };

  // Fetch user profile data
  const fetchProfile = async () => {
    try {
      const api = createApiInstance();
      const response = await api.get("/api/profile/me");
      
      if (response.data) {
        const { user: userData, profile: profileData } = response.data;
        
        setProfileData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: profileData?.phone || '',
          address: profileData?.address || '',
          bio: profileData?.bio || '',
          avatar: profileData?.avatar || '',
          dateOfBirth: profileData?.dateOfBirth || ''
        });
      }
    } catch (err) {
      console.error("Fetch profile failed", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setMessage({ type: 'error', text: "Authentication failed. Please log in again." });
        setTimeout(() => {
          logout();
          window.location.href = '/login';
        }, 2000);
      } else {
        setMessage({ type: 'error', text: "Failed to load profile data." });
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const api = createApiInstance();
      const response = await api.put("/api/profile/me", profileData);
      
      if (response.data) {
        setMessage({ type: 'success', text: response.data.message || 'Profile updated successfully!' });
        setIsEditing(false);
        // Refresh profile data
        fetchProfile();
      }
    } catch (err) {
      console.error("Update profile failed", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setMessage({ type: 'error', text: "Authentication failed. Please log in again." });
        logout();
      } else {
        setMessage({ 
          type: 'error', 
          text: err.response?.data?.message || "Failed to update profile. Please try again." 
        });
      }
    }
    
    setLoading(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    try {
      const api = createApiInstance();
      const response = await api.put("/api/profile/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.data) {
        setMessage({ type: 'success', text: response.data.message || 'Password changed successfully!' });
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      console.error("Change password failed", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setMessage({ type: 'error', text: "Authentication failed. Please log in again." });
        logout();
      } else {
        setMessage({ 
          type: 'error', 
          text: err.response?.data?.message || "Failed to change password. Please try again." 
        });
      }
    }
    
    setLoading(false);
  };

  const handleAvatarChange = async (url) => {
    try {
      const api = createApiInstance();
      const response = await api.put("/api/profile/me", { avatar: url });
      
      if (response.data) {
        setProfileData(prev => ({
          ...prev,
          avatar: url
        }));
        setMessage({ type: 'success', text: 'Avatar updated successfully!' });
        document.getElementById('avatarModal').close();
      }
    } catch (err) {
      console.error("Update avatar failed", err);
      setMessage({ type: 'error', text: "Failed to update avatar. Please try again." });
    }
  };

  const suggestedAvatars = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
    'https://i.pravatar.cc/150?u=user@example.com',
    'https://api.dicebear.com/7.x/bottts/svg?seed=user'
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiUser className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please log in</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to view your profile</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <FiCheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <FiAlertCircle className="w-5 h-5 mr-2" />
              )}
              {message.text}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={profileData.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=3B82F6&color=fff`}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  {isEditing && (
                    <button
                      onClick={() => document.getElementById('avatarModal').showModal()}
                      className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition"
                    >
                      <FiCamera className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mt-4">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-gray-600 text-sm capitalize">{user.role}</p>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setIsChangingPassword(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    isEditing && !isChangingPassword
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FiUser className="inline mr-3 w-4 h-4" />
                  Personal Information
                </button>
                <button
                  onClick={() => {
                    setIsChangingPassword(true);
                    setIsEditing(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    isChangingPassword
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FiLock className="inline mr-3 w-4 h-4" />
                  Change Password
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Personal Information Form */}
            {isEditing && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleProfileSubmit}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                      {loading ? 'Saving...' : <FiSave className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        placeholder="+1 (555) 123-4567"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <FiMapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <textarea
                        name="address"
                        value={profileData.address}
                        onChange={handleProfileChange}
                        rows={3}
                        placeholder="Enter your full address"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <div className="relative">
                      <FiFileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <textarea
                        name="bio"
                        value={profileData.bio}
                        onChange={handleProfileChange}
                        rows={3}
                        placeholder="Tell us about yourself..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={profileData.dateOfBirth}
                        onChange={handleProfileChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Change Password Form */}
            {isChangingPassword && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setIsChangingPassword(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handlePasswordSubmit}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                      {loading ? 'Saving...' : <FiSave className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        minLength={8}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters long</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Profile Display (when not editing) */}
            {!isEditing && !isChangingPassword && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <FiEdit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">First Name</p>
                    <p className="font-medium text-gray-900">{profileData.firstName || 'Not set'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Last Name</p>
                    <p className="font-medium text-gray-900">{profileData.lastName || 'Not set'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{profileData.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{profileData.phone || 'Not set'}</p>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium text-gray-900">{profileData.address || 'Not set'}</p>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <p className="text-sm text-gray-50">Bio</p>
                    <p className="font-medium text-gray-900">{profileData.bio || 'Not set'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-medium text-gray-900">
                      {profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium text-gray-900 capitalize">{user.role}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Avatar Modal */}
      <dialog id="avatarModal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Choose Avatar</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {suggestedAvatars.map((avatar, index) => (
              <img
                key={index}
                src={avatar}
                alt={`Avatar ${index + 1}`}
                className="w-16 h-16 rounded-full cursor-pointer hover:scale-110 transition-transform"
                onClick={() => handleAvatarChange(avatar)}
              />
            ))}
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default Profile;