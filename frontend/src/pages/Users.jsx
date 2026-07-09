import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api, { getApiErrorMessage } from '../services/api';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import SearchBar from '../components/SearchBar';
import { EmptyState, TableSkeleton } from '../components/LoadingSpinner';
import { BLOOD_GROUPS, GENDERS } from '../utils/helpers';
import useDebouncedValue from '../hooks/useDebouncedValue';

const ROLES = ['admin', 'doctor', 'receptionist', 'patient'];
const emptyForm = {
  fullName: '', email: '', phone: '', role: 'patient', isActive: true,
  department: '', qualification: '', experience: '', consultationFee: 500,
  age: '', gender: 'Male', address: '', bloodGroup: 'O+',
};
const emptyCreateForm = {
  fullName: '', email: '', password: '', phone: '', role: 'receptionist',
  department: '', qualification: '', experience: '', consultationFee: 500,
  age: '', gender: 'Male', address: '', bloodGroup: 'O+',
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [roleFilter, setRoleFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [newDepartment, setNewDepartment] = useState('');
  const [creatingDepartment, setCreatingDepartment] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { ...(debouncedSearch && { search: debouncedSearch }), ...(roleFilter && { role: roleFilter }) };
      const [userRes, deptRes] = await Promise.all([
        api.get('/users', { params }),
        api.get('/departments'),
      ]);
      setUsers(userRes.data.data);
      setDepartments(deptRes.data.data);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load users'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [debouncedSearch, roleFilter]);

  const onlyDigits = (value) => value.replace(/\D/g, '').slice(0, 10);

  const openCreate = () => {
    setCreateForm(emptyCreateForm);
    setNewDepartment('');
    setCreateOpen(true);
  };

  const openEdit = (user) => {
    const doctor = user.doctorProfile || {};
    const patient = user.patientProfile || {};
    setEditing(user);
    setNewDepartment('');
    setForm({
      ...emptyForm,
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || doctor.phone || patient.phone || '',
      role: user.role,
      isActive: Boolean(user.isActive),
      department: doctor.department?._id || user.department?._id || user.department || '',
      qualification: doctor.qualification || user.qualification || '',
      experience: doctor.experience ?? user.experience ?? '',
      consultationFee: doctor.consultationFee ?? user.consultationFee ?? 500,
      age: patient.age ?? user.age ?? '',
      gender: patient.gender || user.gender || 'Male',
      address: patient.address || user.address || '',
      bloodGroup: patient.bloodGroup || user.bloodGroup || 'O+',
    });
  };

  const buildPayload = (source) => ({
    ...source,
    experience: source.experience === '' ? undefined : Number(source.experience),
    consultationFee: source.consultationFee === '' ? undefined : Number(source.consultationFee),
    age: source.age === '' ? undefined : Number(source.age),
  });

  const handleAddDepartment = async () => {
    const name = newDepartment.trim();
    if (!name) return toast.error('Department name is required');

    setCreatingDepartment(true);
    try {
      const { data } = await api.post('/departments', { name });
      setDepartments((prev) => [...prev, data.data].sort((a, b) => a.name.localeCompare(b.name)));
      if (createOpen) setCreateForm((prev) => ({ ...prev, department: data.data._id }));
      else setForm((prev) => ({ ...prev, department: data.data._id }));
      setNewDepartment('');
      toast.success('Department added');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to add department'));
    } finally {
      setCreatingDepartment(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', buildPayload(createForm));
      toast.success('User created and role assigned');
      setCreateOpen(false);
      fetchData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Create failed'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${editing._id}`, buildPayload(form));
      toast.success('User updated and role collection synced');
      setEditing(null);
      fetchData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Update failed'));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      await api.delete(`/users/${deleteId}`);
      toast.success('User deleted');
      setDeleteId(null);
      fetchData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Delete failed'));
    } finally {
      setDeleting(false);
    }
  };

  const roleFields = (state, setState) => (
    <>
      {state.role === 'doctor' && (
        <>
          <div className="sm:col-span-2 border-t pt-4"><h3 className="font-semibold text-gray-900">Doctor Details</h3></div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Department</label>
            <select value={state.department} onChange={(e) => setState({ ...state, department: e.target.value })} className="input-field">
              <option value="">Default: General Medicine</option>
              {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
            <div className="mt-2 flex flex-col sm:flex-row gap-2">
              <input value={newDepartment} onChange={(e) => setNewDepartment(e.target.value)} className="input-field min-w-0" placeholder="New department name" />
              <button type="button" onClick={handleAddDepartment} disabled={creatingDepartment} className="btn-secondary w-full sm:w-auto whitespace-nowrap">{creatingDepartment ? 'Adding...' : 'Add Department'}</button>
            </div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Qualification</label><input value={state.qualification} onChange={(e) => setState({ ...state, qualification: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm font-medium mb-1">Experience</label><input type="number" value={state.experience} onChange={(e) => setState({ ...state, experience: e.target.value })} className="input-field" min={0} /></div>
          <div><label className="block text-sm font-medium mb-1">Consultation Fee</label><input type="number" value={state.consultationFee} onChange={(e) => setState({ ...state, consultationFee: e.target.value })} className="input-field" min={0} /></div>
        </>
      )}
      {state.role === 'patient' && (
        <>
          <div className="sm:col-span-2 border-t pt-4"><h3 className="font-semibold text-gray-900">Patient Details</h3></div>
          <div><label className="block text-sm font-medium mb-1">Age</label><input type="number" value={state.age} onChange={(e) => setState({ ...state, age: e.target.value })} className="input-field" min={0} max={150} /></div>
          <div><label className="block text-sm font-medium mb-1">Gender</label><select value={state.gender} onChange={(e) => setState({ ...state, gender: e.target.value })} className="input-field">{GENDERS.map((g) => <option key={g}>{g}</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-1">Blood Group</label><select value={state.bloodGroup} onChange={(e) => setState({ ...state, bloodGroup: e.target.value })} className="input-field">{BLOOD_GROUPS.map((b) => <option key={b}>{b}</option>)}</select></div>
          <div className="sm:col-span-2"><label className="block text-sm font-medium mb-1">Address</label><input value={state.address} onChange={(e) => setState({ ...state, address: e.target.value })} className="input-field" /></div>
        </>
      )}
    </>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Role Assign</h1>
        <div className="grid grid-cols-[2fr_3fr] sm:flex sm:flex-row sm:flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <SearchBar value={search} onChange={setSearch} placeholder="Search users..." className="min-w-0" />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field w-full sm:w-auto min-w-0">
            <option value="">All Roles</option>
            {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 col-span-2 sm:col-span-1 w-full sm:w-auto"><Plus className="w-4 h-4" /> Add User & Assign Role</button>
        </div>
      </div>

      {loading ? <TableSkeleton rows={6} columns={6} /> : users.length === 0 ? <EmptyState message="No users found" /> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead><tr className="border-b text-left text-gray-500"><th className="pb-3 pr-4">Name</th><th className="pb-3 pr-4">Email</th><th className="pb-3 pr-4">Phone</th><th className="pb-3 pr-4">Role</th><th className="pb-3 pr-4">Status</th><th className="pb-3">Actions</th></tr></thead>
            <tbody>{users.map((user) => <tr key={user._id} className="border-b last:border-0"><td className="py-3 pr-4 font-medium">{user.fullName}</td><td className="py-3 pr-4">{user.email}</td><td className="py-3 pr-4">{user.phone || '-'}</td><td className="py-3 pr-4"><span className="badge bg-primary-100 text-primary-700 capitalize">{user.role}</span></td><td className="py-3 pr-4"><span className={`badge ${user.isActive ? 'badge-completed' : 'badge-cancelled'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></td><td className="py-3"><div className="flex gap-1"><button onClick={() => openEdit(user)} className="icon-btn" title="Edit user"><Pencil className="w-4 h-4" /></button><button onClick={() => setDeleteId(user._id)} className="icon-btn-danger" title="Delete user"><Trash2 className="w-4 h-4" /></button></div></td></tr>)}</tbody>
          </table>
        </div>
      )}

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add User & Assign Role" size="lg">
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Full Name</label><input value={createForm.fullName} onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })} className="input-field" required /></div>
          <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} className="input-field" required /></div>
          <div><label className="block text-sm font-medium mb-1">Password</label><input type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} className="input-field" required minLength={6} /></div>
          <div><label className="block text-sm font-medium mb-1">Phone</label><input value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: onlyDigits(e.target.value) })} className="input-field" inputMode="numeric" pattern="\d{10}" maxLength={10} required /></div>
          <div><label className="block text-sm font-medium mb-1">Role</label><select value={createForm.role} onChange={(e) => setCreateForm({ ...emptyCreateForm, fullName: createForm.fullName, email: createForm.email, password: createForm.password, phone: createForm.phone, role: e.target.value })} className="input-field">{ROLES.map((role) => <option key={role} value={role}>{role}</option>)}</select></div>
          {roleFields(createForm, setCreateForm)}
          <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 justify-end"><button type="button" onClick={() => setCreateOpen(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Create User</button></div>
        </form>
      </Modal>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Edit User Role" size="lg">
        {editing && <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Full Name</label><input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input-field" required /></div>
          <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" required /></div>
          <div><label className="block text-sm font-medium mb-1">Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: onlyDigits(e.target.value) })} className="input-field" inputMode="numeric" pattern="\d{10}" maxLength={10} required /></div>
          <div><label className="block text-sm font-medium mb-1">Role</label><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field">{ROLES.map((role) => <option key={role} value={role}>{role}</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-1">Status</label><select value={form.isActive ? 'active' : 'inactive'} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'active' })} className="input-field"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
          {roleFields(form, setForm)}
          <div className="sm:col-span-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">Role changes create/update the matching doctor, patient, or receptionist collection document.</div>
          <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 justify-end"><button type="button" onClick={() => setEditing(null)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Save Changes</button></div>
        </form>}
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message="This user account will be permanently deleted."
        confirmText="Delete"
        loading={deleting}
      />
    </div>
  );
}
