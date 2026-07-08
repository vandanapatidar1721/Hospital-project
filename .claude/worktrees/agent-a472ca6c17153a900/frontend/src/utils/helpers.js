export const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);

export const getDoctorName = (doctor) => doctor?.user?.fullName || 'Unknown Doctor';

export const getStatusBadge = (status) => {
  const map = {
    Pending: 'badge-pending',
    Completed: 'badge-completed',
    Cancelled: 'badge-cancelled',
    Paid: 'badge-paid',
    Unpaid: 'badge-unpaid',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
};

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const GENDERS = ['Male', 'Female', 'Other'];
export const APPOINTMENT_STATUSES = ['Pending', 'Completed', 'Cancelled'];
export const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM',
];
