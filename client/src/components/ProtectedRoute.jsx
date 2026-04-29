import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false, instructorOnly = false }) {
  const { token, user } = useAuth();

  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.status === 'pending') return <Navigate to="/pending" replace />;
  if (user.status === 'rejected') return <Navigate to="/rejected" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  if (instructorOnly && user.role !== 'admin' && user.role !== 'instructor') return <Navigate to="/dashboard" replace />;

  return children;
}
