import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Icon } from '../components/Icon';
import Toast, { showToast } from '../components/Toast';
import api from '../config/api';
import { io } from 'socket.io-client';

const getSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  return apiUrl.replace(/\/api\/?$/, '');
};

export default function SessionsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState({});
  const [invites, setInvites] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [respondingInvite, setRespondingInvite] = useState({});
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
  const socketRef = useRef(null);
  const [inviteNotification, setInviteNotification] = useState(false);

  const fetchInvites = useCallback(async () => {
    setLoadingInvites(true);
    try {
      const { data } = await api.get('/invites');
      setInvites(data.invites || []);
    } catch {
      setInvites([]);
    } finally {
      setLoadingInvites(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('sb_token');
    const socketUrl = getSocketUrl();
    if (!token || !socketUrl) return;

    try {
      const socket = io(socketUrl, {
        transports: ['polling', 'websocket'],
        auth: { token },
      });

      socket.on('connect', () => {
        socketRef.current = socket;
      });

      socket.on('connect_error', () => {
        socket.disconnect();
      });

      socket.on('new_invite', () => {
        setInviteNotification(true);
      });

      socket.on('invite_updated', () => {
        setInviteNotification(true);
      });

      return () => {
        socket.disconnect();
      };
    } catch (e) {
      console.error('Socket connection error:', e);
    }
  }, []);

  useEffect(() => {
    if (inviteNotification) {
      fetchInvites();
      showToast('You received a new invite!', 'info');
      setInviteNotification(false);
    }
  }, [inviteNotification, fetchInvites]);

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

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

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

  const handleInviteResponse = async (inviteId, response) => {
    setRespondingInvite((prev) => ({ ...prev, [inviteId]: true }));
    try {
      await api.post(`/invites/${inviteId}/respond`, { response });
      if (response === 'accepted') {
        const accepted = invites.find((invite) => invite.invite_id === inviteId);
        if (accepted) {
          showToast('Invite accepted.', 'success');
          navigate(`/sessions/${accepted.session_id}`);
        }
      } else {
        showToast('Invite declined.', 'success');
      }
      fetchInvites();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to respond to invite.', 'error');
    } finally {
      setRespondingInvite((prev) => ({ ...prev, [inviteId]: false }));
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-heading font-medium text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-primary-200 dark:hover:shadow-primary-900/50 hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Session
          </button>
        </div>

        {invites.length > 0 && (
          <div className="relative mb-8 group">
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-primary-500/20 via-primary-400/10 to-cyan-500/20 blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100/80 dark:border-gray-800/80 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-primary-50/50 to-cyan-50/50 dark:from-primary-950/30 dark:to-cyan-950/30 border-b border-gray-100 dark:border-gray-800">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">Invitations</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{invites.length} pending {invites.length === 1 ? 'request' : 'requests'}</p>
                </div>
                <button
                  onClick={fetchInvites}
                  className="p-2 rounded-lg text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/50 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {invites.map((invite, index) => (
                  <div 
                    key={invite.invite_id} 
                    className="flex items-center gap-4 p-4 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-all duration-200 group/item"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="relative">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-lg font-semibold text-gray-600 dark:text-gray-300 ring-2 ring-gray-200/50 dark:ring-gray-700/50">
                        {invite.inviter.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-gray-900" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover/item:text-primary-600 dark:group-hover/item:text-primary-400 transition-colors">
                        {invite.session.topic}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-medium text-gray-600 dark:text-gray-300">{invite.inviter.name}</span>
                          {' '}invited you
                        </span>
                        <span className="text-gray-300 dark:text-gray-600">·</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          invite.session.session_type === 'group'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400'
                        }`}>
                          {invite.session.session_type}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleInviteResponse(invite.invite_id, 'declined')}
                        disabled={respondingInvite[invite.invite_id]}
                        className="px-3.5 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white border border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 disabled:opacity-50"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleInviteResponse(invite.invite_id, 'accepted')}
                        disabled={respondingInvite[invite.invite_id]}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:hover:translate-y-0"
                      >
                        {respondingInvite[invite.invite_id] ? '...' : 'Accept'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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
            <div className="mb-4 flex justify-center"><Icon name="handshake" className="w-16 h-16 text-primary-400" /></div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((s) => (
                <div
                  key={s.session_id}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg hover:shadow-primary-100 dark:hover:shadow-primary-900/20 transition-all duration-300 flex flex-col"
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
                      <span className="flex items-center gap-1"><Icon name="users" className="w-3.5 h-3.5" /> {s.participant_count} participant(s)</span>
                      <span>{new Date(s.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
                    {s.creator_id === user?.user_id || s.is_joined ? (
                      <Link
                        to={`/sessions/${s.session_id}`}
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-heading font-medium hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-all duration-300 group"
                      >
                        Open Session
                        <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
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
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-sm font-heading font-medium transition-all duration-300 disabled:opacity-60 hover:shadow-md hover:shadow-primary-200 dark:hover:shadow-primary-900/30"
                      >
                        {joining[s.session_id] ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Joining...
                          </span>
                        ) : 'Join Session'}
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
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create Study Session</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Start a new collaborative study room</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  aria-label="Close create session modal"
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form noValidate onSubmit={handleCreateSession} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Session Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCreateForm((prev) => ({ ...prev, session_type: 'group' }))}
                      className={`py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                        createForm.session_type === 'group'
                          ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-transparent'
                      }`}
                    >
                      <Icon name="users" className="w-4 h-4" /> Group
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreateForm((prev) => ({ ...prev, session_type: 'one-on-one' }))}
                      className={`py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                        createForm.session_type === 'one-on-one'
                          ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-transparent'
                      }`}
                    >
                      <Icon name="user" className="w-4 h-4" /> 1-on-1
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Topic</label>
                    <span className="text-xs text-gray-400 dark:text-gray-500">Required</span>
                  </div>
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
                    className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition text-sm ${
                      createErrors.topic
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-700 focus:ring-primary-500'
                    }`}
                  />
                  {createErrors.topic && <p className="text-red-500 text-xs mt-1.5">{createErrors.topic}</p>}
                </div>

                <div className="pt-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Link to Skill
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Connect this session to one of your registered skills.
                  </p>
                  <select
                    value={createForm.skill_id}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, skill_id: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  >
                    <option value="">No skill linked</option>
                    {mySkills.map((s) => (
                      <option key={s.skill_id} value={s.skill_id}>
                        {s.skill_name}
                      </option>
                    ))}
                  </select>
                  {mySkills.length === 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      You have no registered skills.{' '}
                      <Link to="/skills" className="text-primary-600 dark:text-primary-400 hover:underline">
                        Add skills
                      </Link>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-5 py-2.5 rounded-xl text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white transition disabled:opacity-60 shadow-md shadow-primary-500/20"
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
