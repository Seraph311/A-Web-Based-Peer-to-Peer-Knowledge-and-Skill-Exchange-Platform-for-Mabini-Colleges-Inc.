import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Toast, { showToast } from '../components/Toast';
import api from '../config/api';

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition';

function capitalize(value) {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    department: user?.department || '',
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [availability, setAvailability] = useState(user?.is_available ?? true);
  const [savingAvailability, setSavingAvailability] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    api
      .get('/users/me')
      .then(({ data }) => {
        const p = data.profile;
        setProfileForm({
          name: p.name || '',
          department: p.department || '',
        });
        setAvailability(p.is_available ?? true);
        updateUser({ ...user, ...p });
      })
      .catch(() => {});
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    const errs = {};
    if (!profileForm.name.trim()) {
      errs.name = 'Name is required.';
    }
    if (!profileForm.department.trim()) {
      errs.department = 'Department is required.';
    }

    if (Object.keys(errs).length > 0) {
      setProfileErrors(errs);
      return;
    }

    setSavingProfile(true);
    try {
      const { data } = await api.put('/users/me', {
        name: profileForm.name.trim(),
        department: profileForm.department.trim(),
      });
      updateUser({ ...user, ...data.user });
      showToast('Profile updated successfully.');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveAvailability = async (value) => {
    setSavingAvailability(true);
    try {
      await api.put('/users/me/availability', { is_available: value });
      setAvailability(value);
      updateUser({ ...user, is_available: value });
      showToast(
        value ? 'You are now available for sessions.' : 'You are now unavailable for sessions.'
      );
    } catch {
      showToast('Failed to update availability.', 'error');
    } finally {
      setSavingAvailability(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();

    const errs = {};
    if (!passwordForm.currentPassword) {
      errs.currentPassword = 'Current password is required.';
    }
    if (!passwordForm.newPassword) {
      errs.newPassword = 'New password is required.';
    } else if (passwordForm.newPassword.length < 8) {
      errs.newPassword = 'New password must be at least 8 characters.';
    }
    if (passwordForm.confirmPassword !== passwordForm.newPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errs).length > 0) {
      setPasswordErrors(errs);
      return;
    }

    setSavingPassword(true);
    try {
      await api.put('/users/me/password', {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      showToast('Password changed successfully.');
    } catch (error) {
      if (error.response?.status === 404) {
        showToast('Password change is not yet available.', 'error');
        return;
      }

      const msg = error.response?.data?.message || 'Failed to change password.';
      if (error.response?.status === 400 || error.response?.status === 401) {
        setPasswordErrors({ currentPassword: msg });
      } else {
        showToast(msg, 'error');
      }
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const statusColorClass =
    user?.status === 'approved'
      ? 'text-green-600 dark:text-green-400'
      : user?.status === 'pending'
        ? 'text-yellow-600 dark:text-yellow-400'
        : user?.status === 'rejected'
          ? 'text-red-600 dark:text-red-400'
          : '';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <Toast />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Manage your profile, availability, and account settings.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 mb-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Profile Information</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Update your display name and department.
            </p>
          </div>

          <form noValidate onSubmit={handleSaveProfile}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => {
                  const value = e.target.value;
                  setProfileForm((prev) => ({ ...prev, name: value }));
                  if (profileErrors.name) {
                    setProfileErrors((prev) => ({ ...prev, name: '' }));
                  }
                }}
                className={`${inputClass} ${profileErrors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {profileErrors.name && <p className="text-red-500 text-xs mt-1">{profileErrors.name}</p>}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
              <input
                type="text"
                value={profileForm.department}
                placeholder="e.g. College of Computer Studies"
                onChange={(e) => {
                  const value = e.target.value;
                  setProfileForm((prev) => ({ ...prev, department: value }));
                  if (profileErrors.department) {
                    setProfileErrors((prev) => ({ ...prev, department: '' }));
                  }
                }}
                className={`${inputClass} ${profileErrors.department ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {profileErrors.department && (
                <p className="text-red-500 text-xs mt-1">{profileErrors.department}</p>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
                <div className="px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm border border-gray-200 dark:border-gray-700">
                  {user?.email}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Role</label>
                <div className="px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm border border-gray-200 dark:border-gray-700">
                  {capitalize(user?.role)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">ID Number</label>
                <div className="px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm border border-gray-200 dark:border-gray-700">
                  {user?.id_number}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Account Status
                </label>
                <div
                  className={`px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm border border-gray-200 dark:border-gray-700 ${statusColorClass}`}
                >
                  {capitalize(user?.status)}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm transition disabled:opacity-60"
              >
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 mb-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Session Availability</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Control whether other users can find and request sessions with you.
            </p>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {availability ? 'Available for sessions' : 'Not available for sessions'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {availability
                  ? 'Other users can find you in skill searches.'
                  : 'You are hidden from skill searches.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleSaveAvailability(!availability)}
              disabled={savingAvailability}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none disabled:opacity-60 ${
                availability ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                  availability ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 mb-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Change Password</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Choose a strong password for your account.
            </p>
          </div>

          <form noValidate onSubmit={handleSavePassword}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPasswordForm((prev) => ({ ...prev, currentPassword: value }));
                    if (passwordErrors.currentPassword) {
                      setPasswordErrors((prev) => ({ ...prev, currentPassword: '' }));
                    }
                  }}
                  className={`${inputClass} pr-10 ${
                    passwordErrors.currentPassword ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm select-none"
                >
                  {showCurrentPw ? 'Hide' : 'Show'}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword}</p>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPasswordForm((prev) => ({ ...prev, newPassword: value }));
                    if (passwordErrors.newPassword) {
                      setPasswordErrors((prev) => ({ ...prev, newPassword: '' }));
                    }
                  }}
                  className={`${inputClass} pr-10 ${passwordErrors.newPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm select-none"
                >
                  {showNewPw ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Minimum 8 characters.</p>
              {passwordErrors.newPassword && (
                <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPasswordForm((prev) => ({ ...prev, confirmPassword: value }));
                    if (passwordErrors.confirmPassword) {
                      setPasswordErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }
                  }}
                  className={`${inputClass} pr-10 ${
                    passwordErrors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm select-none"
                >
                  {showConfirmPw ? 'Hide' : 'Show'}
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword}</p>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={savingPassword}
                className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm transition disabled:opacity-60"
              >
                {savingPassword ? 'Saving...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 mb-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Account</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Manage your session and account.
            </p>
          </div>

          <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Sign out</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Sign out of your account on this device.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition"
            >
              Sign Out
            </button>
          </div>

          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">View my public profile</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                See how other users see your profile.
              </p>
            </div>
            <Link
              to={`/profile/${user?.user_id}`}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white transition"
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="hidden">
          <button type="button" onClick={() => setShowDeleteModal(false)}>
            close
          </button>
        </div>
      )}
    </div>
  );
}
