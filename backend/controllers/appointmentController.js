import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Department from '../models/Department.js';
import Appointment from '../models/Appointment.js';
import { AppError } from '../middleware/errorHandler.js';
import { getPagination, paginatedResponse } from '../services/pagination.js';
import { assertAppointmentAccess } from '../services/ownership.js';

const appointmentPopulate = [
  { path: 'patient', select: 'fullName phone age gender bloodGroup address' },
  { path: 'doctor', populate: { path: 'user', select: 'fullName' } },
  { path: 'department', select: 'name' },
];

export const getAppointments = async (req, res, next) => {
  try {
    const { search, status, patient, doctor, date } = req.query;
    const { page, limit, skip } = getPagination(req.query);
    let filter = {};

    if (status) filter.status = status;
    if (patient) filter.patient = patient;
    if (doctor) filter.doctor = doctor;
    if (date) {
      const d = new Date(date);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));
      filter.appointmentDate = { $gte: start, $lte: end };
    }

    if (req.user.role === 'doctor') {
      const doc = await Doctor.findOne({ user: req.user._id });
      if (doc) filter.doctor = doc._id;
    }

    if (req.user.role === 'patient') {
      const pat = await Patient.findOne({ user: req.user._id });
      if (pat) filter.patient = pat._id;
    }

    let appointments = await Appointment.find(filter).populate(appointmentPopulate).sort({ appointmentDate: -1 });

    if (search) {
      const term = search.toLowerCase();
      appointments = appointments.filter(
        (a) =>
          a.patient?.fullName?.toLowerCase().includes(term) ||
          a.doctor?.user?.fullName?.toLowerCase().includes(term) ||
          a.department?.name?.toLowerCase().includes(term)
      );
    }

    const total = appointments.length;
    res.json(paginatedResponse(appointments.slice(skip, skip + limit), total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate(appointmentPopulate);
    if (!appointment) throw new AppError('Appointment not found', 404);
    await assertAppointmentAccess(req.user, appointment);
    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

export const createAppointment = async (req, res, next) => {
  try {
    let patientId = req.body.patient;

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user._id });
      if (!patient) throw new AppError('Patient profile not found', 404);
      patientId = patient._id;
    }

    const [patient, doctor, department] = await Promise.all([
      Patient.findById(patientId),
      Doctor.findById(req.body.doctor),
      Department.findById(req.body.department),
    ]);

    if (!patient) throw new AppError('Patient not found', 404);
    if (!doctor) throw new AppError('Doctor not found', 404);
    if (!department) throw new AppError('Department not found', 404);
    if (String(doctor.department) !== String(department._id)) {
      throw new AppError('Selected doctor does not belong to this department', 400);
    }

    const appointmentDate = new Date(req.body.appointmentDate);
    const start = new Date(appointmentDate.setHours(0, 0, 0, 0));
    const end = new Date(appointmentDate.setHours(23, 59, 59, 999));
    const existingPatientAppointment = await Appointment.findOne({
      patient: patientId,
      doctor: doctor._id,
      appointmentDate: { $gte: start, $lte: end },
      appointmentTime: req.body.appointmentTime,
      status: { $ne: 'Cancelled' },
    }).populate(appointmentPopulate);
    if (existingPatientAppointment) {
      return res.status(200).json({ success: true, data: existingPatientAppointment, message: 'Appointment already booked' });
    }

    const existingSlot = await Appointment.findOne({
      doctor: doctor._id,
      appointmentDate: { $gte: start, $lte: end },
      appointmentTime: req.body.appointmentTime,
      status: { $ne: 'Cancelled' },
    });
    if (existingSlot) throw new AppError('Doctor already has an appointment at this time', 400);

    const appointment = await Appointment.create({
      ...req.body,
      patient: patientId,
      department: department._id,
    });
    const populated = await Appointment.findById(appointment._id).populate(appointmentPopulate);
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    if (error.code === 11000) {
      return next(new AppError('Appointment already exists for this patient, doctor, date, and time', 400));
    }
    next(error);
  }
};

export const updateAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) throw new AppError('Appointment not found', 404);
    await assertAppointmentAccess(req.user, appointment);

    if (req.body.appointmentDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextDate = new Date(req.body.appointmentDate);
      nextDate.setHours(0, 0, 0, 0);
      if (nextDate < today) throw new AppError('Appointment date cannot be in the past', 400);
    }

    if (req.user.role === 'doctor') {
      const allowed = ['status', 'notes'];
      Object.keys(req.body).forEach((key) => {
        if (!allowed.includes(key)) delete req.body[key];
      });
    }

    Object.assign(appointment, req.body);
    await appointment.save();

    const populated = await Appointment.findById(appointment._id).populate(appointmentPopulate);
    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

export const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) throw new AppError('Appointment not found', 404);
    await assertAppointmentAccess(req.user, appointment);

    appointment.status = 'Cancelled';
    await appointment.save();

    const populated = await Appointment.findById(appointment._id).populate(appointmentPopulate);
    res.json({ success: true, data: populated, message: 'Appointment cancelled' });
  } catch (error) {
    next(error);
  }
};

export const deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) throw new AppError('Appointment not found', 404);
    await assertAppointmentAccess(req.user, appointment);

    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    next(error);
  }
};
