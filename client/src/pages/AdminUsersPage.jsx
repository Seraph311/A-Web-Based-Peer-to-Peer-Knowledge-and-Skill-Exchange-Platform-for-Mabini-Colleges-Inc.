import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Toast, { showToast } from '../components/Toast';
import api from '../config/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    role: '',
    department: '',
    page: 1,
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.role) params.append('role', filters.role);
      if (filters.department) params.append('department', filters.department);
      params.append('page', filters.page);
      params.append('limit', 20);

      const { data } = await api.get(`/admin/users?${params.toString()}`);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch {
      showToast('Failed to load users.', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleApprove = async (userId) => {
    setActionLoading((prev) => ({ ...prev, [userId]: 'approving' }));
    try {
      await api.put(`/admin/users/${userId}/approve`);
      await fetchUsers();
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
      await fetchUsers();
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
    } catch {
      showToast('Could not load document.', 'error');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <Toast />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Users</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{pagination?.total ?? 0} total users</p>
          </div>
          <Link
            to="/admin"
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium transition"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 mb-6 flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Role</label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="alumni">Alumni</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Department</label>
            <input
              type="text"
              placeholder="Filter by department"
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            {users.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-400 dark:text-gray-500">No users found matching the current filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID Number</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Registered</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {users.map((u) => (
                      <tr key={u.user_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                        <td className="px-5 py-4">
                          <div className="font-medium text-gray-900 dark:text-white">{u.name}</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">{u.email}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                              u.role === 'admin'
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                                : u.role === 'instructor'
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                  : u.role === 'alumni'
                                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-gray-600 dark:text-gray-300">{u.department}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-gray-600 dark:text-gray-300 font-mono text-xs">{u.id_number}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                              u.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : u.status === 'approved'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-gray-500 dark:text-gray-400 text-xs">
                            {new Date(u.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {u.id_document_url && (
                              <button
                                onClick={() => handleViewDocument(u.user_id)}
                                className="text-xs px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition"
                              >
                                📄 Doc
                              </button>
                            )}

                            {u.status !== 'approved' && (
                              <button
                                onClick={() => handleApprove(u.user_id)}
                                disabled={actionLoading[u.user_id]}
                                className="text-xs px-2 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white transition disabled:opacity-60"
                              >
                                {actionLoading[u.user_id] === 'approving' ? '...' : '✓'}
                              </button>
                            )}

                            {u.status !== 'rejected' && u.role !== 'admin' && (
                              <button
                                onClick={() => {
                                  setRejectModal({ userId: u.user_id, name: u.name });
                                  setRejectReason('');
                                }}
                                disabled={actionLoading[u.user_id]}
                                className="text-xs px-2 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-60"
                              >
                                {actionLoading[u.user_id] === 'rejecting' ? '...' : '✗'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pagination && pagination.total_pages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Page {pagination.page} of {pagination.total_pages} · {pagination.total} users
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
          </div>
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
