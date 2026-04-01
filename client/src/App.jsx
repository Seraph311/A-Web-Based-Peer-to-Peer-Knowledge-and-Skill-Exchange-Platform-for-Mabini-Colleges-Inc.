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
import ForumPage from './pages/ForumPage';
import ForumQuestionPage from './pages/ForumQuestionPage';
import ForumAskPage from './pages/ForumAskPage';
import SessionsPage from './pages/SessionsPage';
import SessionRoomPage from './pages/SessionRoomPage';
import SkillsPage from './pages/SkillsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

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
          <Route path="/forum"       element={<ProtectedRoute><ForumPage /></ProtectedRoute>} />
          <Route path="/forum/ask"   element={<ProtectedRoute><ForumAskPage /></ProtectedRoute>} />
          <Route path="/forum/:id"   element={<ProtectedRoute><ForumQuestionPage /></ProtectedRoute>} />
          <Route path="/sessions"    element={<ProtectedRoute><SessionsPage /></ProtectedRoute>} />
          <Route path="/sessions/:id" element={<ProtectedRoute><SessionRoomPage /></ProtectedRoute>} />
          <Route path="/skills"      element={<ProtectedRoute><SkillsPage /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/settings"    element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

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
