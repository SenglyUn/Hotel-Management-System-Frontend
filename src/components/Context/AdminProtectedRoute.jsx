import React from 'react';
import ProtectedRoute from '../Authentication/ProtectedRoute';

const AdminProtectedRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      {children}
    </ProtectedRoute>
  );
};

export default AdminProtectedRoute;