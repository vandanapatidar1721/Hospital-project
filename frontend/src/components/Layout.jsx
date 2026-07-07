import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Stethoscope, Users, Calendar,
  FileText, Receipt, UserCog, LogOut, Menu, X, KeyRound, Hospital,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const navItems = {
  admin: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/departments', icon: Building2, label: 'Departments' },
    { to: '/doctors', icon: Stethoscope, label: 'Doctors' },
    { to: '/patients', icon: Users, label: 'Patients' },
    { to: '/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/prescriptions', icon: FileText, label: 'Prescriptions' },
    { to: '/bills', icon: Receipt, label: 'Billing' },
    { to: '/users', icon: UserCog, label: 'Users' },
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-primary-800 text-white transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-primary-700">
          <button
            onClick={() => {
              navigate('/about');
              setSidebarOpen(false);
            }}
            className="flex items-center gap-3 rounded-lg text-left hover:bg-primary-700 transition-colors w-full p-2 -m-2"
            title="About hospital"
          >
            <Hospital className="w-8 h-8" />
            <div>
              <h1 className="font-bold text-lg">HMS</h1>
              <p className="text-primary-200 text-xs">Hospital Management</p>
            </div>
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {items.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive ? 'bg-primary-600 text-white' : 'text-primary-100 hover:bg-primary-700'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-700">
          <NavLink
            to="/change-password"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-primary-100 hover:bg-primary-700 transition-colors mb-1"
          >
            <KeyRound className="w-5 h-5" />
            <span className="text-sm font-medium">Change Password</span>
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-primary-100 hover:bg-primary-700 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex items-center justify-between no-print">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 ml-auto rounded-lg px-2 py-1 hover:bg-gray-100 transition-colors"
            title="View profile"
          >
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold">
              {user?.fullName?.charAt(0)}
            </div>
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto"><Outlet /></main>
      </div>
    </div>
  );
}
