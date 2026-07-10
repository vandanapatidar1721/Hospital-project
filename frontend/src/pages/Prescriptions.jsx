import { useEffect, useState } from 'react';
import { Plus, Printer, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';
import { EmptyState, TableSkeleton } from '../components/LoadingSpinner';
import { formatDate, getDoctorName } from '../utils/helpers';
import useDebouncedValue from '../hooks/useDebouncedValue';
import { useAuth } from '../context/AuthContext';

const emptyItem = { medicineName: '', dosage: '', duration: '', instructions: '', price: 0 };

export default function Prescriptions() {
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewRx, setViewRx] = useState(null);
  const [form, setForm] = useState({ appointment: '', items: [{ ...emptyItem }], additionalNotes: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rxRes, apptRes] = await Promise.all([
        api.get('/prescriptions', { params: { search: debouncedSearch } }),
        ...(isDoctor ? [api.get('/appointments', { params: { status: 'Pending' } })] : [Promise.resolve({ data: { data: [] } })]),
      ]);
      setPrescriptions(rxRes.data.data);
      if (isDoctor) setAppointments(apptRes.data.data);
    } catch {
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [debouncedSearch]);

  const addItem = () => setForm({ ...form, items: [...form.items, { ...emptyItem }] });
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const updateItem = (i, field, value) => {
    const items = [...form.items];
    items[i] = { ...items[i], [field]: value };
    setForm({ ...form, items });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/prescriptions', form);
      toast.success('Prescription created');
      setModalOpen(false);
      setForm({ appointment: '', items: [{ ...emptyItem }], additionalNotes: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create prescription');
    }
  };

  const handlePrint = () => window.print();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 no-print">
        <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
        <div className="grid grid-cols-[3fr_2fr] sm:flex sm:flex-row sm:flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <SearchBar value={search} onChange={setSearch} placeholder="Search prescriptions..." className="min-w-0" />
          {isDoctor && (
            <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" /> Create Prescription
            </button>
          )}
        </div>
      </div>

      {loading ? <TableSkeleton rows={6} columns={5} /> : prescriptions.length === 0 ? (
        <EmptyState message="No prescriptions found" />
      ) : (
        <div className="card overflow-x-auto no-print">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 pr-4">Patient</th>
                <th className="pb-3 pr-4">Doctor</th>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Medicines</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((rx) => (
                <tr key={rx._id} className="border-b last:border-0">
                  <td className="py-3 pr-4 font-medium">{rx.patient?.fullName}</td>
                  <td className="py-3 pr-4">{getDoctorName(rx.doctor)}</td>
                  <td className="py-3 pr-4">{formatDate(rx.createdAt)}</td>
                  <td className="py-3 pr-4">{rx.items.length}</td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setViewRx(rx)} className="icon-btn"><Eye className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Prescription" size="lg">
        <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
          <div>
            <label className="compact-label">Appointment</label>
            <select value={form.appointment} onChange={(e) => setForm({ ...form, appointment: e.target.value })} className="compact-field" required>
              <option value="">Select appointment</option>
              {appointments.map((a) => (
                <option key={a._id} value={a._id}>{a.patient?.fullName} - {formatDate(a.appointmentDate)} {a.appointmentTime}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1.5">
              <label className="text-xs sm:text-sm font-medium">Medicines</label>
              <button type="button" onClick={addItem} className="btn-secondary compact-button w-full sm:w-auto">+ Add Medicine</button>
            </div>
            {form.items.map((item, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mb-2 p-2 bg-gray-50 rounded-lg">
                <input placeholder="Medicine" value={item.medicineName} onChange={(e) => updateItem(i, 'medicineName', e.target.value)} className="compact-field" required />
                <input placeholder="Dosage" value={item.dosage} onChange={(e) => updateItem(i, 'dosage', e.target.value)} className="compact-field" required />
                <input placeholder="Duration" value={item.duration} onChange={(e) => updateItem(i, 'duration', e.target.value)} className="compact-field" required />
                <input placeholder="Instructions" value={item.instructions} onChange={(e) => updateItem(i, 'instructions', e.target.value)} className="compact-field" />
                <div className="flex gap-2 items-center">
                  <input type="number" placeholder="Price" value={item.price} onChange={(e) => updateItem(i, 'price', Number(e.target.value))} className="compact-field" min={0} />
                  {form.items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="icon-btn-danger text-base">×</button>}
                </div>
              </div>
            ))}
          </div>
          <div>
            <label className="compact-label">Additional Notes</label>
            <textarea value={form.additionalNotes} onChange={(e) => setForm({ ...form, additionalNotes: e.target.value })} className="compact-field" rows={2} />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-end pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary compact-button">Cancel</button>
            <button type="submit" className="btn-primary compact-button">Create Prescription</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!viewRx} onClose={() => setViewRx(null)} title="Prescription Details" size="lg">
        {viewRx && (
          <div id="prescription-print">
            <div className="text-center border-b pb-4 mb-4">
              <h2 className="text-xl font-bold">Hospital Management System</h2>
              <p className="text-gray-500 text-sm">Digital Prescription</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 text-sm">
              <p><span className="text-gray-500">Patient:</span> <strong>{viewRx.patient?.fullName}</strong></p>
              <p><span className="text-gray-500">Doctor:</span> {getDoctorName(viewRx.doctor)}</p>
              <p><span className="text-gray-500">Date:</span> {formatDate(viewRx.createdAt)}</p>
              <p><span className="text-gray-500">Blood Group:</span> {viewRx.patient?.bloodGroup}</p>
            </div>
            <div className="overflow-x-auto mb-4">
              <table className="w-full min-w-[560px] text-sm">
                <thead><tr className="border-b bg-gray-50"><th className="p-2 text-left">Medicine</th><th className="p-2 text-left">Dosage</th><th className="p-2 text-left">Duration</th><th className="p-2 text-left">Instructions</th></tr></thead>
                <tbody>
                  {viewRx.items.map((item, i) => (
                    <tr key={i} className="border-b"><td className="p-2 whitespace-nowrap">{item.medicineName}</td><td className="p-2 whitespace-nowrap">{item.dosage}</td><td className="p-2 whitespace-nowrap">{item.duration}</td><td className="p-2">{item.instructions}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            {viewRx.additionalNotes && <p className="text-sm text-gray-600"><strong>Notes:</strong> {viewRx.additionalNotes}</p>}
            <div className="flex justify-end mt-4 no-print">
              <button onClick={handlePrint} className="btn-primary flex items-center gap-2 w-full sm:w-auto"><Printer className="w-4 h-4" /> Print</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
