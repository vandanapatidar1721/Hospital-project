import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import { AppError } from '../middleware/errorHandler.js';

const appointmentPopulate = [
  { path: 'patient', select: 'fullName phone age gender bloodGroup address' },
  { path: 'doctor', populate: { path: 'user', select: 'fullName' } },
  { path: 'department', select: 'name' },
];

export const getAppointments = async (req, res, next) => {
  try {
    const { search, status, patient, doctor, date } = req.query;
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

    res.json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
};

export const getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate(appointmentPopulate);
    if (!appointment) throw new AppError('Appointment not found', 404);
    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

export const createAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.create(req.body);
    const populated = await Appointment.findById(appointment._id).populate(appointmentPopulate);
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

export const updateAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate(appointmentPopulate);

    if (!appointment) throw new AppError('Appointment not found', 404);
    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

export const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'Cancelled' },
      { new: true }
    ).populate(appointmentPopulate);

    if (!appointment) throw new AppError('Appointment not found', 404);
    res.json({ success: true, data: appointment, message: 'Appointment cancelled' });
  } catch (error) {
    next(error);
  }
};
