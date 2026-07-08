import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import { AppError } from '../middleware/errorHandler.js';

export const getDoctorProfileForUser = async (userId) => Doctor.findOne({ user: userId });
export const getPatientProfileForUser = async (userId) => Patient.findOne({ user: userId });

export const ensurePatientOwns = async (userId, patientId) => {
  const patient = await getPatientProfileForUser(userId);
  if (!patient || String(patient._id) !== String(patientId)) {
    throw new AppError('Access denied for this patient record', 403);
  }
  return patient;
};

export const ensureDoctorOwns = async (userId, doctorId) => {
  const doctor = await getDoctorProfileForUser(userId);
  if (!doctor || String(doctor._id) !== String(doctorId)) {
    throw new AppError('Access denied for this doctor record', 403);
  }
  return doctor;
};

export const assertAppointmentAccess = async (user, appointment) => {
  if (['admin', 'receptionist'].includes(user.role)) return;
  if (user.role === 'doctor') {
    await ensureDoctorOwns(user._id, appointment.doctor);
    return;
  }
  if (user.role === 'patient') {
    await ensurePatientOwns(user._id, appointment.patient);
    return;
  }
  throw new AppError('Access denied', 403);
};

export const assertPatientAccess = async (user, patientId) => {
  if (['admin', 'doctor', 'receptionist'].includes(user.role)) return;
  await ensurePatientOwns(user._id, patientId);
};

export const assertDoctorOrPatientAccess = async (user, entity) => {
  if (['admin', 'receptionist'].includes(user.role)) return;
  if (user.role === 'doctor' && entity.doctor) {
    await ensureDoctorOwns(user._id, entity.doctor);
    return;
  }
  if (user.role === 'patient' && entity.patient) {
    await ensurePatientOwns(user._id, entity.patient);
    return;
  }
  throw new AppError('Access denied', 403);
};
