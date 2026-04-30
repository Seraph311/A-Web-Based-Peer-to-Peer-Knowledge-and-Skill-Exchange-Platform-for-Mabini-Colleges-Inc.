import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
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

  const isApprovedUser = Boolean(token && user?.status === 'approved');
  const showSkillSearch = isApprovedUser && user?.role !== 'admin';

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80
      backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
        flex items-center justify-between h-16">

        {/* Brand */}
        <Link
          to={token && user?.status === 'approved' ? '/dashboard' : '/'}
          className="text-xl font-heading font-bold"
        >
          <span className="text-primary-600 dark:text-primary-400">Study</span>
          <span className="text-gray-800 dark:text-white">Bridge</span>
        </Link>

        {/* Nav links — shown to approved logged in users (including admin) */}
        {isApprovedUser && (
          <div className="hidden md:flex items-center gap-8 text-sm
            font-heading font-medium text-gray-600 dark:text-gray-300">
            <Link to="/forum"
              className="hover:text-primary-600 dark:hover:text-primary-400 transition relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary-500 after:transition-all after:duration-300 hover:after:w-full">
              Forum
            </Link>
            <Link to="/sessions"
              className="hover:text-primary-600 dark:hover:text-primary-400 transition relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary-500 after:transition-all after:duration-300 hover:after:w-full">
              Sessions
            </Link>
            <Link to="/leaderboard"
              className="hover:text-primary-600 dark:hover:text-primary-400 transition relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary-500 after:transition-all after:duration-300 hover:after:w-full">
              Leaderboard
            </Link>
          </div>
        )}

        {showSkillSearch && (
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
                  className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition font-body"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
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
                        {r.user.average_rating && <p className="text-xs text-gray-400 flex items-center gap-1"><Icon name="star" className="w-3 h-3 text-yellow-500" /> {r.user.average_rating}</p>}
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
              hover:bg-gray-100 dark:hover:bg-gray-800 transition hover:text-primary-500"
            aria-label="Toggle dark mode">
            {dark ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {!token && (
            <>
              <Link to="/login"
                className="text-sm font-heading font-medium text-gray-600
                  dark:text-gray-300 hover:text-primary-600
                  dark:hover:text-primary-400 transition">
                Login
              </Link>
              <Link to="/register"
                className="text-sm font-heading font-medium px-5 py-2.5 rounded-xl
                  bg-primary-600 hover:bg-primary-700 text-white transition-all duration-300 hover:shadow-lg hover:shadow-primary-200 dark:hover:shadow-primary-900/50">
                Register
              </Link>
            </>
          )}

          {token && user?.status === 'approved' && (
            <div className="flex items-center gap-4">
              {(user.role === 'admin' || user.role === 'instructor') && (
                <Link to="/reports"
                  className="text-sm font-heading font-medium text-primary-600
                    dark:text-primary-400 hover:underline">
                  Reports
                </Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin"
                  className="text-sm font-heading font-medium text-primary-600
                    dark:text-primary-400 hover:underline">
                  Admin Panel
                </Link>
              )}
              <Link to={`/profile/${user.user_id}`}
                className="text-sm font-heading font-medium text-gray-600
                  dark:text-gray-300 hover:text-primary-600
                  dark:hover:text-primary-400 transition">
                {user.name}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-heading font-medium px-4 py-2 rounded-xl
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
