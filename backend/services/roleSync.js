import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Receptionist from '../models/Receptionist.js';

const toId = (value) => String(value?._id || value || '');

export const cleanupStaleRoleData = async () => {
  const [users, doctors, linkedPatients, receptionists] = await Promise.all([
    User.find({ role: { $in: ['doctor', 'patient', 'receptionist'] } }).select('_id role').lean(),
    Doctor.find().select('_id user').lean(),
    Patient.find({ user: { $exists: true, $ne: null } }).select('_id user').lean(),
    Receptionist.find().select('_id user').lean(),
  ]);

  const existingUserIds = new Set(users.map((user) => toId(user._id)));
  const doctorUserIds = new Set(doctors.map((doctor) => toId(doctor.user)).filter(Boolean));
  const patientUserIds = new Set(linkedPatients.map((patient) => toId(patient.user)).filter(Boolean));
  const receptionistUserIds = new Set(receptionists.map((receptionist) => toId(receptionist.user)).filter(Boolean));

  const orphanDoctorIds = doctors
    .filter((doctor) => !existingUserIds.has(toId(doctor.user)))
    .map((doctor) => doctor._id);
  const orphanPatientIds = linkedPatients
    .filter((patient) => !existingUserIds.has(toId(patient.user)))
    .map((patient) => patient._id);
  const orphanReceptionistIds = receptionists
    .filter((receptionist) => !existingUserIds.has(toId(receptionist.user)))
    .map((receptionist) => receptionist._id);

  const [deletedDoctors, deletedPatients, deletedReceptionists] = await Promise.all([
    Doctor.deleteMany({ _id: { $in: orphanDoctorIds } }),
    Patient.deleteMany({ _id: { $in: orphanPatientIds } }),
    Receptionist.deleteMany({ _id: { $in: orphanReceptionistIds } }),
  ]);

  return {
    doctors: deletedDoctors.deletedCount || 0,
    patients: deletedPatients.deletedCount || 0,
    receptionists: deletedReceptionists.deletedCount || 0,
    users: 0,
  };
};
