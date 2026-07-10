import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api, { getApiErrorMessage } from '../services/api';

export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Password changed successfully');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to change password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-0 w-full max-w-md mx-auto pt-2 sm:pt-0">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Change Password</h1>
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
          <div>
            <label className="compact-label text-gray-700">Current Password</label>
            <input
              type="password"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              className="compact-field"
              autoComplete="current-password"
              required
            />
          </div>
          <div>
            <label className="compact-label text-gray-700">New Password</label>
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              className="compact-field"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>
          <div>
            <label className="compact-label text-gray-700">Confirm New Password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="compact-field"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary compact-button w-full gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
