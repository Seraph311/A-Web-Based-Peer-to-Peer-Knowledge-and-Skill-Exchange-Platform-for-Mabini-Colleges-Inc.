import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Toast, { showToast } from '../components/Toast';
import api from '../config/api';

const departments = [
  'All',
  'Graduate Program',
  'College of Education',
  'College of Business Administration and Accountancy',
  'College of Computer Studies',
  'College of Nursing and Midwifery',
  'College of Criminal Justice Education',
  'College of Liberal Arts',
  'Technical Education and Training Department',
  'High School Department',
];

export default function ForumPage() {
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword: '',
    department_tag: '',
    page: 1,
  });
  const [searchInput, setSearchInput] = useState('');

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.keyword) params.append('keyword', filters.keyword);
      if (filters.department_tag) params.append('department_tag', filters.department_tag);
      params.append('page', filters.page);
      params.append('limit', 15);

      const { data } = await api.get(`/forum/questions?${params.toString()}`);
      setQuestions(data.questions);
      setPagination(data.pagination);
    } catch {
      showToast('Failed to load questions.', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, keyword: searchInput, page: 1 }));
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setFilters((prev) => ({ ...prev, keyword: '', page: 1 }));
  };

  const handleDepartmentFilter = (value) => {
    setFilters((prev) => ({ ...prev, department_tag: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <Toast />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Community Forum</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Ask questions, share knowledge, help your peers.
            </p>
          </div>

          <Link
            to="/forum/ask"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm transition shadow-sm shadow-primary-200 dark:shadow-primary-900"
          >
            ✏️ Ask a Question
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 mb-6">
          <form onSubmit={handleSearch} className="flex gap-3 flex-1">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search questions by keyword..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition"
            >
              Search
            </button>
            {filters.keyword && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium transition"
              >
                Clear
              </button>
            )}
          </form>

          <div className="flex flex-wrap gap-2 mt-3">
            {departments.map((dept) => {
              const isActive = (dept === 'All' && !filters.department_tag) || dept === filters.department_tag;
              return (
                <button
                  key={dept}
                  type="button"
                  onClick={() => handleDepartmentFilter(dept === 'All' ? '' : dept)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {dept}
                </button>
              );
            })}
          </div>
        </div>

        {(filters.keyword || filters.department_tag) && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs text-gray-500 dark:text-gray-400">Filters:</span>
            {filters.keyword && (
              <span className="px-2 py-1 rounded-full text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 flex items-center gap-1">
                &quot;{filters.keyword}&quot;
                <button onClick={handleClearSearch} className="hover:text-primary-900 ml-1">
                  ×
                </button>
              </span>
            )}
            {filters.department_tag && (
              <span className="px-2 py-1 rounded-full text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 flex items-center gap-1">
                {filters.department_tag}
                <button onClick={() => handleDepartmentFilter('')} className="hover:text-primary-900 ml-1">
                  ×
                </button>
              </span>
            )}
            {pagination && (
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{pagination.total} result(s)</span>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 border border-gray-100 dark:border-gray-800 text-center">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No questions found</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              {filters.keyword || filters.department_tag
                ? 'Try adjusting your search or filters.'
                : 'Be the first to ask a question!'}
            </p>
            <Link
              to="/forum/ask"
              className="inline-flex px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm transition"
            >
              Ask a Question
            </Link>
          </div>
        ) : (
          <>
            {questions.map((q) => (
              <Link
                key={q.question_id}
                to={`/forum/${q.question_id}`}
                className="group block bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all duration-200 mb-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 line-clamp-2">
                    {q.title}
                  </h3>
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {new Date(q.created_at).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mt-2">{q.content}</p>

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {q.topic_tag && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                      {q.topic_tag}
                    </span>
                  )}
                  {q.department_tag && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      {q.department_tag}
                    </span>
                  )}
                </div>
              </Link>
            ))}

            {pagination && pagination.total_pages > 1 && (
              <div className="flex items-center justify-between mt-6">
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
          </>
        )}
      </div>
    </div>
  );
}
