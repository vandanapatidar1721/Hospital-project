import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';
import LoadingSpinner, { EmptyState } from '../components/LoadingSpinner';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/departments', { params: { search } });
      setDepartments(data.data);
    } catch {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '' });
    setModalOpen(true);
  };

  const openEdit = (dept) => {
    setEditing(dept);
    setForm({ name: dept.name, description: dept.description || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/departments/${editing._id}`, form);
        toast.success('Department updated');
      } else {
        await api.post('/departments', form);
        toast.success('Department created');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this department?')) return;
    try {
      await api.delete(`/departments/${id}`);
      toast.success('Department deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
        <div className="flex gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search departments..." />
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Department
          </button>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : departments.length === 0 ? (
        <EmptyState message="No departments found" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div key={dept._id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{dept.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">{dept.description || 'No description'}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(dept)} className="p-2 text-gray-400 hover:text-primary-600">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(dept._id)} className="p-2 text-gray-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Department' : 'Add Department'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={3} />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
