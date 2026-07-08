import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';
import LoadingSpinner, { EmptyState } from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  fullName: '', email: '', password: '', department: '', qualification: '', experience: '', phone: '', consultationFee: 500,
};

export default function Doctors() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewDoctor, setViewDoctor] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docRes, deptRes] = await Promise.all([
        api.get('/doctors', { params: { search } }),
        api.get('/departments'),
      ]);
      setDoctors(docRes.data.data);
      setDepartments(deptRes.data.data);
    } catch {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (doc) => {
    setEditing(doc);
    setForm({
      fullName: doc.user?.fullName || '',
      email: doc.user?.email || '',
      password: '',
      department: doc.department?._id || doc.department || '',
      qualification: doc.qualification,
      experience: doc.experience,
      phone: doc.phone,
      consultationFee: doc.consultationFee,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const { password, ...updateData } = form;
        await api.put(`/doctors/${editing._id}`, updateData);
        toast.success('Doctor updated');
      } else {
        await api.post('/doctors', form);
        toast.success('Doctor created');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this doctor?')) return;
    try {
      await api.delete(`/doctors/${id}`);
      toast.success('Doctor deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
        <div className="flex gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search doctors..." />
          {isAdmin && (
            <button onClick={openCreate} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Doctor
            </button>
          )}
        </div>
      </div>

      {loading ? <LoadingSpinner /> : doctors.length === 0 ? (
        <EmptyState message="No doctors found" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Department</th>
                <th className="pb-3 pr-4">Qualification</th>
                <th className="pb-3 pr-4">Experience</th>
                <th className="pb-3 pr-4">Phone</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr key={doc._id} className="border-b last:border-0">
                  <td className="py-3 pr-4 font-medium">{doc.user?.fullName}</td>
                  <td className="py-3 pr-4">{doc.department?.name}</td>
                  <td className="py-3 pr-4">{doc.qualification}</td>
                  <td className="py-3 pr-4">{doc.experience} yrs</td>
                  <td className="py-3 pr-4">{doc.phone}</td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setViewDoctor(doc)} className="p-1.5 text-gray-400 hover:text-primary-600"><Eye className="w-4 h-4" /></button>
                      {isAdmin && (
                        <>
                          <button onClick={() => openEdit(doc)} className="p-1.5 text-gray-400 hover:text-primary-600"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(doc._id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Doctor' : 'Add Doctor'} size="lg">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Full Name</label><input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input-field" required /></div>
          <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" required disabled={!!editing} /></div>
          {!editing && <div><label className="block text-sm font-medium mb-1">Password</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" required minLength={6} /></div>}
          <div><label className="block text-sm font-medium mb-1">Department</label><select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="input-field" required><option value="">Select</option>{departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-1">Qualification</label><input value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} className="input-field" required /></div>
          <div><label className="block text-sm font-medium mb-1">Experience (years)</label><input type="number" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} className="input-field" required min={0} /></div>
          <div><label className="block text-sm font-medium mb-1">Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" required /></div>
          <div><label className="block text-sm font-medium mb-1">Consultation Fee (₹)</label><input type="number" value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: e.target.value })} className="input-field" min={0} /></div>
          <div className="sm:col-span-2 flex gap-3 justify-end">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!viewDoctor} onClose={() => setViewDoctor(null)} title="Doctor Profile">
        {viewDoctor && (
          <div className="space-y-3">
            <p><span className="text-gray-500">Name:</span> <strong>{viewDoctor.user?.fullName}</strong></p>
            <p><span className="text-gray-500">Email:</span> {viewDoctor.user?.email}</p>
            <p><span className="text-gray-500">Department:</span> {viewDoctor.department?.name}</p>
            <p><span className="text-gray-500">Qualification:</span> {viewDoctor.qualification}</p>
            <p><span className="text-gray-500">Experience:</span> {viewDoctor.experience} years</p>
            <p><span className="text-gray-500">Phone:</span> {viewDoctor.phone}</p>
            <p><span className="text-gray-500">Consultation Fee:</span> ₹{viewDoctor.consultationFee}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
