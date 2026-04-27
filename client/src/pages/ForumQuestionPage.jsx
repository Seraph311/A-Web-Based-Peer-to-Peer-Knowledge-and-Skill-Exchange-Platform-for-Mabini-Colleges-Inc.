import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Toast, { showToast } from '../components/Toast';
import api from '../config/api';

export default function ForumQuestionPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [answerError, setAnswerError] = useState('');
  const answerRef = useRef(null);

  useEffect(() => {
    const fetchQuestionData = async () => {
      try {
        const [questionRes, answersRes] = await Promise.all([
          api.get(`/forum/questions/${id}`),
          api.get(`/forum/questions/${id}/answers`),
        ]);
        setQuestion(questionRes.data.question);
        setAnswers(answersRes.data.answers);
      } catch (error) {
        if (error.response?.status === 404) {
          showToast('Question not found.', 'error');
          navigate('/forum');
        } else {
          showToast('Failed to load question.', 'error');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionData();
  }, [id, navigate]);

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();

    if (answerContent.trim().length === 0) {
      setAnswerError('Answer cannot be empty.');
      answerRef.current?.focus();
      return;
    }

    if (answerContent.trim().length < 10) {
      setAnswerError('Answer must be at least 10 characters.');
      answerRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post(`/forum/questions/${id}/answers`, {
        content: answerContent,
      });
      setAnswers((prev) => [...prev, data.answer]);
      setAnswerContent('');
      setAnswerError('');
      showToast('Answer posted successfully.');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to post answer.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  async function handleDeleteQuestion() {
    setDeleting(true);
    try {
      await api.delete(`/forum/questions/${id}`);
      showToast('Question deleted.');
      navigate('/forum');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete question.', 'error');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <Toast />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <Toast />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <Toast />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/forum"
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition mb-6"
        >
          ← Back to Forum
        </Link>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-snug flex-1">{question.title}</h1>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {question.topic_tag && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                {question.topic_tag}
              </span>
            )}
            {question.department_tag && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                {question.department_tag}
              </span>
            )}
          </div>

          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">{question.content}</p>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-400 dark:text-gray-500">Posted by User #{question.user_id}</span>
            <div className="flex items-center gap-2">
              {(question.user_id === user?.user_id || user?.role === 'admin') && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition"
                >
                  🗑️ Delete Question
                </button>
              )}
              <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(question.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
          </h2>
        </div>

        {answers.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 text-center mb-6">
            <div className="text-4xl mb-3">🤔</div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">No answers yet. Be the first to help!</p>
          </div>
        ) : (
          answers.map((a) => (
            <div
              key={a.answer_id}
              className={`bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 mb-4 ${
                a.user_id === user?.user_id ? 'ring-2 ring-primary-300 dark:ring-primary-700' : ''
              }`}
            >
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm mb-4">{a.content}</p>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-xs font-bold text-primary-700 dark:text-primary-300">
                    {a.user_id}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">User #{a.user_id}</span>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(a.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
              <div className="text-4xl mb-4">🗑️</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete this question?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                This will permanently delete the question and all its answers. This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteQuestion}
                  disabled={deleting}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-60"
                >
                  {deleting ? 'Deleting...' : 'Delete Question'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Answer</h2>

          <textarea
            ref={answerRef}
            value={answerContent}
            onChange={(e) => {
              setAnswerContent(e.target.value);
              setAnswerError('');
            }}
            placeholder="Write a clear, helpful answer..."
            rows={6}
            className={`w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none text-sm ${
              answerError ? 'border-red-500 focus:ring-red-500' : ''
            }`}
          />

          <div className="flex items-center justify-between mt-1 mb-4">
            <div>{answerError && <p className="text-red-500 text-xs">{answerError}</p>}</div>
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{answerContent.length} characters</span>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
            📋 Answers must relate to the academic topic. Do not share exam questions, quiz answers, or graded
            assessment solutions.
          </p>

          <button
            onClick={handleSubmitAnswer}
            disabled={submitting || answerContent.trim().length === 0}
            className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Posting...' : 'Post Answer'}
          </button>
        </div>
      </div>
    </div>
  );
}
