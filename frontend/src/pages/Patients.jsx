import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import api, { getApiErrorMessage } from '../services/api';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';
import LoadingSpinner, { EmptyState } from '../components/LoadingSpinner';
import { BLOOD_GROUPS, GENDERS } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const emptyForm = { fullName: '', age: '', gender: 'Male', phone: '', address: '', bloodGroup: 'O+', email: '', password: '' };

export default function Patients() {
  const { user } = useAuth();
  const canEdit = ['admin', 'receptionist'].includes(user?.role);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewPatient, setViewPatient] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/patients', { params: { search } });
      setPatients(data.data);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load patients'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [search]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ fullName: p.fullName, age: p.age, gender: p.gender, phone: p.phone, address: p.address, bloodGroup: p.bloodGroup, email: p.user?.email || '', password: '' });
    setModalOpen(true);
  };

  const onlyDigits = (value) => value.replace(/\D/g, '').slice(0, 10);

  const buildPayload = () => ({
    ...form,
    age: form.age === '' ? undefined : Number(form.age),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editing && form.email && !form.password) {
      toast.error('Password is required when email is provided');
      return;
    }
    if (!editing && form.password && !form.email) {
      toast.error('Email is required when password is provided');
      return;
    }

    try {
      if (editing) {
        const { email, password, ...updateData } = buildPayload();
        await api.put(`/patients/${editing._id}`, updateData);
        toast.success('Patient updated');
      } else {
        const payload = buildPayload();
        if (!payload.email) { delete payload.email; delete payload.password; }
        await api.post('/patients', payload);
        toast.success('Patient registered');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Operation failed'));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this patient?')) return;
    try {
      await api.delete(`/patients/${id}`);
      toast.success('Patient deleted');
      fetchData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Delete failed'));
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        <div className="grid grid-cols-[3fr_2fr] sm:flex sm:flex-row sm:flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <SearchBar value={search} onChange={setSearch} placeholder="Search patients..." className="min-w-0" />
          {canEdit && (
            <button onClick={openCreate} className="btn-primary flex items-center gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" /> Register Patient
            </button>
          )}
        </div>
      </div>

      {loading ? <LoadingSpinner /> : patients.length === 0 ? (
        <EmptyState message="No patients found" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Age</th>
                <th className="pb-3 pr-4">Gender</th>
                <th className="pb-3 pr-4">Phone</th>
                <th className="pb-3 pr-4">Blood Group</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p._id} className="border-b last:border-0">
                  <td className="py-3 pr-4 font-medium">{p.fullName}</td>
                  <td className="py-3 pr-4">{p.age}</td>
                  <td className="py-3 pr-4">{p.gender}</td>
                  <td className="py-3 pr-4">{p.phone}</td>
                  <td className="py-3 pr-4">{p.bloodGroup}</td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setViewPatient(p)} className="icon-btn"><Eye className="w-4 h-4" /></button>
                      {canEdit && <button onClick={() => openEdit(p)} className="icon-btn"><Pencil className="w-4 h-4" /></button>}
                      {user?.role === 'admin' && <button onClick={() => handleDelete(p._id)} className="icon-btn-danger"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Patient' : 'Register Patient'} size="lg">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Full Name</label><input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input-field" required /></div>
          <div><label className="block text-sm font-medium mb-1">Age</label><input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="input-field" required min={0} /></div>
          <div><label className="block text-sm font-medium mb-1">Gender</label><select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="input-field">{GENDERS.map((g) => <option key={g}>{g}</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-1">Blood Group</label><select value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} className="input-field">{BLOOD_GROUPS.map((b) => <option key={b}>{b}</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-1">Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: onlyDigits(e.target.value) })} className="input-field" inputMode="numeric" pattern="\d{10}" maxLength={10} required /></div>
          <div className="sm:col-span-2"><label className="block text-sm font-medium mb-1">Address</label><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field" required /></div>
          {!editing && (
            <>
              <div><label className="block text-sm font-medium mb-1">Email (optional, for login)</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" /></div>
              <div><label className="block text-sm font-medium mb-1">Password (if email provided)</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" minLength={6} /></div>
            </>
          )}
          <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 justify-end">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Register'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!viewPatient} onClose={() => setViewPatient(null)} title="Patient Details">
        {viewPatient && (
          <div className="space-y-3">
            <p><span className="text-gray-500">Name:</span> <strong>{viewPatient.fullName}</strong></p>
            <p><span className="text-gray-500">Age:</span> {viewPatient.age}</p>
            <p><span className="text-gray-500">Gender:</span> {viewPatient.gender}</p>
            <p><span className="text-gray-500">Phone:</span> {viewPatient.phone}</p>
            <p><span className="text-gray-500">Address:</span> {viewPatient.address}</p>
            <p><span className="text-gray-500">Blood Group:</span> {viewPatient.bloodGroup}</p>
            {viewPatient.user?.email && <p><span className="text-gray-500">Email:</span> {viewPatient.user.email}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}
