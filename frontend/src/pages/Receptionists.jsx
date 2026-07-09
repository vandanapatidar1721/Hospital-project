import { useEffect, useState } from 'react';
import { Plus, Trash2, UserCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import api, { getApiErrorMessage } from '../services/api';
import Modal from '../components/Modal';
import LoadingSpinner, { EmptyState } from '../components/LoadingSpinner';

const emptyForm = { fullName: '', email: '', password: '', phone: '' };

export default function Receptionists() {
  const [receptionists, setReceptionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const onlyDigits = (value) => value.replace(/\D/g, '').slice(0, 10);

  const fetchReceptionists = async () => {
    setLoading(true);
    try {
      await api.post('/users/sync-role-documents').catch(() => null);
      const { data } = await api.get('/users', { params: { role: 'receptionist' } });
      setReceptionists(data.data);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load receptionists'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReceptionists(); }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/receptionist', form);
      await api.post('/users/sync-role-documents').catch(() => null);
      toast.success('Receptionist added');
      setModalOpen(false);
      fetchReceptionists();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to add receptionist'));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this receptionist?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('Receptionist deleted');
      fetchReceptionists();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Delete failed'));
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receptionists</h1>
          <p className="text-gray-500 text-sm mt-1">Add and manage front-desk receptionist accounts.</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Receptionist
        </button>
      </div>

      {loading ? <LoadingSpinner /> : receptionists.length === 0 ? (
        <EmptyState message="No receptionists found" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Phone</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {receptionists.map((r) => (
                <tr key={r._id} className="border-b last:border-0">
                  <td className="py-3 pr-4 font-medium flex items-center gap-2"><UserCheck className="w-4 h-4 text-primary-600" /> {r.fullName}</td>
                  <td className="py-3 pr-4">{r.email}</td>
                  <td className="py-3 pr-4">{r.phone || r.receptionistProfile?.phone || '-'}</td>
                  <td className="py-3 pr-4"><span className={`badge ${r.isActive ? 'badge-completed' : 'badge-cancelled'}`}>{r.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="py-3"><button onClick={() => handleDelete(r._id)} className="icon-btn-danger" title="Delete receptionist"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Receptionist" size="lg">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Full Name</label><input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input-field" required /></div>
          <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" required /></div>
          <div><label className="block text-sm font-medium mb-1">Password</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" required minLength={6} /></div>
          <div><label className="block text-sm font-medium mb-1">Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: onlyDigits(e.target.value) })} className="input-field" inputMode="numeric" pattern="\d{10}" maxLength={10} required /></div>
          <div className="sm:col-span-2 flex flex-col sm:flex-row justify-end gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Receptionist</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
