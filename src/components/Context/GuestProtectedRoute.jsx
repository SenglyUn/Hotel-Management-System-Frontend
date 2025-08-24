// src/components/context/GuestProtectedRoute.jsx
import { useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";

const GuestProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'guest') {
    return children;
  }

  // If user is admin/staff but trying to access guest page, redirect to home
  return <Navigate to="/home" replace />;
};

export default GuestProtectedRoute;