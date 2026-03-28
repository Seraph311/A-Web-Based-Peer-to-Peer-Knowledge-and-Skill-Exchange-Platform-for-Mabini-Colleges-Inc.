import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Toast from './components/Toast';

import LandingPage    from './pages/LandingPage';
import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';
import PendingPage    from './pages/PendingPage';
import RejectedPage   from './pages/RejectedPage';
import DashboardPage  from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';

// Placeholder pages — to be implemented in subsequent prompts
const Placeholder = ({ name }) => (
  <div className="min-h-screen flex items-center justify-center
    bg-gray-50 dark:bg-gray-950 text-gray-400 dark:text-gray-600 text-xl">
    {name} — coming soon
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toast />
        <Routes>
          {/* Public */}
          <Route path="/"          element={<LandingPage />} />
          <Route path="/login"     element={<LoginPage />} />
          <Route path="/register"  element={<RegisterPage />} />
          <Route path="/pending"   element={<PendingPage />} />
          <Route path="/rejected"  element={<RejectedPage />} />

          {/* Protected — approved users */}
          <Route path="/dashboard"   element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/forum"       element={<ProtectedRoute><Placeholder name="Forum" /></ProtectedRoute>} />
          <Route path="/forum/ask"   element={<ProtectedRoute><Placeholder name="Ask Question" /></ProtectedRoute>} />
          <Route path="/forum/:id"   element={<ProtectedRoute><Placeholder name="Question Detail" /></ProtectedRoute>} />
          <Route path="/sessions"    element={<ProtectedRoute><Placeholder name="Sessions" /></ProtectedRoute>} />
          <Route path="/sessions/:id" element={<ProtectedRoute><Placeholder name="Session Room" /></ProtectedRoute>} />
          <Route path="/skills"      element={<ProtectedRoute><Placeholder name="Skills" /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Placeholder name="Leaderboard" /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute><Placeholder name="Profile" /></ProtectedRoute>} />
          <Route path="/settings"    element={<ProtectedRoute><Placeholder name="Settings" /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin"       element={<ProtectedRoute adminOnly><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsersPage /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
