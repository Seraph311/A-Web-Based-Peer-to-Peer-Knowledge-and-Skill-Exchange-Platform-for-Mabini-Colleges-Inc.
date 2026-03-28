import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function RejectedPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md
          p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Account Rejected
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Your registration was not approved.
          </p>
          {user?.rejection_reason && (
            <div className="bg-red-50 dark:bg-red-900/20 border
              border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-600 dark:text-red-400">
                <span className="font-medium">Reason: </span>
                {user.rejection_reason}
              </p>
            </div>
          )}
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
            You may re-register with updated documents.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/register"
              className="w-full py-2.5 rounded-lg bg-primary-600
                hover:bg-primary-700 text-white font-medium
                text-center transition">
              Re-register
            </Link>
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
    </div>
  );
}
