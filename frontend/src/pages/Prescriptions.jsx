import { useEffect, useState } from 'react';
import { Plus, Printer, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';
import LoadingSpinner, { EmptyState } from '../components/LoadingSpinner';
import { formatDate, getDoctorName } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const emptyItem = { medicineName: '', dosage: '', duration: '', instructions: '', price: 0 };

export default function Prescriptions() {
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewRx, setViewRx] = useState(null);
  const [form, setForm] = useState({ appointment: '', items: [{ ...emptyItem }], additionalNotes: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rxRes, apptRes] = await Promise.all([
        api.get('/prescriptions', { params: { search } }),
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

  useEffect(() => { fetchData(); }, [search]);

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
        <div className="flex gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search prescriptions..." />
          {isDoctor && (
            <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Prescription
            </button>
          )}
        </div>
      </div>

      {loading ? <LoadingSpinner /> : prescriptions.length === 0 ? (
        <EmptyState message="No prescriptions found" />
      ) : (
        <div className="card overflow-x-auto no-print">
          <table className="w-full text-sm">
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
                      <button onClick={() => setViewRx(rx)} className="p-1.5 text-gray-400 hover:text-primary-600"><Eye className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Prescription" size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Appointment</label>
            <select value={form.appointment} onChange={(e) => setForm({ ...form, appointment: e.target.value })} className="input-field" required>
              <option value="">Select appointment</option>
              {appointments.map((a) => (
                <option key={a._id} value={a._id}>{a.patient?.fullName} - {formatDate(a.appointmentDate)} {a.appointmentTime}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Medicines</label>
              <button type="button" onClick={addItem} className="text-sm text-primary-600 hover:underline">+ Add Medicine</button>
            </div>
            {form.items.map((item, i) => (
              <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-2 p-3 bg-gray-50 rounded-lg">
                <input placeholder="Medicine" value={item.medicineName} onChange={(e) => updateItem(i, 'medicineName', e.target.value)} className="input-field" required />
                <input placeholder="Dosage" value={item.dosage} onChange={(e) => updateItem(i, 'dosage', e.target.value)} className="input-field" required />
                <input placeholder="Duration" value={item.duration} onChange={(e) => updateItem(i, 'duration', e.target.value)} className="input-field" required />
                <input placeholder="Instructions" value={item.instructions} onChange={(e) => updateItem(i, 'instructions', e.target.value)} className="input-field" />
                <div className="flex gap-1">
                  <input type="number" placeholder="Price" value={item.price} onChange={(e) => updateItem(i, 'price', Number(e.target.value))} className="input-field" min={0} />
                  {form.items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="text-red-500 px-2">×</button>}
                </div>
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Additional Notes</label>
            <textarea value={form.additionalNotes} onChange={(e) => setForm({ ...form, additionalNotes: e.target.value })} className="input-field" rows={2} />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Prescription</button>
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
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <p><span className="text-gray-500">Patient:</span> <strong>{viewRx.patient?.fullName}</strong></p>
              <p><span className="text-gray-500">Doctor:</span> {getDoctorName(viewRx.doctor)}</p>
              <p><span className="text-gray-500">Date:</span> {formatDate(viewRx.createdAt)}</p>
              <p><span className="text-gray-500">Blood Group:</span> {viewRx.patient?.bloodGroup}</p>
            </div>
            <table className="w-full text-sm mb-4">
              <thead><tr className="border-b bg-gray-50"><th className="p-2 text-left">Medicine</th><th className="p-2 text-left">Dosage</th><th className="p-2 text-left">Duration</th><th className="p-2 text-left">Instructions</th></tr></thead>
              <tbody>
                {viewRx.items.map((item, i) => (
                  <tr key={i} className="border-b"><td className="p-2">{item.medicineName}</td><td className="p-2">{item.dosage}</td><td className="p-2">{item.duration}</td><td className="p-2">{item.instructions}</td></tr>
                ))}
              </tbody>
            </table>
            {viewRx.additionalNotes && <p className="text-sm text-gray-600"><strong>Notes:</strong> {viewRx.additionalNotes}</p>}
            <div className="flex justify-end mt-4 no-print">
              <button onClick={handlePrint} className="btn-primary flex items-center gap-2"><Printer className="w-4 h-4" /> Print</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
