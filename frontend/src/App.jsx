import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { PageSkeleton } from './components/LoadingSpinner';

const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Departments = lazy(() => import('./pages/Departments'));
const Doctors = lazy(() => import('./pages/Doctors'));
const Patients = lazy(() => import('./pages/Patients'));
const Appointments = lazy(() => import('./pages/Appointments'));
const Prescriptions = lazy(() => import('./pages/Prescriptions'));
const Bills = lazy(() => import('./pages/Bills'));
const Users = lazy(() => import('./pages/Users'));
const Receptionists = lazy(() => import('./pages/Receptionists'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const Profile = lazy(() => import('./pages/Profile'));
const About = lazy(() => import('./pages/About'));

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Suspense fallback={<div className="p-3 sm:p-4 lg:p-8"><PageSkeleton /></div>}>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="departments" element={<ProtectedRoute roles={['admin']}><Departments /></ProtectedRoute>} />
          <Route path="doctors" element={<ProtectedRoute roles={['admin', 'receptionist', 'patient']}><Doctors /></ProtectedRoute>} />
          <Route path="patients" element={<ProtectedRoute roles={['admin', 'doctor', 'receptionist']}><Patients /></ProtectedRoute>} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="prescriptions" element={<Prescriptions />} />
          <Route path="bills" element={<ProtectedRoute roles={['admin', 'receptionist', 'patient']}><Bills /></ProtectedRoute>} />
          <Route path="receptionists" element={<ProtectedRoute roles={['admin']}><Receptionists /></ProtectedRoute>} />
          <Route path="users" element={<ProtectedRoute roles={['admin']}><Users /></ProtectedRoute>} />
          <Route path="profile" element={<Profile />} />
          <Route path="about" element={<About />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return <AppRoutes />;
}
