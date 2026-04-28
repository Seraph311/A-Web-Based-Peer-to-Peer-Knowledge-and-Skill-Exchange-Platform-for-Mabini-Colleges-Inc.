import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Toast, { showToast } from '../components/Toast';
import api from '../config/api';

const departments = [
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
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    title: '',
    content: '',
    topic_tag: '',
    department_tag: '',
  });
  const [questionErrors, setQuestionErrors] = useState({});
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editingAnswerContent, setEditingAnswerContent] = useState('');
  const [editingAnswerError, setEditingAnswerError] = useState('');
  const [savingAnswerId, setSavingAnswerId] = useState(null);
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

  const validateQuestionForm = (form) => {
    const errs = {};

    if (!form.title.trim()) {
      errs.title = 'Title is required.';
    } else if (form.title.trim().length < 10) {
      errs.title = 'Title must be at least 10 characters.';
    }

    if (!form.content.trim()) {
      errs.content = 'Question details are required.';
    } else if (form.content.trim().length < 20) {
      errs.content = 'Please provide at least 20 characters of detail.';
    }

    return errs;
  };

  const handleStartEditQuestion = () => {
    if (!question) {
      return;
    }
    setQuestionForm({
      title: question.title || '',
      content: question.content || '',
      topic_tag: question.topic_tag || '',
      department_tag: question.department_tag || '',
    });
    setQuestionErrors({});
    setIsEditingQuestion(true);
  };

  const handleCancelEditQuestion = () => {
    setIsEditingQuestion(false);
    setQuestionErrors({});
  };

  const handleSaveQuestion = async () => {
    const errs = validateQuestionForm(questionForm);
    if (Object.keys(errs).length > 0) {
      setQuestionErrors(errs);
      return;
    }

    setSavingQuestion(true);
    try {
      const { data } = await api.put(`/forum/questions/${id}`, {
        title: questionForm.title.trim(),
        content: questionForm.content.trim(),
        topic_tag: questionForm.topic_tag.trim() || null,
        department_tag: questionForm.department_tag || null,
      });
      setQuestion(data.question);
      setIsEditingQuestion(false);
      showToast('Question updated.');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update question.', 'error');
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleStartEditAnswer = (answer) => {
    setEditingAnswerId(answer.answer_id);
    setEditingAnswerContent(answer.content);
    setEditingAnswerError('');
  };

  const handleCancelEditAnswer = () => {
    setEditingAnswerId(null);
    setEditingAnswerContent('');
    setEditingAnswerError('');
  };

  const handleSaveAnswer = async (answerId) => {
    if (editingAnswerContent.trim().length === 0) {
      setEditingAnswerError('Answer cannot be empty.');
      return;
    }

    if (editingAnswerContent.trim().length < 10) {
      setEditingAnswerError('Answer must be at least 10 characters.');
      return;
    }

    setSavingAnswerId(answerId);
    try {
      const { data } = await api.put(`/forum/answers/${answerId}`, {
        content: editingAnswerContent.trim(),
      });
      setAnswers((prev) => prev.map((a) => (a.answer_id === answerId ? data.answer : a)));
      handleCancelEditAnswer();
      showToast('Answer updated.');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update answer.', 'error');
    } finally {
      setSavingAnswerId(null);
    }
  };

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
          {isEditingQuestion ? (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Question Title *
                </label>
                <input
                  type="text"
                  value={questionForm.title}
                  onChange={(e) => {
                    setQuestionForm((prev) => ({ ...prev, title: e.target.value }));
                    if (questionErrors.title) {
                      setQuestionErrors((prev) => ({ ...prev, title: '' }));
                    }
                  }}
                  className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition text-sm ${
                    questionErrors.title
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-700 focus:ring-primary-500'
                  }`}
                />
                {questionErrors.title && <p className="text-red-500 text-xs mt-1">{questionErrors.title}</p>}
                <p className="text-xs text-gray-400 text-right mt-1">{questionForm.title.length}/500</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Question Details *
                </label>
                <textarea
                  value={questionForm.content}
                  rows={7}
                  onChange={(e) => {
                    setQuestionForm((prev) => ({ ...prev, content: e.target.value }));
                    if (questionErrors.content) {
                      setQuestionErrors((prev) => ({ ...prev, content: '' }));
                    }
                  }}
                  className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition text-sm resize-none ${
                    questionErrors.content
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-700 focus:ring-primary-500'
                  }`}
                />
                {questionErrors.content && <p className="text-red-500 text-xs mt-1">{questionErrors.content}</p>}
                <p className="text-xs text-gray-400 text-right mt-1">{questionForm.content.length} characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Topic Tag</label>
                <input
                  type="text"
                  value={questionForm.topic_tag}
                  onChange={(e) => setQuestionForm((prev) => ({ ...prev, topic_tag: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                <select
                  value={questionForm.department_tag}
                  onChange={(e) => setQuestionForm((prev) => ({ ...prev, department_tag: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm"
                >
                  <option value="">Select department (optional)</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCancelEditQuestion}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium text-sm transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveQuestion}
                  disabled={savingQuestion}
                  className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {savingQuestion ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <>
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

              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
                {question.content}
              </p>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-400 dark:text-gray-500">Posted by User #{question.user_id}</span>
                <div className="flex items-center gap-2">
                  {question.user_id === user?.user_id && (
                    <button
                      onClick={handleStartEditQuestion}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition"
                    >
                      ✏️ Edit
                    </button>
                  )}
                  {(question.user_id === user?.user_id || user?.role === 'admin') && (
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition"
                    >
                      🗑️ Delete Question
                    </button>
                  )}
                  {question.updated_at && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      Edited
                    </span>
                  )}
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(question.updated_at || question.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </>
          )}
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
              {editingAnswerId === a.answer_id ? (
                <>
                  <textarea
                    value={editingAnswerContent}
                    onChange={(e) => {
                      setEditingAnswerContent(e.target.value);
                      setEditingAnswerError('');
                    }}
                    rows={5}
                    className={`w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none text-sm ${
                      editingAnswerError ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  <div className="flex items-center justify-between mt-1 mb-4">
                    <div>{editingAnswerError && <p className="text-red-500 text-xs">{editingAnswerError}</p>}</div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                      {editingAnswerContent.length} characters
                    </span>
                  </div>
                  <div className="flex gap-3 justify-end mb-2">
                    <button
                      onClick={handleCancelEditAnswer}
                      className="px-4 py-2 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveAnswer(a.answer_id)}
                      disabled={savingAnswerId === a.answer_id}
                      className="px-4 py-2 rounded-lg text-xs font-medium bg-primary-600 hover:bg-primary-700 text-white transition disabled:opacity-60"
                    >
                      {savingAnswerId === a.answer_id ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm mb-4">
                  {a.content}
                </p>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-xs font-bold text-primary-700 dark:text-primary-300">
                    {a.user_id}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">User #{a.user_id}</span>
                </div>
                <div className="flex items-center gap-2">
                  {editingAnswerId !== a.answer_id && a.user_id === user?.user_id && (
                    <button
                      onClick={() => handleStartEditAnswer(a)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition"
                    >
                      ✏️ Edit
                    </button>
                  )}
                  {a.updated_at && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      Edited
                    </span>
                  )}
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(a.updated_at || a.created_at).toLocaleString()}
                  </span>
                </div>
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
