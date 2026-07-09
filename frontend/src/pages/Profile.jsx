import { useEffect, useRef, useState } from 'react';
import { Camera, Loader2, Mail, Phone, ShieldCheck, Trash2, UserCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import api, { getApiErrorMessage, getFileUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';

function Detail({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-900 break-words">{value || '-'}</p>
    </div>
  );
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [account, setAccount] = useState(user);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/auth/me');
        setAccount(data.user);
        updateUser(data.user);

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

  const handleProfileImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profileImage', file);

    setUploading(true);
    try {
      const { data } = await api.post('/auth/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAccount(data.data);
      updateUser(data.data);
      setShowPhotoOptions(false);
      toast.success(data.message || 'Profile photo updated');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to upload profile photo'));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDeleteProfileImage = async () => {
    setDeletingImage(true);
    try {
      const { data } = await api.delete('/auth/profile-image');
      setAccount(data.data);
      updateUser(data.data);
      setShowDeleteConfirm(false);
      setShowPhotoOptions(false);
      toast.success(data.message || 'Profile photo deleted');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete profile photo'));
    } finally {
      setDeletingImage(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const profileImageUrl = getFileUrl(account?.profileImage);

  return (
    <div className="space-y-5 sm:space-y-6 max-w-4xl">
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0">
            <div className="w-full h-full rounded-full bg-primary-100 text-primary-700 flex items-center justify-center overflow-hidden ring-4 ring-primary-50">
              {profileImageUrl ? (
                <img src={profileImageUrl} alt={account?.fullName || 'Profile'} className="w-full h-full object-cover" />
              ) : (
                <UserCircle className="w-12 h-12 sm:w-14 sm:h-14" />
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowPhotoOptions(true)}
              disabled={uploading || deletingImage}
              className="absolute -bottom-1 -right-1 inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed"
              title="Upload profile photo"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="hidden"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{account?.fullName}</h1>
            <p className="text-gray-500 capitalize">{account?.role}</p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPhotoOptions(true)}
                disabled={uploading || deletingImage}
                className="btn-secondary gap-1.5 px-3 py-1.5 text-xs"
              >
                {uploading || deletingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                {uploading ? 'Uploading...' : deletingImage ? 'Deleting...' : profileImageUrl ? 'Change Photo' : 'Add Photo'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">JPG, PNG, or WebP image up to 2MB.</p>
          </div>

          <span className={`badge self-start sm:self-center ${account?.isActive ? 'badge-completed' : 'badge-cancelled'}`}>
            {account?.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="card">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Account Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <div className="flex items-start gap-3 min-w-0">
            <Mail className="w-5 h-5 text-gray-400 mt-1 shrink-0" />
            <Detail label="Email" value={account?.email} />
          </div>
          <div className="flex items-start gap-3 min-w-0">
            <Phone className="w-5 h-5 text-gray-400 mt-1 shrink-0" />
            <Detail label="Phone" value={account?.phone} />
          </div>
          <div className="flex items-start gap-3 min-w-0">
            <ShieldCheck className="w-5 h-5 text-gray-400 mt-1 shrink-0" />
            <Detail label="Role" value={account?.role} />
          </div>
        </div>
      </div>

      {account?.role === 'doctor' && (
        <div className="card">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Doctor Profile</h2>
          {profile ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Patient Profile</h2>
          {profile ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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

      <Modal
        isOpen={showPhotoOptions}
        onClose={() => !uploading && !deletingImage && setShowPhotoOptions(false)}
        title="Profile Photo"
        size="sm"
      >
        <div className="space-y-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center overflow-hidden ring-4 ring-primary-50">
            {profileImageUrl ? (
              <img src={profileImageUrl} alt={account?.fullName || 'Profile'} className="w-full h-full object-cover" />
            ) : (
              <UserCircle className="w-12 h-12" />
            )}
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || deletingImage}
              className="btn-secondary gap-1.5 px-3 py-1.5 text-xs"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              {uploading ? 'Uploading...' : profileImageUrl ? 'Change Photo' : 'Add Photo'}
            </button>
            {profileImageUrl && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={uploading || deletingImage}
                className="btn-danger gap-1.5 px-3 py-1.5 text-xs"
              >
                {deletingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                {deletingImage ? 'Deleting...' : 'Delete Photo'}
              </button>
            )}
          </div>
          <p className="text-center text-xs text-gray-500">JPG, PNG, or WebP image up to 2MB.</p>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => !deletingImage && setShowDeleteConfirm(false)}
        title="Delete Profile Photo"
        size="sm"
      >
        <div className="space-y-4 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Delete this photo?</h3>
            <p className="text-sm text-gray-500 mt-1">This profile photo will be removed from your account.</p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deletingImage}
              className="btn-secondary gap-1.5 px-3 py-1.5 text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteProfileImage}
              disabled={deletingImage}
              className="btn-danger gap-1.5 px-3 py-1.5 text-xs"
            >
              {deletingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              {deletingImage ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
