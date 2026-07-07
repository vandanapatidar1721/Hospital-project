import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Department from '../models/Department.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import Bill from '../models/Bill.js';

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfToday = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
};

export const getAdminDashboard = async (req, res, next) => {
  try {
    const todayStart = startOfToday();
    const todayEnd = endOfToday();

    const [totalDoctors, totalPatients, totalDepartments, totalAppointments, todayAppointments, recentPrescriptions] =
      await Promise.all([
        Doctor.countDocuments(),
        Patient.countDocuments(),
        Department.countDocuments(),
        Appointment.countDocuments(),
        Appointment.find({
          appointmentDate: { $gte: todayStart, $lte: todayEnd },
          status: { $ne: 'Cancelled' },
        })
          .populate('patient', 'fullName')
          .populate({ path: 'doctor', populate: { path: 'user', select: 'fullName' } })
          .populate('department', 'name')
          .sort({ appointmentTime: 1 })
          .limit(10),
        Prescription.find()
          .populate('patient', 'fullName')
          .populate({ path: 'doctor', populate: { path: 'user', select: 'fullName' } })
          .sort({ createdAt: -1 })
          .limit(5),
      ]);

    res.json({
      success: true,
      data: {
        stats: { totalDoctors, totalPatients, totalDepartments, totalAppointments },
        todayAppointments,
        recentPrescriptions,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorDashboard = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.json({
        success: true,
        data: {
          doctor: null,
          stats: { totalAppointments: 0, todayCount: 0 },
          todayAppointments: [],
        },
      });
    }

    const todayStart = startOfToday();
    const todayEnd = endOfToday();

    const [todayAppointments, totalAppointments] = await Promise.all([
      Appointment.find({
        doctor: doctor._id,
        appointmentDate: { $gte: todayStart, $lte: todayEnd },
        status: { $ne: 'Cancelled' },
      })
        .populate('patient', 'fullName phone age gender')
        .populate('department', 'name')
        .sort({ appointmentTime: 1 }),
      Appointment.countDocuments({ doctor: doctor._id }),
    ]);

    res.json({
      success: true,
      data: { doctor, stats: { totalAppointments, todayCount: todayAppointments.length }, todayAppointments },
    });
  } catch (error) {
    next(error);
  }
};

export const getReceptionistDashboard = async (req, res, next) => {
  try {
    const todayStart = startOfToday();
    const todayEnd = endOfToday();

    const [todayAppointments, registeredPatients] = await Promise.all([
      Appointment.find({
        appointmentDate: { $gte: todayStart, $lte: todayEnd },
      })
        .populate('patient', 'fullName phone')
        .populate({ path: 'doctor', populate: { path: 'user', select: 'fullName' } })
        .populate('department', 'name')
        .sort({ appointmentTime: 1 }),
      Patient.find().sort({ createdAt: -1 }).limit(10),
    ]);

    res.json({
      success: true,
      data: {
        stats: { todayAppointments: todayAppointments.length, registeredPatients: registeredPatients.length },
        todayAppointments,
        registeredPatients,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientDashboard = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.json({
        success: true,
        data: {
          patient: {
            fullName: req.user.fullName,
            bloodGroup: '-',
            age: '-',
          },
          myAppointments: [],
          myPrescriptions: [],
          myBills: [],
        },
      });
    }

    const [myAppointments, myPrescriptions, myBills] = await Promise.all([
      Appointment.find({ patient: patient._id })
        .populate({ path: 'doctor', populate: { path: 'user', select: 'fullName' } })
        .populate('department', 'name')
        .sort({ appointmentDate: -1 })
        .limit(5),
      Prescription.find({ patient: patient._id })
        .populate({ path: 'doctor', populate: { path: 'user', select: 'fullName' } })
        .sort({ createdAt: -1 })
        .limit(5),
      Bill.find({ patient: patient._id })
        .populate({ path: 'doctor', populate: { path: 'user', select: 'fullName' } })
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.json({
      success: true,
      data: { patient, myAppointments, myPrescriptions, myBills },
    });
  } catch (error) {
    next(error);
  }
};
