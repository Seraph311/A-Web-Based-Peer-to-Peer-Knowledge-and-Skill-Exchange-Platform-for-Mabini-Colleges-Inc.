import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Toast, { showToast } from '../components/Toast';
import EmptyState from '../components/EmptyState';
import { BadgeGold, BadgeSilver, BadgeBronze, BadgeMember } from '../components/Icon';
import api from '../config/api';

const badgeIconMap = {
  Gold: BadgeGold,
  Silver: BadgeSilver,
  Bronze: BadgeBronze,
  Member: BadgeMember,
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
  const BadgeIcon = badgeIconMap[badgeLevel] || BadgeMember;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <Toast />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">Welcome back, <span className="text-primary-600 dark:text-primary-400">{user.name}</span></h1>
          <p className="text-gray-500 dark:text-gray-400 text-base mt-2 font-body">
            Here&apos;s what&apos;s happening in your community today.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:shadow-primary-100 dark:hover:shadow-primary-900/20 transition-all duration-300 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary-100 to-transparent dark:from-primary-900/30 rounded-bl-full opacity-50"></div>
                <div className="text-xs font-heading font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">
                  Contribution Points
                </div>
                <div className="text-4xl font-heading font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {stats?.contribution_points ?? 0}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-body">Total earned</div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:shadow-warm-100 dark:hover:shadow-warm-900/20 transition-all duration-300 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-warm-100 to-transparent dark:from-warm-900/30 rounded-bl-full opacity-50"></div>
                <div className="text-xs font-heading font-medium text-warm-600 dark:text-warm-400 uppercase tracking-wider mb-2">
                  Badge Level
                </div>
                <div className="text-3xl font-heading font-bold text-gray-900 dark:text-white group-hover:text-warm-600 dark:group-hover:text-warm-400 transition-colors flex items-center gap-2">
                    <BadgeIcon size="1.5em" className="text-warm-500" />
                    {badgeLevel}
                  </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-body">Current rank</div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:shadow-blue-100 dark:hover:shadow-blue-900/20 transition-all duration-300 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-transparent dark:from-blue-900/30 rounded-bl-full opacity-50"></div>
                <div className="text-xs font-heading font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
                  Answers Given
                </div>
                <div className="text-4xl font-heading font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{stats?.stats?.total_answers ?? 0}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-body">Forum contributions</div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:shadow-purple-100 dark:hover:shadow-purple-900/20 transition-all duration-300 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-100 to-transparent dark:from-purple-900/30 rounded-bl-full opacity-50"></div>
                <div className="text-xs font-heading font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">
                  Sessions Joined
                </div>
                <div className="text-4xl font-heading font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {(stats?.stats?.total_sessions_joined ?? 0) + (stats?.stats?.total_sessions_created ?? 0)}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-body">Study sessions</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold text-gray-900 dark:text-white">Recent Questions</h2>
                    <Link to="/forum" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                      View all
                    </Link>
                  </div>

                  {recentQuestions.length === 0 ? (
                    <EmptyState 
                      icon="questions"
                      title="No questions yet"
                      description="Be the first to ask a question and start a conversation!"
                      action={
                        <Link to="/forum/ask" className="px-5 py-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-heading font-medium text-sm hover:bg-primary-100 dark:hover:bg-primary-900/50 transition">
                          Ask a question
                        </Link>
                      }
                    />
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
                    <EmptyState 
                      icon="sessions"
                      title="No active sessions"
                      description="No study sessions are happening right now. Start one or check back later!"
                      action={
                        <Link to="/sessions" className="px-5 py-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-heading font-medium text-sm hover:bg-primary-100 dark:hover:bg-primary-900/50 transition">
                          Browse sessions
                        </Link>
                      }
                    />
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
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            {s.participant_count}
                          </span>
                          <span>{new Date(s.created_at).toLocaleDateString()}</span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              <div className="lg:col-span-1 space-y-8">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                  <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>

                  <div className="flex flex-col gap-3">
                    <Link
                      to="/forum/ask"
                      className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-heading font-medium text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-primary-200 dark:hover:shadow-primary-900/50"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Ask a Question
                    </Link>
                    <Link
                      to="/sessions"
                      className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 text-gray-700 dark:text-gray-200 font-heading font-medium text-sm transition-all duration-300 hover:shadow-md"
                    >
                      <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Browse Sessions
                    </Link>
                    <Link
                      to="/skills"
                      className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 text-gray-700 dark:text-gray-200 font-heading font-medium text-sm transition-all duration-300 hover:shadow-md"
                    >
                      <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Manage My Skills
                    </Link>
                    <Link
                      to={`/profile/${user?.user_id}`}
                      className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 text-gray-700 dark:text-gray-200 font-heading font-medium text-sm transition-all duration-300 hover:shadow-md"
                    >
                      <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      View My Profile
                    </Link>
                    <Link
                      to="/skills"
                      className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 text-gray-700 dark:text-gray-200 font-heading font-medium text-sm transition-all duration-300 hover:shadow-md"
                    >
                      <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Find a Peer
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
                    <div className="text-center py-6">
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        No top contributors yet. Be the first to make your mark!
                      </p>
                    </div>
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
