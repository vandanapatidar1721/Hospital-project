import { useEffect, useState } from 'react';
import { Users, UserCheck, Stethoscope, Building2, Calendar, FileText, Receipt } from 'lucide-react';
import api from '../services/api';
import { DashboardSkeleton } from '../components/LoadingSpinner';
import { formatDate, getDoctorName, getStatusBadge } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="stat-card">
      <div className={`p-2.5 sm:p-3 rounded-lg shrink-0 ${color}`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs sm:text-sm text-gray-500 truncate">{label}</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function DashboardHero({ title, subtitle }) {
  return (
    <div className="card border-l-4 border-primary-600">
      <p className="text-sm font-medium text-primary-600">Welcome back</p>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{title}</h1>
      <p className="text-sm sm:text-base text-gray-600 mt-2">{subtitle}</p>
    </div>
  );
}

function DashboardError({ message }) {
  return (
    <div className="card max-w-2xl">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Dashboard unavailable</h1>
      <p className="text-gray-600">
        {message || 'Unable to load dashboard data for this account.'}
      </p>
    </div>
  );
}

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/admin')
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load admin dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error || !data) return <DashboardError message={error} />;

  const { stats, todayAppointments, recentPrescriptions } = data;

  return (
    <div className="space-y-5 sm:space-y-8">
      <DashboardHero title="Admin Dashboard" subtitle="A soft overview of hospital activity, teams, appointments, and prescriptions." />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard icon={Stethoscope} label="Total Doctors" value={stats.totalDoctors} color="bg-primary-600" />
        <StatCard icon={Users} label="Total Patients" value={stats.totalPatients} color="bg-primary-500" />
        <StatCard icon={UserCheck} label="Receptionists" value={stats.totalReceptionists || 0} color="bg-primary-500" />
        <StatCard icon={Building2} label="Departments" value={stats.totalDepartments} color="bg-primary-600" />
        <StatCard icon={Calendar} label="Total Appointments" value={stats.totalAppointments} color="bg-primary-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Today&apos;s Appointments</h2>
          {todayAppointments.length === 0 ? (
            <p className="text-gray-500 text-sm">No appointments today</p>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((a) => (
                <div key={a._id} className="soft-list-item flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{a.patient?.fullName}</p>
                    <p className="text-sm text-gray-500">{getDoctorName(a.doctor)} • {a.department?.name}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-sm font-medium">{a.appointmentTime}</p>
                    <span className={`badge ${getStatusBadge(a.status)}`}>{a.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Recent Prescriptions</h2>
          {recentPrescriptions.length === 0 ? (
            <p className="text-gray-500 text-sm">No prescriptions yet</p>
          ) : (
            <div className="space-y-3">
              {recentPrescriptions.map((p) => (
                <div key={p._id} className="soft-list-item flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{p.patient?.fullName}</p>
                    <p className="text-sm text-gray-500">Dr. {getDoctorName(p.doctor)}</p>
                  </div>
                  <p className="text-sm text-gray-500 sm:text-right">{formatDate(p.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DoctorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/doctor')
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load doctor dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error || !data) return <DashboardError message={error} />;

  return (
    <div className="space-y-5 sm:space-y-8">
      <DashboardHero title="Doctor Dashboard" subtitle="Keep today’s consultations, patients, and schedule beautifully organized." />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard icon={Calendar} label="Total Appointments" value={data.stats.totalAppointments} color="bg-primary-600" />
        <StatCard icon={Calendar} label="Today's Appointments" value={data.stats.todayCount} color="bg-primary-500" />
      </div>
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Today&apos;s Schedule</h2>
        {data.todayAppointments.length === 0 ? (
          <p className="text-gray-500">No appointments scheduled for today</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-3">Time</th>
                  <th className="pb-3">Patient</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.todayAppointments.map((a) => (
                  <tr key={a._id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{a.appointmentTime}</td>
                    <td className="py-3">{a.patient?.fullName}</td>
                    <td className="py-3">{a.department?.name}</td>
                    <td className="py-3"><span className={`badge ${getStatusBadge(a.status)}`}>{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ReceptionistDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/receptionist')
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load receptionist dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error || !data) return <DashboardError message={error} />;

  return (
    <div className="space-y-5 sm:space-y-8">
      <DashboardHero title="Receptionist Dashboard" subtitle="Manage front-desk activity, registrations, appointments, and billing with ease." />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard icon={Calendar} label="Today's Appointments" value={data.stats.todayAppointments} color="bg-primary-700" />
        <StatCard icon={Users} label="Recent Patients" value={data.stats.registeredPatients} color="bg-primary-500" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Today&apos;s Appointments</h2>
          {data.todayAppointments.map((a) => (
            <div key={a._id} className="soft-list-item flex flex-col sm:flex-row sm:justify-between gap-2 mb-2">
              <div>
                <p className="font-medium">{a.patient?.fullName}</p>
                <p className="text-sm text-gray-500">{getDoctorName(a.doctor)}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-sm">{a.appointmentTime}</p>
                <span className={`badge ${getStatusBadge(a.status)}`}>{a.status}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Registered Patients</h2>
          {data.registeredPatients.map((p) => (
            <div key={p._id} className="soft-list-item flex flex-col sm:flex-row sm:justify-between gap-2 mb-2">
              <p className="font-medium">{p.fullName}</p>
              <p className="text-sm text-gray-500">{p.phone}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PatientDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/patient')
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load patient dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error || !data) return <DashboardError message={error} />;

  return (
    <div className="space-y-5 sm:space-y-8">
      <DashboardHero title="Patient Dashboard" subtitle="Your appointments, prescriptions, and bills in a calm personal health space." />
      <div className="card border-l-4 border-primary-600">
        <h2 className="text-lg font-semibold mb-2">Welcome, {data.patient.fullName}</h2>
        <p className="text-gray-500 text-sm">Blood Group: {data.patient.bloodGroup} • Age: {data.patient.age}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="card">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Calendar className="w-4 h-4" /> My Appointments</h3>
          {data.myAppointments.map((a) => (
            <div key={a._id} className="soft-list-item mb-2">
              <p className="font-medium text-sm">{formatDate(a.appointmentDate)} at {a.appointmentTime}</p>
              <p className="text-xs text-gray-500">{getDoctorName(a.doctor)}</p>
              <span className={`badge ${getStatusBadge(a.status)} mt-1`}>{a.status}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><FileText className="w-4 h-4" /> My Prescriptions</h3>
          {data.myPrescriptions.map((p) => (
            <div key={p._id} className="soft-list-item mb-2">
              <p className="font-medium text-sm">{formatDate(p.createdAt)}</p>
              <p className="text-xs text-gray-500">{p.items.length} medicines prescribed</p>
            </div>
          ))}
        </div>
        <div className="card">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Receipt className="w-4 h-4" /> My Bills</h3>
          {data.myBills.map((b) => (
            <div key={b._id} className="soft-list-item mb-2">
              <p className="font-medium text-sm">₹{b.totalAmount}</p>
              <span className={`badge ${getStatusBadge(b.status)}`}>{b.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const dashboards = { admin: AdminDashboard, doctor: DoctorDashboard, receptionist: ReceptionistDashboard, patient: PatientDashboard };
  const Component = dashboards[user?.role] || AdminDashboard;
  return <Component />;
}
