import { useEffect, useRef, useState } from 'react';
import { Loader2, Plus, XCircle, Pencil, RefreshCcw } from 'lucide-react';
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
  const [rebookFromId, setRebookFromId] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState(null);
  const bookingInProgressRef = useRef(false);
  const [form, setForm] = useState({ patient: '', doctor: '', department: '', appointmentDate: '', appointmentTime: '', notes: '' });
  const today = new Date().toISOString().split('T')[0];
  const filteredDoctors = form.department
    ? doctors.filter((doctor) => String(doctor.department?._id || doctor.department) === String(form.department))
    : [];

  const getPatientName = (appointment) =>
    appointment.patient?.fullName ||
    patients.find((patient) => String(patient._id) === String(appointment.patient))?.fullName ||
    (user?.role === 'patient' ? user?.fullName : '') ||
    '-';

  const getAppointmentDoctorName = (appointment) =>
    getDoctorName(appointment.doctor) !== 'Unknown Doctor'
      ? getDoctorName(appointment.doctor)
      : doctors.find((doctor) => String(doctor._id) === String(appointment.doctor))?.user?.fullName || '-';

  const getDepartmentName = (appointment) =>
    appointment.department?.name ||
    departments.find((department) => String(department._id) === String(appointment.department))?.name ||
    '-';

  const fetchData = async (overrides = {}) => {
    setLoading(true);
    try {
      const effectiveSearch = overrides.search ?? search;
      const effectiveStatus = overrides.statusFilter ?? statusFilter;
      const params = { search: effectiveSearch, ...(effectiveStatus && { status: effectiveStatus }) };
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

  const resetBookingForm = () => {
    setForm({ patient: '', doctor: '', department: '', appointmentDate: '', appointmentTime: '', notes: '' });
  };

  const handleDepartmentChange = (departmentId) => {
    setForm({ ...form, department: departmentId, doctor: '' });
  };

  const handleDoctorChange = (doctorId) => {
    setForm({ ...form, doctor: doctorId });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (bookingInProgressRef.current) return;

    bookingInProgressRef.current = true;
    setBookingLoading(true);
    try {
      const { data } = await api.post('/appointments', form);
      if (rebookFromId) {
        await api.delete(`/appointments/${rebookFromId}`);
      }
      if (data?.data) {
        setSearch('');
        setStatusFilter('');
        setAppointments((prev) => [
          data.data,
          ...prev.filter((appointment) => appointment._id !== data.data._id && appointment._id !== rebookFromId),
        ]);
      }
      toast.success(data?.message || (rebookFromId ? 'Appointment rebooked' : 'Appointment booked'));
      setModalOpen(false);
      setRebookFromId(null);
      resetBookingForm();
      await fetchData({ search: '', statusFilter: '' });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Booking failed'));
    } finally {
      bookingInProgressRef.current = false;
      setBookingLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    if (updatingAppointmentId) return;

    setUpdatingAppointmentId(id);
    try {
      await api.put(`/appointments/${id}`, { status });
      toast.success('Status updated');
      setEditModal(null);
      fetchData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Update failed'));
    } finally {
      setUpdatingAppointmentId(null);
    }
  };

  const handleCancel = async (id) => {
    if (updatingAppointmentId) return;
    if (!confirm('Cancel this appointment?')) return;

    setUpdatingAppointmentId(id);
    try {
      await api.patch(`/appointments/${id}/cancel`);
      toast.success('Appointment cancelled');
      fetchData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Cancel failed'));
    } finally {
      setUpdatingAppointmentId(null);
    }
  };

  const handleRebook = (appointment) => {
    if (bookingLoading) return;

    setForm({
      patient: appointment.patient?._id || appointment.patient || '',
      doctor: appointment.doctor?._id || appointment.doctor || '',
      department: appointment.department?._id || appointment.department || '',
      appointmentDate: '',
      appointmentTime: appointment.appointmentTime || '',
      notes: appointment.notes || '',
    });
    setRebookFromId(appointment._id);
    setModalOpen(true);
  };

  const openBookModal = () => {
    setRebookFromId(null);
    resetBookingForm();
    setModalOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <div className="grid grid-cols-[3fr_2fr] sm:flex sm:flex-row sm:flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <SearchBar value={search} onChange={setSearch} placeholder="Search..." className="min-w-0" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-full sm:w-auto min-w-0">
            <option value="">All Status</option>
            {APPOINTMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {canBook && (
            <button onClick={openBookModal} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center col-span-2 sm:col-span-1" disabled={bookingLoading}>
              <Plus className="w-4 h-4" /> Book Appointment
            </button>
          )}
        </div>
      </div>

      {loading ? <LoadingSpinner /> : appointments.length === 0 ? (
        <EmptyState message="No appointments found" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
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
                  <td className="py-3 pr-4 font-medium">{getPatientName(a)}</td>
                  <td className="py-3 pr-4">{getAppointmentDoctorName(a)}</td>
                  <td className="py-3 pr-4">{getDepartmentName(a)}</td>
                  <td className="py-3 pr-4">{formatDate(a.appointmentDate)}</td>
                  <td className="py-3 pr-4">{a.appointmentTime}</td>
                  <td className="py-3 pr-4"><span className={`badge ${getStatusBadge(a.status)}`}>{a.status}</span></td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      {canUpdate && a.status !== 'Cancelled' && (
                        <button onClick={() => setEditModal(a)} disabled={!!updatingAppointmentId} className="icon-btn disabled:opacity-50" title="Update status"><Pencil className="w-4 h-4" /></button>
                      )}
                      {a.status === 'Pending' && (
                        <button onClick={() => handleCancel(a._id)} disabled={!!updatingAppointmentId} className="icon-btn-danger disabled:opacity-50" title="Cancel">
                          {updatingAppointmentId === a._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        </button>
                      )}
                      {canBook && a.status === 'Cancelled' && (
                        <button onClick={() => handleRebook(a)} disabled={bookingLoading} className="icon-btn disabled:opacity-50" title="Rebook appointment"><RefreshCcw className="w-4 h-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => { if (!bookingLoading) { setModalOpen(false); setRebookFromId(null); } }} title={rebookFromId ? 'Rebook Appointment' : 'Book Appointment'} size="lg">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {!isPatient && <div><label className="block text-sm font-medium mb-1">Patient</label><select value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} className="input-field" required disabled={bookingLoading}><option value="">Select patient</option>{patients.map((p) => <option key={p._id} value={p._id}>{p.fullName}</option>)}</select></div>}
          <div><label className="block text-sm font-medium mb-1">Department</label><select value={form.department} onChange={(e) => handleDepartmentChange(e.target.value)} className="input-field" required disabled={bookingLoading}><option value="">Select department first</option>{departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-1">Doctor</label><select value={form.doctor} onChange={(e) => handleDoctorChange(e.target.value)} className="input-field" required disabled={bookingLoading || !form.department}><option value="">{form.department ? 'Select doctor' : 'Select department first'}</option>{filteredDoctors.map((d) => <option key={d._id} value={d._id}>{d.user?.fullName} - {d.qualification}</option>)}</select>{form.department && filteredDoctors.length === 0 && <p className="text-xs text-red-500 mt-1">No doctors available in this department</p>}</div>
          <div><label className="block text-sm font-medium mb-1">Date</label><input type="date" min={today} value={form.appointmentDate} onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })} className="input-field" required disabled={bookingLoading} /></div>
          <div><label className="block text-sm font-medium mb-1">Time</label><select value={form.appointmentTime} onChange={(e) => setForm({ ...form, appointmentTime: e.target.value })} className="input-field" required disabled={bookingLoading}><option value="">Select time</option>{TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
          <div className="sm:col-span-2"><label className="block text-sm font-medium mb-1">Notes</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field" rows={2} disabled={bookingLoading} /></div>
          {bookingLoading && (
            <div className="sm:col-span-2 flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 text-sm text-primary-700">
              <Loader2 className="w-4 h-4 animate-spin" /> Please wait, booking appointment...
            </div>
          )}
          <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 justify-end">
            <button type="button" onClick={() => setModalOpen(false)} disabled={bookingLoading} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={bookingLoading} className="btn-primary flex items-center gap-2">
              {bookingLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {bookingLoading ? 'Booking...' : 'Book'}
            </button>
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
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button onClick={() => setEditModal(null)} disabled={!!updatingAppointmentId} className="btn-secondary">Cancel</button>
              <button onClick={() => handleStatusUpdate(editModal._id, document.getElementById('status').value)} disabled={!!updatingAppointmentId} className="btn-primary flex items-center gap-2">
                {updatingAppointmentId === editModal._id && <Loader2 className="w-4 h-4 animate-spin" />}
                {updatingAppointmentId === editModal._id ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
