import { useEffect, useState } from 'react';
import { Mail, Phone, ShieldCheck, UserCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-900">{value || '-'}</p>
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const [account, setAccount] = useState(user);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/auth/me');
        setAccount(data.user);

        if (data.user.role === 'doctor') {
          const doctorRes = await api.get('/doctors/me').catch(() => null);
          setProfile(doctorRes?.data?.data || null);
        } else if (data.user.role === 'patient') {
          const patientRes = await api.get('/patients/me').catch(() => null);
          setProfile(patientRes?.data?.data || null);
        } else {
          setProfile(null);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
            <UserCircle className="w-12 h-12" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{account?.fullName}</h1>
            <p className="text-gray-500 capitalize">{account?.role}</p>
          </div>
          <span className={`badge ${account?.isActive ? 'badge-completed' : 'badge-cancelled'}`}>
            {account?.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-gray-400 mt-1" />
            <Detail label="Email" value={account?.email} />
          </div>
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-gray-400 mt-1" />
            <Detail label="Phone" value={account?.phone} />
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-gray-400 mt-1" />
            <Detail label="Role" value={account?.role} />
          </div>
        </div>
      </div>

      {account?.role === 'doctor' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Doctor Profile</h2>
          {profile ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <Detail label="Department" value={profile.department?.name} />
              <Detail label="Qualification" value={profile.qualification} />
              <Detail label="Experience" value={`${profile.experience} years`} />
              <Detail label="Consultation Fee" value={`₹${profile.consultationFee}`} />
              <Detail label="Profile Phone" value={profile.phone} />
            </div>
          ) : (
            <p className="text-gray-500">No linked doctor profile found for this account.</p>
          )}
        </div>
      )}

      {account?.role === 'patient' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Profile</h2>
          {profile ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <Detail label="Age" value={profile.age} />
              <Detail label="Gender" value={profile.gender} />
              <Detail label="Blood Group" value={profile.bloodGroup} />
              <Detail label="Profile Phone" value={profile.phone} />
              <div className="sm:col-span-2">
                <Detail label="Address" value={profile.address} />
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No linked patient profile found for this account.</p>
          )}
        </div>
      )}
    </div>
  );
}
