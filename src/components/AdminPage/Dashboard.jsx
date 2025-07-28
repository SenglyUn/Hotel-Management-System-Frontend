import React from "react";
import Overview from "./Overview";
import BookingByPlatform from "../Booking/BookingByPlatform";
import RoomAvailability from "../Room/RoomAvailability";
import TaskList from "../AdminPage/TaskList";
import BookingList from "../Booking/BookingList";
import RecentActivities from "../AdminPage/RecentActivities";

const Dashboard = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      {/* Top Overview Cards */}
      <div className="flex flex-wrap justify-between gap-4">
        <Overview />
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4 bg-white p-6 rounded-lg shadow-md">
          <BookingByPlatform />
        </div>
        <div className="col-span-4 bg-white p-6 rounded-lg shadow-md">
          <RoomAvailability />
        </div>
        <div className="col-span-4 bg-white p-6 rounded-lg shadow-md">
          <TaskList />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 bg-white p-6 rounded-lg shadow-md">
          <BookingList />
        </div>
        <div className="col-span-4 bg-white p-6 rounded-lg shadow-md">
          <RecentActivities />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
