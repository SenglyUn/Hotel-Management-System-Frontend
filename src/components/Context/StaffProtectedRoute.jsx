import React from 'react';
import ProtectedRoute from '../Authentication/ProtectedRoute';

const StaffProtectedRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={['admin', 'staff']}>
      {children}
    </ProtectedRoute>
  );
};

export default StaffProtectedRoute;