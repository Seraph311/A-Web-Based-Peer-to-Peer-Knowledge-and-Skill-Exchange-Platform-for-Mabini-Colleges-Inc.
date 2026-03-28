import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Toast, { showToast } from '../components/Toast';
import api from '../config/api';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const [pending, setPending] = useState([]);
  const [stats, setStats] = useState({
    total_users: 0,
    pending_count: 0,
    approved_count: 0,
    rejected_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const [pendingRes, usersRes] = await Promise.all([
          api.get('/admin/users/pending'),
          api.get('/admin/users?limit=50'),
        ]);

        const pendingUsers = pendingRes.data?.users || [];
        const allUsers = usersRes.data?.users || [];
        const totalUsers = usersRes.data?.pagination?.total ?? allUsers.length;

        setPending(pendingUsers);
        setStats({
          total_users: totalUsers,
          pending_count: allUsers.filter((u) => u.status === 'pending').length,
          approved_count: allUsers.filter((u) => u.status === 'approved').length,
          rejected_count: allUsers.filter((u) => u.status === 'rejected').length,
        });
      } catch (error) {
        void error;
        showToast('Failed to load admin data.', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, []);

  const handleApprove = async (userId) => {
    setActionLoading((prev) => ({ ...prev, [userId]: 'approving' }));
    try {
      await api.put(`/admin/users/${userId}/approve`);
      setPending((prev) => prev.filter((u) => u.user_id !== userId));
      setStats((prev) => ({
        ...prev,
        approved_count: prev.approved_count + 1,
        pending_count: Math.max(0, prev.pending_count - 1),
      }));
      showToast('User approved successfully.');
    } catch (error) {
      showToast(error.response?.data?.message || 'Approval failed.', 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: null }));
    }
  };

  const handleReject = async (userId, reason) => {
    setActionLoading((prev) => ({ ...prev, [userId]: 'rejecting' }));
    try {
      await api.put(`/admin/users/${userId}/reject`, { reason });
      setPending((prev) => prev.filter((u) => u.user_id !== userId));
      setStats((prev) => ({
        ...prev,
        rejected_count: prev.rejected_count + 1,
        pending_count: Math.max(0, prev.pending_count - 1),
      }));
      showToast('User rejected.');
    } catch (error) {
      showToast(error.response?.data?.message || 'Rejection failed.', 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: null }));
    }
  };

  const handleViewDocument = async (userId) => {
    try {
      const { data } = await api.get(`/admin/users/${userId}/document`);
      window.open(data.signed_url, '_blank');
    } catch (error) {
      void error;
      showToast('Could not load document.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <Toast />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Manage user registrations and platform oversight.
            </p>
          </div>
          <Link
            to="/admin/users"
            className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition"
          >
            All Users
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.total_users}</div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Users
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">⏳</span>
                </div>
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">{stats.pending_count}</div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pending Approval
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{stats.approved_count}</div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Approved</div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">❌</span>
                </div>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">{stats.rejected_count}</div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rejected</div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Pending Approvals
                {pending.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                    {pending.length}
                  </span>
                )}
              </h2>
            </div>

            {pending.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 text-center">
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-gray-500 dark:text-gray-400">No pending approvals. All caught up!</p>
              </div>
            ) : (
              pending.map((u) => (
                <div
                  key={u.user_id}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 mb-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{u.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 capitalize">
                          {u.role}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{u.email}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {u.id_number} · {u.department}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Registered {new Date(u.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                      {u.id_document_url ? (
                        <button
                          onClick={() => handleViewDocument(u.user_id)}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition"
                        >
                          📄 View Document
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500 italic px-3 py-1.5">
                          No document (institutional email)
                        </span>
                      )}

                      <button
                        disabled={actionLoading[u.user_id]}
                        onClick={() => handleApprove(u.user_id)}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {actionLoading[u.user_id] === 'approving' ? 'Approving...' : '✓ Approve'}
                      </button>

                      <button
                        disabled={actionLoading[u.user_id]}
                        onClick={() => {
                          setRejectModal({ userId: u.user_id, name: u.name });
                          setRejectReason('');
                        }}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {actionLoading[u.user_id] === 'rejecting' ? 'Rejecting...' : '✗ Reject'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>

      {rejectModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Reject {rejectModal?.name}?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Optionally provide a reason. The user will see this when they log in.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)"
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition resize-none mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setRejectModal(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleReject(rejectModal.userId, rejectReason);
                  setRejectModal(null);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
