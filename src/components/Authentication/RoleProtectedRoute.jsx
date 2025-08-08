import ProtectedRoute from './ProtectedRoute';

const RoleProtectedRoute = ({ children, role }) => {
  return (
    <ProtectedRoute allowedRoles={[role]}>
      {children}
    </ProtectedRoute>
  );
};

export default RoleProtectedRoute;