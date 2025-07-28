import React, { useState } from 'react';
import { FiSettings, FiUser, FiLock, FiBell, FiMail, FiCreditCard, FiGlobe } from 'react-icons/fi';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [formData, setFormData] = useState({
    name: 'Admin User',
    email: 'admin@hotel.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    notifications: true,
    newsletter: false,
    language: 'en',
    currency: 'USD'
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Settings updated:', formData);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light text-gray-800 tracking-tight flex items-center">
            <FiSettings className="mr-2" /> Settings
          </h1>
          <p className="text-gray-400 text-sm">Manage your account and system preferences</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-1/5 bg-white rounded-lg border border-gray-100 p-4 h-fit">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('account')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center ${activeTab === 'account' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <FiUser className="mr-2" /> Account
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center ${activeTab === 'security' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <FiLock className="mr-2" /> Security
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center ${activeTab === 'notifications' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <FiBell className="mr-2" /> Notifications
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center ${activeTab === 'billing' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <FiCreditCard className="mr-2" /> Billing
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center ${activeTab === 'preferences' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <FiGlobe className="mr-2" /> Preferences
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:w-4/5 bg-white rounded-lg border border-gray-100 p-6">
          {/* Account Settings */}
          {activeTab === 'account' && (
            <form onSubmit={handleSubmit}>
              <h2 className="text-lg font-medium text-gray-800 mb-6 flex items-center">
                <FiUser className="mr-2" /> Account Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm text-white transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <form onSubmit={handleSubmit}>
              <h2 className="text-lg font-medium text-gray-800 mb-6 flex items-center">
                <FiLock className="mr-2" /> Change Password
              </h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200 text-sm"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200 text-sm"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200 text-sm"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm text-white transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <form onSubmit={handleSubmit}>
              <h2 className="text-lg font-medium text-gray-800 mb-6 flex items-center">
                <FiBell className="mr-2" /> Notification Preferences
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">System Notifications</h3>
                    <p className="text-xs text-gray-400">Receive alerts for important system events</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="notifications"
                      checked={formData.notifications}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Email Newsletter</h3>
                    <p className="text-xs text-gray-400">Receive monthly updates and promotions</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="newsletter"
                      checked={formData.newsletter}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm text-white transition-colors"
                >
                  Save Preferences
                </button>
              </div>
            </form>
          )}

          {/* Billing Settings */}
          {activeTab === 'billing' && (
            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-6 flex items-center">
                <FiCreditCard className="mr-2" /> Billing Information
              </h2>
              
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Current Plan</h3>
                    <p className="text-xs text-gray-500">Premium Plan - $49/month</p>
                  </div>
                  <button className="text-xs bg-white border border-gray-200 px-3 py-1 rounded-md hover:bg-gray-50 transition-colors">
                    Change Plan
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Payment Methods</h3>
                <div className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                        <FiCreditCard className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Visa ending in 4242</p>
                        <p className="text-xs text-gray-400">Expires 04/2025</p>
                      </div>
                    </div>
                    <button className="text-xs text-blue-500 hover:text-blue-600">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Settings */}
          {activeTab === 'preferences' && (
            <form onSubmit={handleSubmit}>
              <h2 className="text-lg font-medium text-gray-800 mb-6 flex items-center">
                <FiGlobe className="mr-2" /> System Preferences
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Language</label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200 text-sm bg-white"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Currency</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200 text-sm bg-white"
                  >
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="GBP">British Pound (GBP)</option>
                    <option value="JPY">Japanese Yen (JPY)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm text-white transition-colors"
                >
                  Save Preferences
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;