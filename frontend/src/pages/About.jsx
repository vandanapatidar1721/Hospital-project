import { useState } from 'react';
import {
  Activity,
  Award,
  Building2,
  CalendarCheck,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  Users,
} from 'lucide-react';

const sections = [
  {
    key: 'overview',
    label: 'Overview',
    icon: Building2,
    title: 'About Our Hospital',
    content:
      'Hospital Management System helps organize daily hospital operations in one place. It connects administrators, doctors, receptionists, and patients with secure digital workflows.',
    points: ['Centralized hospital records', 'Role-based access', 'Fast patient service', 'Digital appointments and billing'],
  },
  {
    key: 'services',
    label: 'Services',
    icon: HeartPulse,
    title: 'Core Healthcare Services',
    content:
      'The hospital supports multiple departments and care workflows, from registration to consultation, prescriptions, and billing.',
    points: ['Doctor consultations', 'Patient registration', 'Appointment booking', 'Digital prescriptions', 'Billing and invoices'],
  },
  {
    key: 'quality',
    label: 'Quality',
    icon: Award,
    title: 'Quality and Patient Care',
    content:
      'The system is designed to reduce manual work, improve record accuracy, and help hospital staff deliver better patient care.',
    points: ['Clean patient history', 'Quick access to records', 'Reduced paperwork', 'Better staff coordination'],
  },
  {
    key: 'security',
    label: 'Security',
    icon: ShieldCheck,
    title: 'Secure Access',
    content:
      'Every user gets access based on their role, keeping hospital data organized and controlled across different departments.',
    points: ['Protected login', 'Role-based dashboards', 'Admin user control', 'Active/inactive account status'],
  },
];

const stats = [
  { label: 'Departments', value: '6+', icon: Building2 },
  { label: 'Doctors', value: '24/7', icon: Stethoscope },
  { label: 'Patients', value: '1000+', icon: Users },
  { label: 'Appointments', value: 'Fast', icon: CalendarCheck },
];

export default function About() {
  const [active, setActive] = useState(sections[0]);
  const ActiveIcon = active.icon;

  return (
    <div className="space-y-8">
      <div className="card bg-primary-800 text-white overflow-hidden relative">
        <div className="absolute right-8 top-8 opacity-10">
          <Activity className="w-40 h-40" />
        </div>
        <div className="relative max-w-3xl">
          <p className="text-primary-100 text-sm font-medium mb-2">Welcome to HMS</p>
          <h1 className="text-3xl font-bold mb-4">Hospital Management System</h1>
          <p className="text-primary-100 text-lg leading-relaxed">
            A modern digital platform for managing hospital departments, doctors, patients,
            appointments, prescriptions, billing, and user access from one secure dashboard.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="stat-card">
            <div className="p-3 rounded-lg bg-primary-600">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="card lg:col-span-1 space-y-2">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = active.key === section.key;
            return (
              <button
                key={section.key}
                onClick={() => setActive(section)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  isActive ? 'bg-primary-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{section.label}</span>
              </button>
            );
          })}
        </div>

        <div className="card lg:col-span-3">
          <div className="flex items-start gap-4 mb-5">
            <div className="p-3 rounded-lg bg-primary-100 text-primary-700">
              <ActiveIcon className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{active.title}</h2>
              <p className="text-gray-600 mt-2 leading-relaxed">{active.content}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {active.points.map((point) => (
              <div key={point} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                <div className="w-2 h-2 rounded-full bg-primary-600" />
                <span className="text-gray-700">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
