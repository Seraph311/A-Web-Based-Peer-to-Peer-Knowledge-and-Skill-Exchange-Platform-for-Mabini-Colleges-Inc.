import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Toast, { showToast } from '../components/Toast';
import api from '../config/api';

export default function ProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [feedback, setFeedback] = useState([]);
  const [feedbackPagination, setFeedbackPagination] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 0, comment: '' });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const isOwnProfile = user?.user_id === parseInt(id, 10);

  const badgeEmoji = {
    Gold: '🥇', Silver: '🥈', Bronze: '🥉', Member: '🎓'
  };

  const tabs = ['overview', 'skills', 'feedback'];

  const fetchFeedback = async (page = 1) => {
    setFeedbackLoading(true);
    try {
      const { data } = await api.get(
        `/feedback/user/${id}?page=${page}&limit=10`
      );
      setFeedback(data.feedback);
      setFeedbackPagination(data.pagination);
      setFeedbackPage(page);
    } catch {
      showToast('Failed to load feedback.', 'error');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (feedbackForm.rating === 0) {
      showToast('Please select a rating.', 'error');
      return;
    }

    setSubmittingFeedback(true);
    try {
      await api.post('/feedback', {
        reviewed_user_id: parseInt(id, 10),
        rating: feedbackForm.rating,
        comment: feedbackForm.comment.trim() || undefined,
        feedback_type: 'direct',
      });
      showToast('Feedback submitted successfully!', 'success');
      setShowFeedbackModal(false);
      setFeedbackForm({ rating: 0, comment: '' });
      if (activeTab === 'overview') {
        setActiveTab('feedback');
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to submit feedback.', 'error');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/users/profile/${id}`);
        setProfile(data.profile);
      } catch (error) {
        if (error.response?.status === 404) {
          showToast('User not found.', 'error');
          navigate('/leaderboard');
        } else {
          showToast('Failed to load profile.', 'error');
        }
      } finally {
        setLoading(false);
      }
    };

    setActiveTab('overview');
    setFeedback([]);
    setFeedbackPage(1);
    fetchProfile();
  }, [id, navigate]);

  useEffect(() => {
    if (activeTab === 'feedback' && feedback.length === 0) {
      fetchFeedback(1);
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <Toast />
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <Toast />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 mb-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-20 h-20 rounded-2xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-3xl font-bold text-primary-700 dark:text-primary-300 shrink-0">
              {profile.name.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                  {badgeEmoji[profile.badge_level] || '🎓'} {profile.badge_level}
                </span>
                {isOwnProfile && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    You
                  </span>
                )}
              </div>

              <p className="text-gray-500 dark:text-gray-400 text-sm capitalize mb-3">
                {profile.role} · {profile.department}
              </p>

              <div className="flex flex-wrap gap-6">
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{profile.contribution_points}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">Points</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{profile.stats.total_answers}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">Answers</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {profile.stats.total_sessions_created + profile.stats.total_sessions_joined}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">Sessions</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {profile.average_rating ? `⭐ ${profile.average_rating}` : '—'}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">Avg Rating</span>
                </div>
              </div>

              <div className="mt-3">
                {profile.is_available ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                    Available for sessions
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 dark:text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
                    Not available
                  </span>
                )}
              </div>

              <div className="mt-4 flex gap-3 flex-wrap">
                {isOwnProfile ? (
                  <>
                    <Link
                      to="/settings"
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white transition"
                    >
                      Edit Profile
                    </Link>
                    <Link
                      to="/skills"
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition"
                    >
                      Manage Skills
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/sessions"
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white transition"
                    >
                      Browse Sessions
                    </Link>
                    <button
                      onClick={() => {
                        setFeedbackForm({ rating: 0, comment: '' });
                        setShowFeedbackModal(true);
                      }}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-yellow-500 hover:bg-yellow-600 text-white transition"
                    >
                      Leave Feedback
                    </button>
                  </>
                )}

                <p className="text-xs text-gray-400 dark:text-gray-500 ml-auto self-center">
                  Member since{' '}
                  {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-1 bg-white dark:bg-gray-900 rounded-2xl p-1 border border-gray-100 dark:border-gray-800 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition capitalize ${
                activeTab === tab
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">About</h2>
              <div className="flex flex-col gap-3 mt-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg w-8 text-center shrink-0">🎓</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 w-20">Role</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{profile.role}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg w-8 text-center shrink-0">🏫</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 w-20">Department</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{profile.department}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg w-8 text-center shrink-0">⭐</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 w-20">Rating</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {profile.average_rating ? `${profile.average_rating} / 5.00` : 'No ratings yet'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg w-8 text-center shrink-0">📅</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 w-20">Joined</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {new Date(profile.created_at).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Contributions</h2>
              <div className="flex flex-col gap-3 mt-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Forum Answers</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{profile.stats.total_answers}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Sessions Created</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{profile.stats.total_sessions_created}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Sessions Joined</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{profile.stats.total_sessions_joined}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Contribution Points</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{profile.contribution_points}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Badge Level</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {badgeEmoji[profile.badge_level] || '🎓'} {profile.badge_level}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          (profile.skills || []).length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 text-center">
              <div className="text-4xl mb-3">🏷️</div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {isOwnProfile
                  ? 'You have no skills registered yet.'
                  : `${profile.name} has no skills registered.`}
              </p>
              {isOwnProfile && (
                <Link
                  to="/skills"
                  className="inline-block mt-4 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition"
                >
                  Add Skills
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(profile.skills || []).map((s) => (
                <div key={s.skill_id} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{s.skill_name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.is_available
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {s.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  {s.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      {s.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'feedback' && (
          <>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex items-center gap-6 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {profile.average_rating ?? '—'}
                </div>
                <div className="text-xs text-gray-400 mt-1">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {feedbackPagination?.total ?? 0}
                </div>
                <div className="text-xs text-gray-400 mt-1">Total Reviews</div>
              </div>
              <div className="flex gap-1 items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-xl ${
                      star <= Math.round(profile.average_rating || 0)
                        ? 'text-yellow-400'
                        : 'text-gray-200 dark:text-gray-700'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            {feedbackLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : feedback.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 text-center">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">No feedback yet.</p>
              </div>
            ) : (
              <>
                {feedback.map((f) => (
                  <div key={f.feedback_id} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 mb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{f.reviewer_name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(f.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-sm ${
                              star <= f.rating
                                ? 'text-yellow-400'
                                : 'text-gray-200 dark:text-gray-700'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>

                    {f.comment && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mt-2">
                        "{f.comment}"
                      </p>
                    )}
                  </div>
                ))}

                {feedbackPagination && feedbackPagination.total_pages > 1 && (
                  <div className="flex items-center justify-between px-1 py-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Page {feedbackPage} of {feedbackPagination.total_pages} · {feedbackPagination.total} reviews
                    </p>
                    <div className="flex gap-2">
                      <button
                        disabled={feedbackPage <= 1}
                        onClick={() => fetchFeedback(feedbackPage - 1)}
                        className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        ← Previous
                      </button>
                      <button
                        disabled={feedbackPage >= feedbackPagination.total_pages}
                        onClick={() => fetchFeedback(feedbackPage + 1)}
                        className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Rate {profile?.name}</h3>
              <button
                onClick={() => setShowFeedbackModal(false)}
                aria-label="Close feedback modal"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl"
              >
                ×
              </button>
            </div>

            <div className="flex gap-2 justify-center my-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeedbackForm((prev) => ({ ...prev, rating: star }))}
                  className="text-3xl transition hover:scale-110"
                >
                  {star <= feedbackForm.rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
              {feedbackForm.rating === 0
                ? 'Select a rating'
                : feedbackForm.rating === 1
                  ? 'Poor'
                  : feedbackForm.rating === 2
                    ? 'Fair'
                    : feedbackForm.rating === 3
                      ? 'Good'
                      : feedbackForm.rating === 4
                        ? 'Very Good'
                        : 'Excellent'}
            </p>

            <textarea
              placeholder="Leave a comment (optional)"
              rows={3}
              value={feedbackForm.comment}
              onChange={(e) => setFeedbackForm((prev) => ({ ...prev, comment: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
            />

            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={submittingFeedback || feedbackForm.rating === 0}
                className="px-5 py-2.5 rounded-lg text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white transition disabled:opacity-60"
              >
                {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
