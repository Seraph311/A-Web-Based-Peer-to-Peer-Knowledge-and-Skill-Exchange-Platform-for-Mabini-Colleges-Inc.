import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Toast, { showToast } from '../components/Toast';
import api from '../config/api';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [filters, setFilters] = useState({
    status: '',
    content_type: '',
    page: 1,
  });

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.content_type) params.append('content_type', filters.content_type);
      params.append('page', filters.page);
      params.append('limit', 20);

      const { data } = await api.get(`/reports?${params.toString()}`);
      setReports(data.reports);
      setPagination(data.pagination);
    } catch {
      showToast('Failed to load reports.', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleUpdateStatus = async (reportId, newStatus) => {
    setActionLoading((prev) => ({ ...prev, [reportId]: newStatus }));
    try {
      await api.put(`/reports/${reportId}/status`, { status: newStatus });
      await fetchReports();
      showToast(`Report marked as ${newStatus}.`);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update report.', 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [reportId]: null }));
    }
  };

  const statusTabs = [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'dismissed', label: 'Dismissed' },
  ];

  const contentTypes = [
    { value: '', label: 'All Types' },
    { value: 'user', label: 'User' },
    { value: 'forum_question', label: 'Forum Question' },
    { value: 'forum_answer', label: 'Forum Answer' },
    { value: 'session', label: 'Session' },
    { value: 'message', label: 'Message' },
  ];

  const getReportedContentLink = (report) => {
    switch (report.content_type) {
      case 'user':
        return `/profile/${report.content_id}`;
      case 'forum_question':
        return `/forum/${report.content_id}`;
      case 'forum_answer':
        return `/forum/${report.content_id}#answer-${report.content_id}`;
      case 'session':
        return `/sessions/${report.content_id}`;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Review and manage user reports</p>
          </div>
          <Link
            to="/admin"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {statusTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilters((prev) => ({ ...prev, status: tab.value, page: 1 }))}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    filters.status === tab.value
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <select
              value={filters.content_type}
              onChange={(e) => setFilters((prev) => ({ ...prev, content_type: e.target.value, page: 1 }))}
              className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {contentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">No reports found.</p>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-4">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Reporter
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Reported
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {reports.map((report) => (
                    <tr key={report.report_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="px-4 py-3">
                        <Link
                          to={`/profile/${report.reporter_id}`}
                          className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                        >
                          {report.reporter_name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {getReportedContentLink(report) ? (
                          <Link
                            to={getReportedContentLink(report)}
                            className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                          >
                            {report.content_type} #{report.content_id}
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {report.content_type} #{report.content_id}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                          {report.content_type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{report.reason}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            report.status === 'pending'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                              : report.status === 'reviewed'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500">
                        {new Date(report.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {report.status === 'pending' && (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleUpdateStatus(report.report_id, 'reviewed')}
                              disabled={actionLoading[report.report_id]}
                              className="px-2 py-1 text-xs rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition disabled:opacity-60"
                            >
                              {actionLoading[report.report_id] === 'reviewed' ? '...' : 'Mark Reviewed'}
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(report.report_id, 'dismissed')}
                              disabled={actionLoading[report.report_id]}
                              className="px-2 py-1 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-60"
                            >
                              {actionLoading[report.report_id] === 'dismissed' ? '...' : 'Dismiss'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && pagination.total_pages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Page {filters.page} of {pagination.total_pages} · {pagination.total} reports
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={filters.page <= 1}
                    onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                    className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>
                  <button
                    disabled={filters.page >= pagination.total_pages}
                    onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
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
    </div>
  );
}