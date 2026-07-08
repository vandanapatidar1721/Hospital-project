import { useEffect, useState } from 'react';
import { Plus, XCircle, Pencil, RefreshCcw } from 'lucide-react';
import { toast } from 'react-toastify';
import api, { getApiErrorMessage } from '../services/api';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';
import LoadingSpinner, { EmptyState } from '../components/LoadingSpinner';
import { formatDate, getDoctorName, getStatusBadge, APPOINTMENT_STATUSES, TIME_SLOTS } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

export default function Appointments() {
  const { user } = useAuth();
  const canBook = ['admin', 'receptionist', 'patient'].includes(user?.role);
  const isPatient = user?.role === 'patient';
  const canUpdate = ['admin', 'receptionist', 'doctor'].includes(user?.role);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [form, setForm] = useState({ patient: '', doctor: '', department: '', appointmentDate: '', appointmentTime: '', notes: '' });
  const today = new Date().toISOString().split('T')[0];
  const filteredDoctors = form.department
    ? doctors.filter((doctor) => String(doctor.department?._id || doctor.department) === String(form.department))
    : [];

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { search, ...(statusFilter && { status: statusFilter }) };
      const bookingRequests = isPatient
        ? [api.get('/doctors'), api.get('/departments')]
        : [api.get('/patients'), api.get('/doctors'), api.get('/departments')];
      const [apptRes, ...rest] = await Promise.all([
        api.get('/appointments', { params }),
        ...(canBook ? bookingRequests : []),
      ]);
      setAppointments(apptRes.data.data);
      if (canBook) {
        if (isPatient) {
          setPatients([]);
          setDoctors(rest[0].data.data);
          setDepartments(rest[1].data.data);
        } else {
          setPatients(rest[0].data.data);
          setDoctors(rest[1].data.data);
          setDepartments(rest[2].data.data);
        }
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load appointments'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [search, statusFilter]);

  const handleDepartmentChange = (departmentId) => {
    setForm({ ...form, department: departmentId, doctor: '' });
  };

  const handleDoctorChange = (doctorId) => {
    setForm({ ...form, doctor: doctorId });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/appointments', form);
      toast.success('Appointment booked');
      setModalOpen(false);
      setForm({ patient: '', doctor: '', department: '', appointmentDate: '', appointmentTime: '', notes: '' });
      fetchData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Booking failed'));
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      toast.success('Status updated');
      setEditModal(null);
      fetchData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Update failed'));
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await api.patch(`/appointments/${id}/cancel`);
      toast.success('Appointment cancelled');
      fetchData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Cancel failed'));
    }
  };

  const handleRebook = (appointment) => {
    setForm({
      patient: appointment.patient?._id || appointment.patient || '',
      doctor: appointment.doctor?._id || appointment.doctor || '',
      department: appointment.department?._id || appointment.department || '',
      appointmentDate: '',
      appointmentTime: appointment.appointmentTime || '',
      notes: appointment.notes || '',
    });
    setModalOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <div className="flex flex-wrap gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search..." />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-auto">
            <option value="">All Status</option>
            {APPOINTMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {canBook && (
            <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Book Appointment
            </button>
          )}
        </div>
      </div>

      {loading ? <LoadingSpinner /> : appointments.length === 0 ? (
        <EmptyState message="No appointments found" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 pr-4">Patient</th>
                <th className="pb-3 pr-4">Doctor</th>
                <th className="pb-3 pr-4">Department</th>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Time</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a._id} className="border-b last:border-0">
                  <td className="py-3 pr-4 font-medium">{a.patient?.fullName}</td>
                  <td className="py-3 pr-4">{getDoctorName(a.doctor)}</td>
                  <td className="py-3 pr-4">{a.department?.name}</td>
                  <td className="py-3 pr-4">{formatDate(a.appointmentDate)}</td>
                  <td className="py-3 pr-4">{a.appointmentTime}</td>
                  <td className="py-3 pr-4"><span className={`badge ${getStatusBadge(a.status)}`}>{a.status}</span></td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      {canUpdate && a.status !== 'Cancelled' && (
                        <button onClick={() => setEditModal(a)} className="p-1.5 text-gray-400 hover:text-primary-600" title="Update status"><Pencil className="w-4 h-4" /></button>
                      )}
                      {a.status === 'Pending' && (
                        <button onClick={() => handleCancel(a._id)} className="p-1.5 text-gray-400 hover:text-red-600" title="Cancel"><XCircle className="w-4 h-4" /></button>
                      )}
                      {canBook && a.status === 'Cancelled' && (
                        <button onClick={() => handleRebook(a)} className="p-1.5 text-gray-400 hover:text-primary-600" title="Rebook appointment"><RefreshCcw className="w-4 h-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Book Appointment" size="lg">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {!isPatient && <div><label className="block text-sm font-medium mb-1">Patient</label><select value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} className="input-field" required><option value="">Select patient</option>{patients.map((p) => <option key={p._id} value={p._id}>{p.fullName}</option>)}</select></div>}
          <div><label className="block text-sm font-medium mb-1">Department</label><select value={form.department} onChange={(e) => handleDepartmentChange(e.target.value)} className="input-field" required><option value="">Select department first</option>{departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-1">Doctor</label><select value={form.doctor} onChange={(e) => handleDoctorChange(e.target.value)} className="input-field" required disabled={!form.department}><option value="">{form.department ? 'Select doctor' : 'Select department first'}</option>{filteredDoctors.map((d) => <option key={d._id} value={d._id}>{d.user?.fullName} - {d.qualification}</option>)}</select>{form.department && filteredDoctors.length === 0 && <p className="text-xs text-red-500 mt-1">No doctors available in this department</p>}</div>
          <div><label className="block text-sm font-medium mb-1">Date</label><input type="date" min={today} value={form.appointmentDate} onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })} className="input-field" required /></div>
          <div><label className="block text-sm font-medium mb-1">Time</label><select value={form.appointmentTime} onChange={(e) => setForm({ ...form, appointmentTime: e.target.value })} className="input-field" required><option value="">Select time</option>{TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
          <div className="sm:col-span-2"><label className="block text-sm font-medium mb-1">Notes</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field" rows={2} /></div>
          <div className="sm:col-span-2 flex gap-3 justify-end">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Book</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title="Update Appointment Status">
        {editModal && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Patient: <strong>{editModal.patient?.fullName}</strong></p>
            <select id="status" defaultValue={editModal.status} className="input-field">
              {APPOINTMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={() => handleStatusUpdate(editModal._id, document.getElementById('status').value)} className="btn-primary">Update</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
