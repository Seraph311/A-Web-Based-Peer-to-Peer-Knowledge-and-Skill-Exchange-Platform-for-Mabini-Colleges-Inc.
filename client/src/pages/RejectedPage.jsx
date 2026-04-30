import Navbar from '../components/Navbar';
import { Icon } from '../components/Icon';
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
          <div className="mb-4"><Icon name="x" className="w-16 h-16 text-red-500" /></div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-2">
            Account Rejected
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4 font-body">
            Unfortunately, your registration was not approved at this time.
          </p>
          {user?.rejection_reason && (
            <div className="bg-red-50 dark:bg-red-900/20 border
              border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-600 dark:text-red-400">
                <span className="font-medium">Reason: </span>
                {user.rejection_reason}
              </p>
            </div>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-body">
            You can update your information and try again with new documents.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/register"
              className="w-full py-2.5 rounded-xl bg-primary-600
                hover:bg-primary-700 text-white font-heading font-medium
                text-center transition hover:shadow-lg hover:shadow-primary-200">
              Register again
            </Link>
            <button
              onClick={logout}
              className="w-full py-2.5 rounded-xl bg-gray-100
                hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700
                text-gray-700 dark:text-gray-200 font-heading font-medium transition">
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
