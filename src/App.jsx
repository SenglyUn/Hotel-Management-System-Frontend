import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import MainLayout from './components/HomePage/MainLayout';
import LoginForm from './components/Authentication/LoginForm';
import RegisterForm from './components/Authentication/RegisterForm';
import Dashboard from './components/AdminPage/Dashboard';
import RoomList from './components/Room/RoomList';
import GuestList from './components/Guest/GuestList';
import GuestBlacklist from './components/Guest/GuestBlacklist';
import ImportGuestList from './components/Guest/ImportGuestList';
import RoomClean from './components/AdminPage/RoomClean';
import QuickAction from './components/AdminPage/QuickAction';
import LandingPage from './components/HomePage/LandingPage';
import AccommodationTypeList from './components/Room/AccommodationTypeList';
import CheckInCheckOutPage from './components/Checkin-Out/CheckInCheckOutPage';
import NotFoundPage from './components/HomePage/NotFoundPage';
import MessagePage from './components/Message/Message';
import RestaurantPage from './components/Restaurant/Restaurant';
import ParkingManagement from './components/Parking/ParkingManagement';
import SettingsPage from './components/Setting/SettingsPage';
import ReservationList from './components/Reservation/ReservationList';
import BookingPage from './components/HomePage/BookingPage';
import ExploreRooms from './components/HomePage/ExploreRooms';

// ✅ Import the new InvoiceShow page
import InvoiceShow from './components/Payment/InvoiceViewer';
import SignupForm from "./components/Authentication/SignupForm.jsx";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/book" element={<BookingPage />} />
        <Route path="/explore" element={<ExploreRooms />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />

        {/* Protected/Admin Routes */}
        <Route element={<MainLayout />}>
          <Route path="/home" element={<Dashboard />} />
          <Route path="/rooms" element={<RoomList />} />
          <Route path="/guests" element={<GuestList />} />
          <Route path="/guest-blacklist" element={<GuestBlacklist />} />
          <Route path="/import-guest-list" element={<ImportGuestList />} />
          <Route path="/roomclean" element={<RoomClean />} />
          <Route path="/quickaction" element={<QuickAction />} />
          <Route path="/accommodationtypes" element={<AccommodationTypeList />} />
          <Route path="/reservations" element={<ReservationList />} />
          <Route path="/check-in-check-out" element={<CheckInCheckOutPage />} />
          <Route path="/message" element={<MessagePage />} />
          <Route path="/restaurant" element={<RestaurantPage />} />
          <Route path="/parking" element={<ParkingManagement />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* ✅ Add this line for invoice detail route */}
          <Route path="/invoices/:id" element={<InvoiceShow />} />
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default App;
