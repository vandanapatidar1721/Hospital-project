import { useEffect, useState } from 'react';
import { Plus, Printer, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';
import { EmptyState, TableSkeleton } from '../components/LoadingSpinner';
import { formatDate, formatCurrency, getDoctorName, getStatusBadge } from '../utils/helpers';
import useDebouncedValue from '../hooks/useDebouncedValue';
import { useAuth } from '../context/AuthContext';

export default function Bills() {
  const { user } = useAuth();
  const canCreate = ['admin', 'receptionist'].includes(user?.role);
  const [bills, setBills] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewBill, setViewBill] = useState(null);
  const [form, setForm] = useState({ appointment: '', consultationFee: '', medicineCharges: '', status: 'Unpaid' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [billRes, apptRes] = await Promise.all([
        api.get('/bills', { params: { search: debouncedSearch } }),
        ...(canCreate ? [api.get('/appointments', { params: { status: 'Completed' } })] : [Promise.resolve({ data: { data: [] } })]),
      ]);
      setBills(billRes.data.data);
      if (canCreate) setAppointments(apptRes.data.data);
    } catch {
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [debouncedSearch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/bills', {
        appointment: form.appointment,
        consultationFee: Number(form.consultationFee) || undefined,
        medicineCharges: Number(form.medicineCharges) || undefined,
        status: form.status,
      });
      toast.success('Bill generated');
      setModalOpen(false);
      setForm({ appointment: '', consultationFee: '', medicineCharges: '', status: 'Unpaid' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate bill');
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await api.put(`/bills/${id}`, { status: 'Paid' });
      toast.success('Bill marked as paid');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 no-print">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <div className="grid grid-cols-[3fr_2fr] sm:flex sm:flex-row sm:flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <SearchBar value={search} onChange={setSearch} placeholder="Search bills..." className="min-w-0" />
          {canCreate && (
            <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" /> Generate Bill
            </button>
          )}
        </div>
      </div>

      {loading ? <TableSkeleton rows={6} columns={7} /> : bills.length === 0 ? (
        <EmptyState message="No bills found" />
      ) : (
        <div className="card overflow-x-auto no-print">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 pr-4">Patient</th>
                <th className="pb-3 pr-4">Doctor</th>
                <th className="pb-3 pr-4">Consultation</th>
                <th className="pb-3 pr-4">Medicine</th>
                <th className="pb-3 pr-4">Total</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((b) => (
                <tr key={b._id} className="border-b last:border-0">
                  <td className="py-3 pr-4 font-medium">{b.patient?.fullName}</td>
                  <td className="py-3 pr-4">{getDoctorName(b.doctor)}</td>
                  <td className="py-3 pr-4">{formatCurrency(b.consultationFee)}</td>
                  <td className="py-3 pr-4">{formatCurrency(b.medicineCharges)}</td>
                  <td className="py-3 pr-4 font-semibold">{formatCurrency(b.totalAmount)}</td>
                  <td className="py-3 pr-4"><span className={`badge ${getStatusBadge(b.status)}`}>{b.status}</span></td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setViewBill(b)} className="icon-btn"><Eye className="w-4 h-4" /></button>
                      {canCreate && b.status === 'Unpaid' && (
                        <button onClick={() => handleMarkPaid(b._id)} className="text-xs btn-primary py-1 px-2">Mark Paid</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Generate Bill">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Completed Appointment</label>
            <select value={form.appointment} onChange={(e) => setForm({ ...form, appointment: e.target.value })} className="input-field" required>
              <option value="">Select appointment</option>
              {appointments.map((a) => (
                <option key={a._id} value={a._id}>{a.patient?.fullName} - {formatDate(a.appointmentDate)} - {getDoctorName(a.doctor)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Consultation Fee (leave empty for auto)</label>
            <input type="number" value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: e.target.value })} className="input-field" min={0} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Medicine Charges (leave empty for auto from prescription)</label>
            <input type="number" value={form.medicineCharges} onChange={(e) => setForm({ ...form, medicineCharges: e.target.value })} className="input-field" min={0} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
              <option value="Unpaid">Unpaid</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Generate</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!viewBill} onClose={() => setViewBill(null)} title="Invoice" size="lg">
        {viewBill && (
          <div id="bill-print">
            <div className="text-center border-b pb-4 mb-4">
              <h2 className="text-xl font-bold">Hospital Management System</h2>
              <p className="text-gray-500 text-sm">Invoice / Bill</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 text-sm">
              <p><span className="text-gray-500">Patient:</span> <strong>{viewBill.patient?.fullName}</strong></p>
              <p><span className="text-gray-500">Doctor:</span> {getDoctorName(viewBill.doctor)}</p>
              <p><span className="text-gray-500">Date:</span> {formatDate(viewBill.createdAt)}</p>
              <p><span className="text-gray-500">Appointment:</span> {formatDate(viewBill.appointment?.appointmentDate)}</p>
            </div>
            <table className="w-full text-sm mb-4">
              <tbody>
                <tr className="border-b"><td className="py-2">Consultation Fee</td><td className="py-2 text-right">{formatCurrency(viewBill.consultationFee)}</td></tr>
                <tr className="border-b"><td className="py-2">Medicine Charges</td><td className="py-2 text-right">{formatCurrency(viewBill.medicineCharges)}</td></tr>
                <tr className="font-bold text-base sm:text-lg"><td className="py-2">Total Amount</td><td className="py-2 text-right">{formatCurrency(viewBill.totalAmount)}</td></tr>
              </tbody>
            </table>
            <p className="text-sm">Status: <span className={`badge ${getStatusBadge(viewBill.status)}`}>{viewBill.status}</span></p>
            <div className="flex justify-end mt-4 no-print">
              <button onClick={() => window.print()} className="btn-primary flex items-center gap-2 w-full sm:w-auto"><Printer className="w-4 h-4" /> Print Invoice</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
