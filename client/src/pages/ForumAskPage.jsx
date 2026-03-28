import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const tips = [
  'Search the forum first to see if your question has already been answered.',
  'Write a clear, specific title that summarizes your problem.',
  'Include what you already know or have tried.',
  'Add a topic tag so the right people can find your question.',
  'Be respectful and follow community guidelines.',
];

const notAllowed = [
  'Exam or quiz questions.',
  'Requests for someone to complete your assignment.',
  'Assessment materials shared by instructors.',
  'Personal or private information.',
];

export default function ForumAskPage() {
  useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    content: '',
    topic_tag: '',
    department_tag: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/forum/questions', {
        title: form.title.trim(),
        content: form.content.trim(),
        topic_tag: form.topic_tag.trim() || undefined,
        department_tag: form.department_tag || undefined,
      });
      showToast('Question posted successfully.');
      setTimeout(() => navigate(`/forum/${data.question.question_id}`), 1000);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to post question.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <Toast />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/forum"
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition mb-6"
        >
          ← Back to Forum
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ask a Question</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Get help from your Mabini Colleges community.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
              <form noValidate onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Question Title *
                  </label>
                  <p className="text-xs text-gray-400 mb-1">Be specific and clear about what you're asking.</p>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, title: e.target.value }));
                      if (errors.title) {
                        setErrors((prev) => ({ ...prev, title: '' }));
                      }
                    }}
                    placeholder="e.g. How do I solve differential equations step by step?"
                    className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition text-sm ${
                      errors.title
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-700 focus:ring-primary-500'
                    }`}
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                  <p className="text-xs text-gray-400 text-right mt-1">{form.title.length}/500</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Question Details *
                  </label>
                  <p className="text-xs text-gray-400 mb-1">
                    Include all relevant context, what you've tried, and what specifically you need help with.
                  </p>
                  <textarea
                    value={form.content}
                    rows={8}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, content: e.target.value }));
                      if (errors.content) {
                        setErrors((prev) => ({ ...prev, content: '' }));
                      }
                    }}
                    placeholder="Describe your question in detail. What have you tried? What do you understand so far?"
                    className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition text-sm resize-none ${
                      errors.content
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-700 focus:ring-primary-500'
                    }`}
                  />
                  {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
                  <p className="text-xs text-gray-400 text-right mt-1">{form.content.length} characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Topic Tag</label>
                  <p className="text-xs text-gray-400 mb-1">Optional. Add a subject or topic keyword.</p>
                  <input
                    type="text"
                    value={form.topic_tag}
                    onChange={(e) => setForm((prev) => ({ ...prev, topic_tag: e.target.value }))}
                    placeholder="e.g. Calculus, Programming, Accounting"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                  <p className="text-xs text-gray-400 mb-1">Optional. Filter this question to a specific department.</p>
                  <select
                    value={form.department_tag}
                    onChange={(e) => setForm((prev) => ({ ...prev, department_tag: e.target.value }))}
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

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-1">📋 Community Guidelines</p>
                  <p className="text-xs text-amber-600 dark:text-amber-500">
                    Do not post exam questions, quiz items, or requests for answers to graded assessments. All
                    questions must be academic and knowledge-related in nature.
                  </p>
                </div>

                <div className="flex gap-3 justify-end">
                  <Link
                    to="/forum"
                    className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium text-sm transition"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Posting...' : 'Post Question'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 h-fit">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">💡 Tips for a great question</h3>

              <div className="flex flex-col gap-3">
                {tips.map((tip) => (
                  <div key={tip} className="flex items-start gap-2">
                    <span className="text-primary-500 mt-0.5 shrink-0">✓</span>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">⚠️ Do not post</h3>
                <div className="flex flex-col gap-3">
                  {notAllowed.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5 shrink-0">✗</span>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
