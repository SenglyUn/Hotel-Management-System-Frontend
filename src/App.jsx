import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/context/AuthContext";
import ProtectedRoute from "./components/Authentication/ProtectedRoute";
import GuestProtectedRoute from "./components/context/GuestProtectedRoute"; 
// ... other imports ...
// Layout
import MainLayout from "./components/HomePage/MainLayout";

// Authentication
import LoginForm from "./components/Authentication/LoginForm";
import SignupForm from "./components/Authentication/SignupForm";

// Pages
import Dashboard from "./components/AdminPage/Dashboard";
import RoomList from "./components/Room/RoomList";
import GuestList from "./components/Guest/GuestList";
import GuestBlacklist from "./components/Guest/GuestBlacklist";
import ImportGuestList from "./components/Guest/ImportGuestList";
import RoomClean from "./components/AdminPage/RoomClean";
import QuickAction from "./components/AdminPage/QuickAction";
// import LandingPage from "./components/HomePage/LandingPage";
import LandingPage from "./components/LandingPage/LandingPage";
import NotFoundPage from "./components/HomePage/NotFoundPage";
import MessagePage from "./components/Message/Message";
import RestaurantPage from "./components/Restaurant/Restaurant";
import ParkingManagement from "./components/Parking/ParkingManagement";
import SettingsPage from "./components/Setting/SettingsPage";
import ReservationList from "./components/Reservation/ReservationList";
import BookingPage from "./components/HomePage/Booking/BookingPage";
import BookingConfirmation from './components/HomePage/Booking/BookingConfirmation';
import BookingHistory from './components/HomePage/Booking/components/BookingHistory';
import ExploreRooms from "./components/HomePage/ExploreRooms";
import InvoiceShow from "./components/Payment/InvoiceViewer";
import UnauthorizedPage from "./components/HomePage/UnauthorizedPage";

// User Management
import Users from "./components/User Management/Users"; // Add this import
import Profile from "../src/components/LandingPage/Profile"; // Add this import

// Protected Routes
import AdminProtectedRoute from "./components/context/AdminProtectedRoute";
import StaffProtectedRoute from "./components/context/StaffProtectedRoute";
// import ProtectedRoute from "./components/Authentication/ProtectedRoute";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/book" element={<BookingPage />} />
          <Route path="/booking-confirmation" element={<BookingConfirmation />} />
          <Route path="/booking-history" element={<BookingHistory />} />
          <Route path="/explore" element={<ExploreRooms />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

                    {/* Guest Protected Route */}
          <Route path="/landing" element={
            <GuestProtectedRoute>
              <LandingPage />
            </GuestProtectedRoute>
          } />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'staff']} />}>
            <Route element={<MainLayout />}>
              <Route path="/home" element={<Dashboard />} />
              
              {/* Shared staff/admin routes */}
              <Route path="/guests" element={<GuestList />} />
              <Route path="/guest-blacklist" element={<GuestBlacklist />} />
              <Route path="/reservations" element={<ReservationList />} />
              <Route path="/rooms" element={<RoomList />} />
              
              {/* Admin-only routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/import-guest-list" element={<ImportGuestList />} />
                <Route path="/roomclean" element={<RoomClean />} />
                <Route path="/quickaction" element={<QuickAction />} />
                <Route path="/message" element={<MessagePage />} />
                <Route path="/restaurant" element={<RestaurantPage />} />
                <Route path="/parking" element={<ParkingManagement />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/users" element={<Users />} /> {/* Add this route for User Management */}
              </Route>

              <Route path="/invoices/:id" element={<InvoiceShow />} />
            </Route>
          </Route>


         {/* Guest Protected Profile Route */}
          <Route path="/profile" element={
            <GuestProtectedRoute>
                <Profile />
            </GuestProtectedRoute>
          } />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;