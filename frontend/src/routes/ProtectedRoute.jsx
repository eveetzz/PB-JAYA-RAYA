import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Proteksi route: harus login, dan (opsional) role harus diizinkan.
export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted">
        Memuat...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
