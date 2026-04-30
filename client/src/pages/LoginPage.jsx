import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Toast, { showToast } from '../components/Toast';
import api from '../config/api';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (user?.status === 'approved') {
      navigate('/dashboard');
    } else if (user?.status === 'pending') {
      navigate('/pending');
    } else if (user?.status === 'rejected') {
      navigate('/rejected');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) {
      newErrors.email = 'Email is required.';
    }
    if (!form.password.trim()) {
      newErrors.password = 'Password is required.';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', {
        email: form.email,
        password: form.password
      });

      login(data.token, data.user);

      if (data.user.status === 'pending') {
        showToast('Your account is pending admin approval.', 'error');
        navigate('/pending');
      } else if (data.user.status === 'rejected') {
        showToast('Your account was rejected. Please re-register.', 'error');
        navigate('/rejected');
      } else if (data.user.status === 'approved') {
        showToast('Welcome back, ' + data.user.name + '!');
        if (data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <Toast />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-8 w-full max-w-md border border-gray-100 dark:border-gray-800">
          <div className="text-center mb-8">
            <div className="text-2xl font-heading font-bold mb-2">
              <span className="text-primary-600 dark:text-primary-400">Study</span>
              <span className="text-gray-800 dark:text-white">Bridge</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-body">
              Welcome back. Ready to continue your learning journey?
            </p>
          </div>

          <form noValidate onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email address
              </label>
              <input
                type="email"
                id="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 font-body ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  id="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  className={`w-full px-4 py-3 pr-10 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 font-body ${
                    errors.password
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm select-none"
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div className="flex justify-end mb-4">
              <span className="text-xs text-gray-400 dark:text-gray-500 cursor-not-allowed select-none">
                Forgot password? (coming soon)
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-heading font-semibold transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-2 hover:shadow-lg hover:shadow-primary-200 dark:hover:shadow-primary-900/50 hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
