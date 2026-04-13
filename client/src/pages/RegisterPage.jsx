import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Toast, { showToast } from '../components/Toast';
import api from '../config/api';

const INSTITUTIONAL_DOMAIN = 'mabinicolleges.edu.ph';
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

export default function RegisterPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState('register');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    role: 'student',
    idNumber: '',
  });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const isInstitutional =
    form.email.endsWith(`@${INSTITUTIONAL_DOMAIN}`) &&
    form.role !== 'instructor';

  useEffect(() => {
    if (user?.status === 'approved') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const validationErrors = {};
    if (!form.name.trim()) validationErrors.name = 'Full name is required.';
    if (!form.email.trim()) validationErrors.email = 'Email is required.';
    if (!form.password) validationErrors.password = 'Password is required.';
    if (form.password && form.password.length < 8) {
      validationErrors.password = 'Password must be at least 8 characters.';
    }
    if (form.confirmPassword !== form.password) {
      validationErrors.confirmPassword = 'Passwords do not match.';
    }
    if (form.department === '') validationErrors.department = 'Please select your department.';
    if (!form.idNumber.trim()) validationErrors.idNumber = 'ID number is required.';
    if (!isInstitutional && !file) validationErrors.file = 'Verification document is required.';

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('password', form.password);
      formData.append('department', form.department);
      formData.append('role', form.role);
      formData.append('id_number', form.idNumber);
      if (file) {
        formData.append('id_document', file);
      }

      const { data } = await api.post('/auth/register', formData);

      if (data.requires_otp === true) {
        setRegisteredEmail(form.email);
        setStep('otp');
        showToast('OTP sent to your institutional email.');
      } else if (data.requires_otp === false) {
        showToast('Registration submitted. Awaiting admin approval.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        showToast('Registration submitted. Awaiting admin approval.');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setOtpError('Enter the 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/verify-otp', {
        email: registeredEmail,
        otp,
      });
      showToast('Email verified! Your account is now active.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      const msg = error.response?.data?.message || 'Verification failed.';
      setOtpError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await api.post('/auth/resend-otp', { email: registeredEmail });
      showToast('A new OTP has been sent.');
      setResendCooldown(60);
      setOtp('');
    } catch (error) {
      const msg = error.response?.data?.message || 'Could not resend OTP.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    'w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <Toast />

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-8 w-full max-w-lg border border-gray-100 dark:border-gray-800">
          {step === 'register' ? (
            <>
              <div className="text-center mb-8">
                <div className="text-2xl font-bold mb-1">
                  <span className="text-primary-600 dark:text-primary-400">Study</span>
                  <span className="text-gray-800 dark:text-white">Bridge</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Create your account</p>
              </div>

              <form noValidate onSubmit={handleRegister}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Juan dela Cruz"
                    className={`${inputBase} ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

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
                    className={`${inputBase} ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {isInstitutional && (
                    <p className="text-primary-600 dark:text-primary-400 text-xs mt-1 flex items-center gap-1">
                      ✓ Institutional email detected — instant approval via OTP.
                    </p>
                  )}
                  {!isInstitutional && form.email.length > 0 && (
                    <p className="text-gray-400 text-xs mt-1">
                      Using a non-institutional email requires document upload and admin approval.
                    </p>
                  )}
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      id="password"
                      value={form.password}
                      onChange={handleChange}
                      className={`${inputBase} pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm select-none"
                    >
                      {showPw ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCpw ? 'text' : 'password'}
                      id="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className={`${inputBase} pr-10 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCpw((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm select-none"
                    >
                      {showCpw ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="department"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Department
                  </label>
                  <select
                    id="department"
                    value={form.department}
                    onChange={(e) => {
                      setForm((prev) => ({
                        ...prev,
                        department: e.target.value,
                      }));
                      if (errors.department) {
                        setErrors((prev) => ({ ...prev, department: '' }));
                      }
                    }}
                    className={`${inputBase} ${errors.department ? 'border-red-500 focus:ring-red-500' : ''}`}
                  >
                    <option value="">Select your department</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
                </div>

                <div className="mb-4">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <select
                    id="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="alumni">Alumni</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="idNumber"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    ID Number
                  </label>
                  <input
                    type="text"
                    id="idNumber"
                    value={form.idNumber}
                    onChange={handleChange}
                    placeholder="e.g. 2021-00123"
                    className={`${inputBase} ${errors.idNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {errors.idNumber && <p className="text-red-500 text-xs mt-1">{errors.idNumber}</p>}
                </div>

                {!isInstitutional && (
                  <div className="mb-4">
                    <div
                      className="rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-5 hover:border-primary-400 dark:hover:border-primary-600 transition cursor-pointer"
                      onClick={() => document.getElementById('id-document').click()}
                    >
                      <input
                        type="file"
                        id="id-document"
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          const selectedFile = e.target.files?.[0] || null;
                          setFile(selectedFile);
                          if (errors.file) {
                            setErrors((prev) => ({ ...prev, file: '' }));
                          }
                        }}
                      />
                      <div className="text-center">
                        <div className="text-3xl mb-2">📄</div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {file ? file.name : 'Click to upload verification document'}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          School ID, Enrollment Form / COR, Employee ID, or Alumni document · JPEG, PNG, PDF · Max
                          5MB
                        </p>
                      </div>
                    </div>
                    {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file}</p>}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <div className="text-center">
              <div className="text-4xl mb-4">📬</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verify your email</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">We sent a 6-digit code to:</p>
              <p className="text-primary-600 dark:text-primary-400 font-semibold text-sm mb-6">{registeredEmail}</p>

              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ''));
                  setOtpError('');
                }}
                placeholder="000000"
                className="w-full text-center text-3xl font-bold tracking-[0.5em] px-4 py-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
              {otpError && <p className="text-red-500 text-xs mt-2">{otpError}</p>}

              <button
                type="button"
                disabled={loading || otp.length !== 6}
                onClick={handleVerifyOtp}
                className="w-full py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed mt-4"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                {resendCooldown > 0 ? (
                  <p>Resend available in {resendCooldown}s</p>
                ) : (
                  <p>
                    Didn&apos;t receive it?{' '}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
                    >
                      Resend OTP
                    </button>
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setStep('register')}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition mt-4"
              >
                ← Back to registration
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
