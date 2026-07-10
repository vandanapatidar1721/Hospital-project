import { useEffect, useState } from 'react';
import { Plus, Trash2, UserCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import api, { getApiErrorMessage } from '../services/api';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { EmptyState, TableSkeleton } from '../components/LoadingSpinner';

const emptyForm = { fullName: '', email: '', password: '', phone: '' };

export default function Receptionists() {
  const [receptionists, setReceptionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const onlyDigits = (value) => value.replace(/\D/g, '').slice(0, 10);

  const fetchReceptionists = async () => {
    setLoading(true);
    try {
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
      toast.success('Receptionist added');
      setModalOpen(false);
      fetchReceptionists();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to add receptionist'));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      await api.delete(`/users/${deleteId}`);
      toast.success('Receptionist deleted');
      setDeleteId(null);
      fetchReceptionists();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Delete failed'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receptionists</h1>
          <p className="text-gray-500 text-sm mt-1">Add and manage front-desk receptionist accounts.</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Add Receptionist
        </button>
      </div>

      {loading ? <TableSkeleton rows={6} columns={5} /> : receptionists.length === 0 ? (
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
                  <td className="py-3"><button onClick={() => setDeleteId(r._id)} className="icon-btn-danger" title="Delete receptionist"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Receptionist" size="md">
        <form onSubmit={handleSubmit} className="compact-form">
          <div><label className="compact-label">Full Name</label><input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="compact-field" required /></div>
          <div><label className="compact-label">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="compact-field" required /></div>
          <div><label className="compact-label">Password</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="compact-field" required minLength={6} /></div>
          <div><label className="compact-label">Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: onlyDigits(e.target.value) })} className="compact-field" inputMode="numeric" pattern="\d{10}" maxLength={10} required /></div>
          <div className="sm:col-span-2 flex flex-col sm:flex-row justify-end gap-2 pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary compact-button">Cancel</button>
            <button type="submit" className="btn-primary compact-button">Create Receptionist</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Receptionist"
        message="This receptionist account will be permanently deleted."
        confirmText="Delete"
        loading={deleting}
      />
    </div>
  );
}
