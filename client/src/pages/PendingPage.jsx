import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function PendingPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md
          p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Awaiting Approval
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Your account is currently under review by the admin.
            You will be able to access StudyBridge once your
            documents have been verified.
          </p>
          {user && (
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
              Registered as <span className="font-medium
                text-gray-600 dark:text-gray-300">{user.email}</span>
            </p>
          )}
          <button
            onClick={logout}
            className="w-full py-2.5 rounded-lg bg-gray-100
              hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700
              text-gray-700 dark:text-gray-200 font-medium transition">
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
