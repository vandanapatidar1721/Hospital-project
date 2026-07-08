import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Departments from './pages/Departments';
import Doctors from './pages/Doctors';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Prescriptions from './pages/Prescriptions';
import Bills from './pages/Bills';
import Users from './pages/Users';
import Receptionists from './pages/Receptionists';
import ChangePassword from './pages/ChangePassword';
import Profile from './pages/Profile';
import About from './pages/About';

function AppRoutes() {
  const { user } = useAuth();

  return (
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
  );
}

export default function App() {
  return <AppRoutes />;
}
