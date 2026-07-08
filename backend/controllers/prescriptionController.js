import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Prescription from '../models/Prescription.js';
import Appointment from '../models/Appointment.js';
import { AppError } from '../middleware/errorHandler.js';
import { assertDoctorOrPatientAccess } from '../services/ownership.js';

const prescriptionPopulate = [
  { path: 'patient', select: 'fullName age gender phone bloodGroup' },
  { path: 'doctor', populate: { path: 'user', select: 'fullName' } },
  { path: 'appointment', select: 'appointmentDate appointmentTime status' },
];

export const getPrescriptions = async (req, res, next) => {
  try {
    const { search, patient, doctor, appointment } = req.query;
    let filter = {};

    if (patient) filter.patient = patient;
    if (doctor) filter.doctor = doctor;
    if (appointment) filter.appointment = appointment;

    if (req.user.role === 'doctor') {
      const doc = await Doctor.findOne({ user: req.user._id });
      if (doc) filter.doctor = doc._id;
    }

    if (req.user.role === 'patient') {
      const pat = await Patient.findOne({ user: req.user._id });
      if (pat) filter.patient = pat._id;
    }

    let prescriptions = await Prescription.find(filter).populate(prescriptionPopulate).sort({ createdAt: -1 });

    if (search) {
      const term = search.toLowerCase();
      prescriptions = prescriptions.filter(
        (p) =>
          p.patient?.fullName?.toLowerCase().includes(term) ||
          p.doctor?.user?.fullName?.toLowerCase().includes(term) ||
          p.items.some((i) => i.medicineName.toLowerCase().includes(term))
      );
    }

    res.json({ success: true, data: prescriptions });
  } catch (error) {
    next(error);
  }
};

export const getPrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id).populate(prescriptionPopulate);
    if (!prescription) throw new AppError('Prescription not found', 404);
    await assertDoctorOrPatientAccess(req.user, prescription);
    res.json({ success: true, data: prescription });
  } catch (error) {
    next(error);
  }
};

export const createPrescription = async (req, res, next) => {
  try {
    const { appointment: appointmentId, items, additionalNotes } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) throw new AppError('Appointment not found', 404);

    if (req.user.role === 'doctor') {
      const doc = await Doctor.findOne({ user: req.user._id });
      if (!doc || doc._id.toString() !== appointment.doctor.toString()) {
        throw new AppError('You can only create prescriptions for your appointments', 403);
      }
    }

    const existing = await Prescription.findOne({ appointment: appointmentId });
    if (existing) throw new AppError('Prescription already exists for this appointment', 400);

    const prescription = await Prescription.create({
      appointment: appointmentId,
      patient: appointment.patient,
      doctor: appointment.doctor,
      items,
      additionalNotes,
    });

    if (appointment.status === 'Pending') {
      appointment.status = 'Completed';
      await appointment.save();
    }

    const populated = await Prescription.findById(prescription._id).populate(prescriptionPopulate);
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};
