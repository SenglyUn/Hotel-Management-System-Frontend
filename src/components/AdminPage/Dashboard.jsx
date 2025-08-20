import React, { useState } from "react";
import Overview from "./Overview";
import BookingByPlatform from "../Booking/BookingByPlatform";
import RoomAvailability from "../Room/RoomAvailability";
import TaskList from "../AdminPage/TaskList";
import BookingList from "../Booking/BookingList";
import RecentActivities from "../AdminPage/RecentActivities";

const Dashboard = () => {
  const [activeView, setActiveView] = useState("overview");

  // View configuration with colors
  const viewConfig = {
    overview: { 
      name: "Overview", 
      bgColor: "bg-white",
      textColor: "text-gray-800",
      activeBg: "bg-indigo-50",
      activeText: "text-indigo-700"
    },
    bookings: { 
      name: "Bookings", 
      bgColor: "bg-white",
      textColor: "text-gray-800",
      activeBg: "bg-emerald-50",
      activeText: "text-emerald-700"
    },
    rooms: { 
      name: "Rooms", 
      bgColor: "bg-white",
      textColor: "text-gray-800",
      activeBg: "bg-amber-50",
      activeText: "text-amber-700"
    },
    tasks: { 
      name: "Tasks", 
      bgColor: "bg-white",
      textColor: "text-gray-800",
      activeBg: "bg-rose-50",
      activeText: "text-rose-700"
    }
  };

  // Render different views based on selection
  const renderView = () => {
    switch(activeView) {
      case "bookings":
        return (
          <div className="bg-white rounded-xl shadow-xs p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Recent Bookings</h2>
              <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                View all bookings
              </button>
            </div>
            <BookingList />
          </div>
        );
      case "rooms":
        return (
          <div className="bg-white rounded-xl shadow-xs p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Room Status</h2>
              <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                View all
              </button>
            </div>
            <RoomAvailability />
          </div>
        );
      case "tasks":
        return (
          <div className="bg-white rounded-xl shadow-xs p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
              <span className="bg-rose-100 text-rose-800 text-xs px-2 py-1 rounded-full font-medium">
                3 pending
              </span>
            </div>
            <TaskList />
          </div>
        );
      default:
        return (
          <>
            {/* Stats Overview - Full Width */}
            <div className="mb-6">
              <Overview />
            </div>

            {/* Middle Section */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6">
              <div className="xl:col-span-7">
                <div className="bg-white rounded-xl shadow-xs p-6 h-full border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Booking Sources</h2>
                    <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                      View report
                    </button>
                  </div>
                  <BookingByPlatform />
                </div>
              </div>
              
              <div className="xl:col-span-5">
                <div className="bg-white rounded-xl shadow-xs p-6 h-full border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Room Status</h2>
                    <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                      View all
                    </button>
                  </div>
                  <RoomAvailability />
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-8">
                <div className="bg-white rounded-xl shadow-xs p-6 border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Recent Bookings</h2>
                    <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                      View all bookings
                    </button>
                  </div>
                  <BookingList />
                </div>
              </div>
              
              <div className="xl:col-span-4">
                <div className="bg-white rounded-xl shadow-xs p-6 border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
                    <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                      See all
                    </button>
                  </div>
                  <RecentActivities />
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
        
        {/* View Toggle */}
        <div className="flex mt-6 bg-white rounded-lg p-1 w-max shadow-xs border border-gray-200">
          {Object.entries(viewConfig).map(([viewKey, config]) => (
            <button
              key={viewKey}
              onClick={() => setActiveView(viewKey)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeView === viewKey
                  ? `${config.activeBg} ${config.activeText} font-semibold`
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {config.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {renderView()}
      </div>
    </div>
  );
};

export default Dashboard;