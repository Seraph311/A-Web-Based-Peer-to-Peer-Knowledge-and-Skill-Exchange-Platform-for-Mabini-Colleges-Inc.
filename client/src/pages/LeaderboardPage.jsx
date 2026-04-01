import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Toast, { showToast } from '../components/Toast';
import api from '../config/api';

export default function LeaderboardPage() {
  const { user } = useAuth();

  const [leaderboard, setLeaderboard] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState(null);
  const [filters, setFilters] = useState({
    department: '', page: 1, limit: 20
  });

  const departments = [
    'All Departments',
    'Graduate Program',
    'College of Education',
    'College of Business Administration and Accountancy',
    'College of Computer Studies',
    'College of Nursing and Midwifery',
    'College of Criminal Justice Education',
    'College of Liberal Arts',
    'Technical Education and Training Department',
    'High School Department'
  ];

  const badgeEmoji = {
    Gold: '🥇', Silver: '🥈', Bronze: '🥉', Member: '🎓'
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.department) params.append('department', filters.department);
      params.append('page', filters.page);
      params.append('limit', filters.limit);

      const { data } = await api.get(
        `/users/leaderboard?${params.toString()}`
      );
      setLeaderboard(data.leaderboard);
      setPagination(data.pagination);

      const found = data.leaderboard.find(
        (u) => u.user_id === user?.user_id
      );
      if (found) setMyRank(found.rank);
      else setMyRank(null);
    } catch {
      showToast('Failed to load leaderboard.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaderboard(); }, [filters]);

  const podiumCardClass = (rank, userId) => {
    const base = userId === user?.user_id ? ' ring-2 ring-primary-400 dark:ring-primary-500' : '';
    if (rank === 1) {
      return `flex flex-col items-center text-center bg-white dark:bg-gray-900 rounded-2xl p-5 border-2 border-yellow-300 dark:border-yellow-700 shadow-lg shadow-yellow-100 dark:shadow-yellow-900/20 order-2 sm:order-none${base}`;
    }
    if (rank === 2) {
      return `flex flex-col items-center text-center bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 self-end order-1 sm:order-none${base}`;
    }
    return `flex flex-col items-center text-center bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 self-end order-3 sm:order-none${base}`;
  };

  const renderPodiumCard = (u, rank) => {
    if (!u) return null;
    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
    return (
      <div key={u.user_id} className={podiumCardClass(rank, u.user_id)}>
        <div className="text-3xl mb-2">{medal}</div>
        <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-xl font-bold text-primary-700 dark:text-primary-300 mb-2 mx-auto">
          {(u.name || 'U').charAt(0).toUpperCase()}
        </div>
        <Link
          to={`/profile/${u.user_id}`}
          className="font-semibold text-gray-900 dark:text-white text-sm hover:text-primary-600 dark:hover:text-primary-400 transition line-clamp-1"
        >
          {u.name}
        </Link>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {badgeEmoji[u.badge_level] || '🎓'} {u.badge_level}
        </p>
        <p className="text-lg font-bold text-primary-600 dark:text-primary-400 mt-1">
          {u.contribution_points}
          <span className="text-xs font-normal text-gray-400 ml-1">pts</span>
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <Toast />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🏆</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Leaderboard</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Top contributors in the Mabini Colleges community.
          </p>

          {myRank !== null && (
            <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium">
              Your current rank: #{myRank}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 mb-6 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Department</label>
            <select
              value={filters.department}
              onChange={(e) => setFilters((prev) => ({
                ...prev,
                department: e.target.value === 'All Departments'
                  ? '' : e.target.value,
                page: 1
              }))}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            >
              {departments.map((d) => (
                <option key={d} value={d === 'All Departments' ? '' : d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Show</label>
            <select
              value={filters.limit}
              onChange={(e) => setFilters((prev) => ({
                ...prev, limit: parseInt(e.target.value, 10), page: 1
              }))}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {filters.page === 1 && leaderboard.length >= 1 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {renderPodiumCard(leaderboard[1], 2)}
                {renderPodiumCard(leaderboard[0], 1)}
                {renderPodiumCard(leaderboard[2], 3)}
              </div>
            )}

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contributor</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Badge</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rating</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {leaderboard.map((u) => (
                      <tr
                        key={u.user_id}
                        className={`${u.user_id === user?.user_id ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'} transition`}
                      >
                        <td className="px-5 py-4">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              u.rank === 1
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : u.rank === 2
                                  ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                                  : u.rank === 3
                                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                    : 'bg-gray-50 text-gray-500 dark:bg-gray-900 dark:text-gray-400'
                            }`}
                          >
                            #{u.rank}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-sm font-bold text-primary-700 dark:text-primary-300">
                              {(u.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <Link
                                to={`/profile/${u.user_id}`}
                                className="font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 text-sm"
                              >
                                {u.name}
                                {u.user_id === user?.user_id && (
                                  <span className="ml-1 text-primary-500 text-xs">(You)</span>
                                )}
                              </Link>
                              <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{u.role}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-300 text-xs">{u.department}</span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm">{badgeEmoji[u.badge_level] || '🎓'} {u.badge_level}</span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {u.average_rating
                              ? `⭐ ${u.average_rating}`
                              : <span className="text-gray-400 dark:text-gray-500 text-xs">No ratings</span>}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-bold text-primary-600 dark:text-primary-400">
                            {u.contribution_points}
                            <span className="text-xs font-normal text-gray-400 ml-1">pts</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination && pagination.total_pages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Page {pagination.page} of {pagination.total_pages} · {pagination.total} contributors
                  </p>
                  <div className="flex gap-2">
                    <button
                      disabled={pagination.page <= 1}
                      onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                      className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ← Previous
                    </button>
                    <button
                      disabled={pagination.page >= pagination.total_pages}
                      onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                      className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
