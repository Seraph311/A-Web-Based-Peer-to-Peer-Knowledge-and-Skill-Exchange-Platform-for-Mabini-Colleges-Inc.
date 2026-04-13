import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import api from '../config/api';

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [skillSearch, setSkillSearch] = useState('');
  const [skillResults, setSkillResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSkillSearch = async (e) => {
    e.preventDefault();
    if (!skillSearch.trim()) return;

    setSearching(true);
    setShowResults(true);
    try {
      const { data } = await api.get(`/skills/search?keyword=${encodeURIComponent(skillSearch)}`);
      setSkillResults(data.results);
    } catch {
      setSkillResults([]);
    } finally {
      setSearching(false);
    }
  };

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
        <Link
          to={token && user?.status === 'approved' ? '/dashboard' : '/'}
          className="text-xl font-bold"
        >
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

        {token && user?.status === 'approved' && user?.role !== 'admin' && (
          <div ref={searchRef} className="relative hidden md:block w-64">
            <form onSubmit={handleSkillSearch} className="flex items-center">
              <div className="relative w-full">
                <input
                  type="text"
                  value={skillSearch}
                  onChange={(e) => {
                    setSkillSearch(e.target.value);
                    if (!e.target.value.trim()) {
                      setSkillResults([]);
                      setShowResults(false);
                    }
                  }}
                  onFocus={() => {
                    if (skillResults.length > 0) setShowResults(true);
                  }}
                  placeholder="Find a peer by skill..."
                  className="w-full pl-9 pr-4 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
              </div>
            </form>

            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50 max-h-80 overflow-y-auto">
                {searching ? (
                  <div className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">Searching...</div>
                ) : skillResults.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">
                    No peers found for "{skillSearch}"
                  </div>
                ) : (
                  skillResults.slice(0, 6).map((r) => (
                    <Link
                      key={`${r.user.user_id}-${r.skill_id}`}
                      to={`/profile/${r.user.user_id}`}
                      onClick={() => {
                        setShowResults(false);
                        setSkillSearch('');
                        setSkillResults([]);
                      }}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition border-b border-gray-100 dark:border-gray-800 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{r.user.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {r.skill_name} · {r.user.department}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-primary-600 dark:text-primary-400">
                          {r.user.badge_level}
                        </p>
                        {r.user.average_rating && <p className="text-xs text-gray-400">⭐ {r.user.average_rating}</p>}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
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
