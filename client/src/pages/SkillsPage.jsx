import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Toast, { showToast } from '../components/Toast';
import api from '../config/api';

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [addForm, setAddForm] = useState({
    skill_name: '', description: ''
  });
  const [editForm, setEditForm] = useState({
    skill_name: '', description: '', is_available: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchMySkills = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/skills/me');
        setSkills(data.skills);
      } catch {
        showToast('Failed to load skills.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchMySkills();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const { data } = await api.get(
        `/skills/search?keyword=${encodeURIComponent(searchQuery)}`
      );
      setSearchResults(data.results);
    } catch {
      showToast('Search failed.', 'error');
    } finally {
      setSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!addForm.skill_name.trim()) {
      setFormErrors({ skill_name: 'Skill name is required.' });
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/skills', {
        skill_name: addForm.skill_name.trim(),
        description: addForm.description.trim() || undefined
      });
      setSkills((prev) => [...prev, data.skill]);
      setShowAddModal(false);
      setAddForm({ skill_name: '', description: '' });
      showToast('Skill added successfully.');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to add skill.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSkill = async (e) => {
    e.preventDefault();
    if (!editForm.skill_name.trim()) {
      setFormErrors({ skill_name: 'Skill name is required.' });
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.put(`/skills/${editTarget.skill_id}`, {
        skill_name: editForm.skill_name.trim(),
        description: editForm.description.trim() || undefined,
        is_available: editForm.is_available
      });
      setSkills((prev) => prev.map((s) =>
        s.skill_id === editTarget.skill_id ? data.skill : s
      ));
      setEditTarget(null);
      showToast('Skill updated successfully.');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update skill.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    setActionLoading((prev) => ({ ...prev, [skillId]: true }));
    try {
      await api.delete(`/skills/${skillId}`);
      setSkills((prev) => prev.filter((s) => s.skill_id !== skillId));
      setDeleteTarget(null);
      showToast('Skill deleted.');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete skill.', 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [skillId]: false }));
    }
  };

  const handleToggleAvailability = async (skill) => {
    setActionLoading((prev) => ({ ...prev, [skill.skill_id]: true }));
    try {
      const { data } = await api.put(`/skills/${skill.skill_id}`, {
        is_available: !skill.is_available
      });
      setSkills((prev) => prev.map((s) =>
        s.skill_id === skill.skill_id ? data.skill : s
      ));
    } catch {
      showToast('Failed to update availability.', 'error');
    } finally {
      setActionLoading((prev) => ({
        ...prev, [skill.skill_id]: false
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <Toast />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Skills</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Manage the skills you can offer and find peers to learn from.
            </p>
          </div>
          <button
            onClick={() => {
              setAddForm({ skill_name: '', description: '' });
              setFormErrors({});
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm transition"
          >
            + Add Skill
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">My Skills</h2>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : skills.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 text-center">
                <div className="text-4xl mb-3">🏷️</div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                  You haven&apos;t registered any skills yet.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition"
                >
                  Add Your First Skill
                </button>
              </div>
            ) : (
              skills.map((s) => (
                <div key={s.skill_id} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 mb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{s.skill_name}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            s.is_available
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                          }`}
                        >
                          {s.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      {s.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                          {s.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => handleToggleAvailability(s)}
                      disabled={actionLoading[s.skill_id]}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition disabled:opacity-60 ${
                        s.is_available
                          ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                          : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                      }`}
                    >
                      {s.is_available ? 'Set Unavailable' : 'Set Available'}
                    </button>

                    <button
                      onClick={() => {
                        setEditTarget(s);
                        setEditForm({
                          skill_name: s.skill_name,
                          description: s.description || '',
                          is_available: s.is_available
                        });
                        setFormErrors({});
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => setDeleteTarget(s)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Find Peers by Skill</h2>

            <form onSubmit={handleSearch} className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a skill or topic..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              </div>
              <button
                type="submit"
                disabled={searching}
                className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition disabled:opacity-60"
              >
                {searching ? '...' : 'Search'}
              </button>
              {searchResults.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium transition"
                >
                  Clear
                </button>
              )}
            </form>

            {searchResults.length === 0 && searchQuery && !searching ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">No peers found for "{searchQuery}".</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 text-center">
                <div className="text-4xl mb-3">🤝</div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Search for a skill to find peers who can help you.
                </p>
              </div>
            ) : (
              searchResults.map((r) => (
                <div
                  key={`${r.skill_id}-${r.user.user_id}`}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 mb-3 hover:border-primary-300 dark:hover:border-primary-700 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white text-sm">{r.user.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                          {r.skill_name}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {r.user.department} · {r.user.badge_level}
                      </p>
                      {r.description && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">
                          "{r.description}"
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-yellow-500 text-xs">⭐</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {r.user.average_rating
                            ? `${r.user.average_rating} rating`
                            : 'No ratings yet'}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/profile/${r.user.user_id}`}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium bg-primary-600 hover:bg-primary-700 text-white transition shrink-0"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Skill</h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                aria-label="Close add skill modal"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl"
              >
                ×
              </button>
            </div>

            <form noValidate onSubmit={handleAddSkill}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skill Name *</label>
                <input
                  type="text"
                  value={addForm.skill_name}
                  onChange={(e) => {
                    setAddForm((prev) => ({ ...prev, skill_name: e.target.value }));
                    if (formErrors.skill_name) {
                      setFormErrors((prev) => ({ ...prev, skill_name: '' }));
                    }
                  }}
                  placeholder="e.g. Calculus, Python, Business Law"
                  className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition ${
                    formErrors.skill_name
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-700 focus:ring-primary-500'
                  }`}
                />
                {formErrors.skill_name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.skill_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description (optional)</label>
                <textarea
                  rows={3}
                  value={addForm.description}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Briefly describe what you can help with..."
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end mt-5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white transition disabled:opacity-60"
                >
                  {submitting ? 'Adding...' : 'Add Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Skill</h2>
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                aria-label="Close edit skill modal"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl"
              >
                ×
              </button>
            </div>

            <form noValidate onSubmit={handleEditSkill}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skill Name *</label>
                <input
                  type="text"
                  value={editForm.skill_name}
                  onChange={(e) => {
                    setEditForm((prev) => ({ ...prev, skill_name: e.target.value }));
                    if (formErrors.skill_name) {
                      setFormErrors((prev) => ({ ...prev, skill_name: '' }));
                    }
                  }}
                  placeholder="e.g. Calculus, Python, Business Law"
                  className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition ${
                    formErrors.skill_name
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-700 focus:ring-primary-500'
                  }`}
                />
                {formErrors.skill_name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.skill_name}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description (optional)</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Briefly describe what you can help with..."
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Availability</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditForm((prev) => ({ ...prev, is_available: true }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                      editForm.is_available
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    ✓ Available
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm((prev) => ({ ...prev, is_available: false }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                      !editForm.is_available
                        ? 'bg-gray-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    ✗ Unavailable
                  </button>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-5">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white transition disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <div className="text-4xl mb-4">🗑️</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete "{deleteTarget?.skill_name}"?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 mt-2">
              This skill will be permanently removed. Any sessions linked to this skill will be unaffected.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSkill(deleteTarget.skill_id)}
                disabled={actionLoading[deleteTarget?.skill_id]}
                className="px-5 py-2.5 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-60"
              >
                {actionLoading[deleteTarget?.skill_id] ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
