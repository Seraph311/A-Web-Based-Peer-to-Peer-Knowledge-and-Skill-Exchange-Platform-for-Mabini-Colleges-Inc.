import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Toast, { showToast } from '../components/Toast';
import api from '../config/api';

export default function SessionsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'open',
    session_type: '',
    keyword: '',
    page: 1,
  });
  const [createForm, setCreateForm] = useState({
    session_type: 'group',
    topic: '',
    skill_id: '',
  });
  const [createErrors, setCreateErrors] = useState({});
  const [mySkills, setMySkills] = useState([]);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.session_type) params.append('session_type', filters.session_type);
      if (filters.keyword) params.append('keyword', filters.keyword);
      params.append('page', filters.page);
      params.append('limit', 12);

      const { data } = await api.get(`/sessions?${params.toString()}`);
      setSessions(data.sessions);
      setPagination(data.pagination);
    } catch {
      showToast('Failed to load sessions.', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    api
      .get('/skills/me')
      .then(({ data }) => setMySkills(data.skills))
      .catch(() => {});
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleJoin = async (sessionId) => {
    setJoining((prev) => ({ ...prev, [sessionId]: true }));
    try {
      await api.post(`/sessions/${sessionId}/join`);
      showToast('Joined session successfully.');
      navigate(`/sessions/${sessionId}`);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to join session.';
      showToast(msg, 'error');
    } finally {
      setJoining((prev) => ({ ...prev, [sessionId]: false }));
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();

    if (!createForm.topic.trim()) {
      setCreateErrors({ topic: 'Topic is required.' });
      return;
    }

    if (createForm.topic.trim().length < 5) {
      setCreateErrors({ topic: 'Topic must be at least 5 characters.' });
      return;
    }

    setCreating(true);
    try {
      const payload = {
        session_type: createForm.session_type,
        topic: createForm.topic.trim(),
      };

      if (createForm.skill_id) {
        payload.skill_id = parseInt(createForm.skill_id, 10);
      }

      const { data } = await api.post('/sessions', payload);
      showToast('Session created successfully.');
      setShowCreateModal(false);
      setCreateForm({ session_type: 'group', topic: '', skill_id: '' });
      setCreateErrors({});
      navigate(`/sessions/${data.session.session_id}`);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create session.';
      showToast(msg, 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <Toast />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Study Sessions</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Join an open session or create your own study room.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm transition shadow-sm shadow-primary-200 dark:shadow-primary-900"
          >
            + Create Session
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 mb-6 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            >
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Type</label>
            <select
              value={filters.session_type}
              onChange={(e) => handleFilterChange('session_type', e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            >
              <option value="">All Types</option>
              <option value="group">Group</option>
              <option value="one-on-one">1-on-1</option>
            </select>
          </div>

          <div className="min-w-[220px] flex-1">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by topic..."
              value={filters.keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition w-full"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 border border-gray-100 dark:border-gray-800 text-center">
            <div className="text-5xl mb-4">🤝</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No sessions found</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              {filters.keyword ? 'Try a different search term.' : 'No sessions match the current filters.'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm transition"
            >
              Create a Session
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map((s) => (
                <div
                  key={s.session_id}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all duration-200 flex flex-col"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                          s.session_type === 'group'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}
                      >
                        {s.session_type}
                      </span>

                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                          s.status === 'closed'
                            ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug mb-2 line-clamp-2">
                      {s.topic}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                      <span>👥 {s.participant_count} participant(s)</span>
                      <span>{new Date(s.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    {s.creator_id === user?.user_id || s.is_joined ? (
                      <Link
                        to={`/sessions/${s.session_id}`}
                        className="w-full inline-flex items-center justify-center py-2 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/50 transition"
                      >
                        Open Session →
                      </Link>
                    ) : s.status === 'closed' ? (
                      <button
                        disabled
                        className="w-full py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 text-sm font-medium cursor-not-allowed"
                      >
                        Session Closed
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoin(s.session_id)}
                        disabled={joining[s.session_id]}
                        className="w-full py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition disabled:opacity-60"
                      >
                        {joining[s.session_id] ? 'Joining...' : 'Join Session'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {pagination && pagination.total_pages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Page {pagination.page} of {pagination.total_pages} · {pagination.total} sessions
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                    className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>
                  <button
                    disabled={pagination.page >= pagination.total_pages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                    className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create Study Session</h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                aria-label="Close create session modal"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <form noValidate onSubmit={handleCreateSession}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Session Type</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCreateForm((prev) => ({ ...prev, session_type: 'group' }))}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
                      createForm.session_type === 'group'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    👥 Group
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateForm((prev) => ({ ...prev, session_type: 'one-on-one' }))}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
                      createForm.session_type === 'one-on-one'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    🤝 1-on-1
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Topic *</label>
                <input
                  type="text"
                  value={createForm.topic}
                  onChange={(e) => {
                    setCreateForm((prev) => ({ ...prev, topic: e.target.value }));
                    if (createErrors.topic) {
                      setCreateErrors((prev) => ({ ...prev, topic: '' }));
                    }
                  }}
                  placeholder="What will this session cover?"
                  className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition text-sm ${
                    createErrors.topic
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-700 focus:ring-primary-500'
                  }`}
                />
                {createErrors.topic && <p className="text-red-500 text-xs mt-1">{createErrors.topic}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Link to Skill (optional)
                </label>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                  Connect this session to one of your registered skills.
                </p>
                <select
                  value={createForm.skill_id}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, skill_id: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                >
                  <option value="">No skill linked</option>
                  {mySkills.map((s) => (
                    <option key={s.skill_id} value={s.skill_id}>
                      {s.skill_name}
                    </option>
                  ))}
                </select>
                {mySkills.length === 0 && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    You have no registered skills.{' '}
                    <Link to="/skills" className="text-primary-600 dark:text-primary-400 hover:underline">
                      Add skills
                    </Link>
                  </p>
                )}
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white transition disabled:opacity-60"
                >
                  {creating ? 'Creating...' : 'Create Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
