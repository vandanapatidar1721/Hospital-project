import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Hospital, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { BLOOD_GROUPS, GENDERS } from '../utils/helpers';

const emptyForm = {
  fullName: '',
  email: '',
  password: '',
  age: '',
  gender: 'Male',
  phone: '',
  address: '',
  bloodGroup: 'O+',
};

export default function Signup() {
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signup({ ...form, age: Number(form.age) });
      toast.success('Account created successfully');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-primary-800 text-white p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <Hospital className="w-10 h-10" />
          <span className="text-3xl font-bold">Hospital Management System</span>
        </div>
        <div>
          <h2 className="text-4xl font-bold mb-4">Create Your Patient Account</h2>
          <p className="text-primary-200 text-lg leading-relaxed">
            Sign up to view appointments, prescriptions, and bills from one secure patient portal.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <Hospital className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">Patient Signup</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create patient account</h2>
          <p className="text-gray-500 mb-8">Your account will be registered as a patient.</p>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                value={form.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                className="input-field"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="input-field"
                placeholder="Enter your email"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="input-field pr-10"
                  placeholder="At least 6 characters"
                  minLength={6}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => updateField('age', e.target.value)}
                className="input-field"
                min={0}
                max={150}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select value={form.gender} onChange={(e) => updateField('gender', e.target.value)} className="input-field">
                {GENDERS.map((gender) => <option key={gender}>{gender}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
              <select value={form.bloodGroup} onChange={(e) => updateField('bloodGroup', e.target.value)} className="input-field">
                {BLOOD_GROUPS.map((group) => <option key={group}>{group}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="input-field"
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                className="input-field"
                placeholder="Enter your address"
                required
              />
            </div>

            <div className="sm:col-span-2 space-y-4">
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Creating account...' : 'Sign Up as Patient'}
              </button>
              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary-600 hover:underline">Sign in</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
