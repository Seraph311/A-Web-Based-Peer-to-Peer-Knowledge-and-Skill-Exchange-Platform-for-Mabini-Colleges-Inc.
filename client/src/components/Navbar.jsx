import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(
    localStorage.theme === 'dark' ||
    (!('theme' in localStorage) &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [dark]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80
      backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
        flex items-center justify-between h-16">

        {/* Brand */}
        <Link to="/" className="text-xl font-bold">
          <span className="text-primary-600 dark:text-primary-400">Study</span>
          <span className="text-gray-800 dark:text-white">Bridge</span>
        </Link>

        {/* Nav links — shown only to approved logged in users */}
        {token && user?.status === 'approved' && user?.role !== 'admin' && (
          <div className="hidden md:flex items-center gap-6 text-sm
            font-medium text-gray-600 dark:text-gray-300">
            <Link to="/dashboard"
              className="hover:text-primary-600 dark:hover:text-primary-400 transition">
              Dashboard
            </Link>
            <Link to="/forum"
              className="hover:text-primary-600 dark:hover:text-primary-400 transition">
              Forum
            </Link>
            <Link to="/sessions"
              className="hover:text-primary-600 dark:hover:text-primary-400 transition">
              Sessions
            </Link>
            <Link to="/leaderboard"
              className="hover:text-primary-600 dark:hover:text-primary-400 transition">
              Leaderboard
            </Link>
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Dark mode toggle */}
          <button
            onClick={() => setDark(!dark)}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400
              hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label="Toggle dark mode">
            {dark ? '☀️' : '🌙'}
          </button>

          {!token && (
            <>
              <Link to="/login"
                className="text-sm font-medium text-gray-600
                  dark:text-gray-300 hover:text-primary-600
                  dark:hover:text-primary-400 transition">
                Login
              </Link>
              <Link to="/register"
                className="text-sm font-medium px-4 py-2 rounded-lg
                  bg-primary-600 hover:bg-primary-700 text-white transition">
                Register
              </Link>
            </>
          )}

          {token && user?.status === 'approved' && (
            <div className="flex items-center gap-3">
              {user.role === 'admin' && (
                <Link to="/admin"
                  className="text-sm font-medium text-primary-600
                    dark:text-primary-400 hover:underline">
                  Admin Panel
                </Link>
              )}
              <Link to={`/profile/${user.user_id}`}
                className="text-sm font-medium text-gray-600
                  dark:text-gray-300 hover:text-primary-600
                  dark:hover:text-primary-400 transition">
                {user.name}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-medium px-4 py-2 rounded-lg
                  bg-gray-100 hover:bg-gray-200 dark:bg-gray-800
                  dark:hover:bg-gray-700 text-gray-700
                  dark:text-gray-200 transition">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
