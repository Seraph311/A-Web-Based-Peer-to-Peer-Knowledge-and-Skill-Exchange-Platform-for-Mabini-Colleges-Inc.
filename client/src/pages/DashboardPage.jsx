import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Toast, { showToast } from '../components/Toast';
import api from '../config/api';

const badgeEmojiMap = {
  Gold: '🥇',
  Silver: '🥈',
  Bronze: '🥉',
  Member: '🎓',
};

export default function DashboardPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [profileRes, questionsRes, sessionsRes, leaderboardRes] = await Promise.all([
          api.get('/users/me'),
          api.get('/forum/questions?limit=5'),
          api.get('/sessions?status=open&limit=5'),
          api.get('/users/leaderboard?limit=5'),
        ]);

        const profile = profileRes.data?.user || profileRes.data;
        setStats({
          contribution_points: profile?.contribution_points,
          badge_level: profile?.badge_level,
          average_rating: profile?.average_rating,
          stats: {
            total_answers: profile?.stats?.total_answers,
            total_sessions_created: profile?.stats?.total_sessions_created,
            total_sessions_joined: profile?.stats?.total_sessions_joined,
          },
        });

        setRecentQuestions((questionsRes.data?.questions || []).slice(0, 5));
        setActiveSessions((sessionsRes.data?.sessions || []).slice(0, 5));
        setTopUsers(leaderboardRes.data?.leaderboard || []);
      } catch (error) {
        void error;
        showToast('Failed to load dashboard.', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const badgeLevel = stats?.badge_level || 'Member';
  const badgeLabel = `${badgeEmojiMap[badgeLevel] || '🎓'} ${badgeLevel}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <Toast />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {user.name} 👋</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Here&apos;s what&apos;s happening in your community today.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Contribution Points
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats?.contribution_points ?? 0}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">Total earned</div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Badge Level
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{badgeLabel}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">Current rank</div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Answers Given
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.stats?.total_answers ?? 0}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">Forum contributions</div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Sessions Joined
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {(stats?.stats?.total_sessions_joined ?? 0) + (stats?.stats?.total_sessions_created ?? 0)}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">Study sessions</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold text-gray-900 dark:text-white">Recent Questions</h2>
                    <Link to="/forum" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                      View all
                    </Link>
                  </div>

                  {recentQuestions.length === 0 ? (
                    <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-6">
                      No questions yet. Be the first to ask!
                    </p>
                  ) : (
                    recentQuestions.map((q) => (
                      <Link
                        key={q.question_id}
                        to={`/forum/${q.question_id}`}
                        className="block py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg px-2 -mx-2 transition"
                      >
                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1 mb-1">{q.title}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                          {q.topic_tag && (
                            <span className="px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                              {q.topic_tag}
                            </span>
                          )}
                          <span>{new Date(q.created_at).toLocaleDateString()}</span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold text-gray-900 dark:text-white">Active Study Sessions</h2>
                    <Link to="/sessions" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                      View all
                    </Link>
                  </div>

                  {activeSessions.length === 0 ? (
                    <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-6">No open sessions right now.</p>
                  ) : (
                    activeSessions.map((s) => (
                      <Link
                        key={s.session_id}
                        to={`/sessions/${s.session_id}`}
                        className="block py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg px-2 -mx-2 transition"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{s.topic}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 ml-2 shrink-0">
                            {s.session_type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                          <span>👥 {s.participant_count} participant(s)</span>
                          <span>{new Date(s.created_at).toLocaleDateString()}</span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                  <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>

                  <div className="flex flex-col gap-3">
                    <Link
                      to="/forum/ask"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-medium text-sm transition"
                    >
                      ✏️ Ask a Question
                    </Link>
                    <Link
                      to="/sessions"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-medium text-sm transition"
                    >
                      🤝 Browse Sessions
                    </Link>
                    <Link
                      to="/skills"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-medium text-sm transition"
                    >
                      🏷️ Manage My Skills
                    </Link>
                    <Link
                      to={`/profile/${user?.user_id}`}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-medium text-sm transition"
                    >
                      👤 View My Profile
                    </Link>
                    <Link
                      to="/skills"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-medium text-sm transition"
                    >
                      🔍 Find a Peer
                    </Link>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold text-gray-900 dark:text-white">Top Contributors</h2>
                    <Link
                      to="/leaderboard"
                      className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      Full leaderboard
                    </Link>
                  </div>

                  {topUsers.length === 0 ? (
                    <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-6">No contributors yet.</p>
                  ) : (
                    topUsers.slice(0, 5).map((u) => (
                      <div
                        key={u.user_id}
                        className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            u.rank === 1
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : u.rank === 2
                                ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                                : u.rank === 3
                                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                  : 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                          }`}
                        >
                          #{u.rank}
                        </div>

                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/profile/${u.user_id}`}
                            className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 truncate block"
                          >
                            {u.name}
                          </Link>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {u.contribution_points} pts · {u.badge_level}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
