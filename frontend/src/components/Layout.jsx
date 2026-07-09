import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Stethoscope, Users, Calendar,
  FileText, Receipt, UserCog, UserCheck, LogOut, Menu, X, KeyRound, Hospital,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFileUrl } from '../services/api';

const navItems = {
  admin: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/departments', icon: Building2, label: 'Departments' },
    { to: '/doctors', icon: Stethoscope, label: 'Doctors' },
    { to: '/patients', icon: Users, label: 'Patients' },
    { to: '/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/prescriptions', icon: FileText, label: 'Prescriptions' },
    { to: '/bills', icon: Receipt, label: 'Billing' },
    { to: '/receptionists', icon: UserCheck, label: 'Receptionists' },
    { to: '/users', icon: UserCog, label: 'Role Assign' },
  ],
  doctor: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/appointments', icon: Calendar, label: 'My Appointments' },
    { to: '/patients', icon: Users, label: 'Patients' },
    { to: '/prescriptions', icon: FileText, label: 'Prescriptions' },
  ],
  receptionist: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/patients', icon: Users, label: 'Patients' },
    { to: '/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/bills', icon: Receipt, label: 'Billing' },
    { to: '/doctors', icon: Stethoscope, label: 'Doctors' },
  ],
  patient: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/appointments', icon: Calendar, label: 'My Appointments' },
    { to: '/prescriptions', icon: FileText, label: 'My Prescriptions' },
    { to: '/bills', icon: Receipt, label: 'My Bills' },
  ],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const items = navItems[user?.role] || [];
  const profileImageUrl = getFileUrl(user?.profileImage);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 w-60 sm:w-64 max-w-[85vw] bg-primary-800 text-white shadow-xl transform transition-transform lg:translate-x-0 flex flex-col h-screen max-h-screen ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 sm:p-6 border-b border-primary-700">
          <button
            onClick={() => {
              navigate('/about');
              setSidebarOpen(false);
            }}
            className="group flex items-center gap-3 rounded-xl text-left hover:bg-primary-700 transition-all w-full p-2 -m-2"
            title="About hospital"
          >
            <div className="rounded-xl bg-white text-primary-700 p-2 shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3">
              <Hospital className="w-7 h-7" />
            </div>
            <div>
              <h1 className="font-bold text-lg">HMS</h1>
              <p className="text-primary-200 text-xs">Hospital Management</p>
            </div>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1">
          {items.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 sm:px-4 py-2.5 rounded-lg transition-colors min-h-11 ${
                  isActive ? 'bg-white text-primary-800' : 'text-primary-100 hover:bg-primary-700'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto p-3 sm:p-4 border-t border-primary-700">
          <NavLink
            to="/change-password"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 sm:px-4 py-2.5 rounded-lg text-primary-100 hover:bg-primary-700 transition-colors mb-1 min-h-11"
          >
            <KeyRound className="w-5 h-5" />
            <span className="text-sm font-medium">Change Password</span>
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 sm:px-4 py-2.5 rounded-lg text-primary-100 hover:bg-primary-700 transition-colors w-full min-h-11"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-2.5 sm:px-4 lg:px-6 py-2 flex items-center justify-between no-print shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden min-h-9 min-w-9 inline-flex items-center justify-center rounded-lg hover:bg-gray-100">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 ml-auto min-w-0 rounded-lg px-2 py-0.5 hover:bg-gray-100 transition-colors"
            title="View profile"
          >
            <div className="text-right min-w-0 max-w-[130px] sm:max-w-none">
              <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{user?.fullName}</p>
              <p className="text-[11px] text-gray-500 capitalize truncate">{user?.role}</p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold overflow-hidden">
              {profileImageUrl ? (
                <img src={profileImageUrl} alt={user?.fullName || 'Profile'} className="w-full h-full object-cover" />
              ) : (
                user?.fullName?.charAt(0)
              )}
            </div>
          </button>
        </header>

        <main className="relative z-0 flex-1 min-w-0 p-3 sm:p-4 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>

        <footer className="sticky bottom-0 z-20 no-print border-t border-primary-500 bg-primary-700 px-3 sm:px-4 lg:px-8 py-3 text-xs sm:text-sm text-white shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <p className="font-semibold text-white">Hospital Management System</p>
              <p className="mt-1 text-primary-50">Digital platform for appointments, patients, doctors, prescriptions, billing, and role management.</p>
            </div>
            <div>
              <p className="font-semibold text-white">Support</p>
              <p className="mt-1 text-primary-50">24/7 Care Desk</p>
              <p className="text-primary-50">Phone: +91 98765 43210</p>
              <p className="text-primary-50">Email: support@hms.local</p>
            </div>
            <div>
              <p className="font-semibold text-white">Quick Info</p>
              <p className="mt-1 text-primary-50">Emergency: 108</p>
              <p className="text-primary-50">OPD Hours: 09:00 AM - 06:00 PM</p>
              <p className="text-primary-50">Location: Main Hospital Campus</p>
            </div>
            <div>
              <p className="font-semibold text-white">Secure Access</p>
              <p className="mt-1 text-primary-50">Logged in as <span className="capitalize">{user?.role || 'user'}</span></p>
              <p className="text-primary-50">Data protected with authenticated access.</p>
              <p className="text-primary-50">© {new Date().getFullYear()} HMS. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
