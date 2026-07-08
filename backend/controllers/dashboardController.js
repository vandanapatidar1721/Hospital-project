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

    const [
      totalDoctors,
      totalPatients,
      totalDepartments,
      totalReceptionists,
      totalAppointments,
      todayAppointments,
      recentPrescriptions,
      appointmentsByStatus,
      billsByStatus,
      departmentLoad,
    ] = await Promise.all([
      User.countDocuments({ role: 'doctor', isActive: true }),
      Patient.countDocuments(),
      Department.countDocuments(),
      User.countDocuments({ role: 'receptionist', isActive: true }),
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
      Appointment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Bill.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } }]),
      Appointment.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'department' } },
        { $unwind: '$department' },
        { $project: { name: '$department.name', count: 1, _id: 0 } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        stats: { totalDoctors, totalPatients, totalDepartments, totalReceptionists, totalAppointments },
        todayAppointments,
        recentPrescriptions,
        analytics: {
          appointmentsByStatus: appointmentsByStatus.map((item) => ({ name: item._id, value: item.count })),
          billsByStatus: billsByStatus.map((item) => ({ name: item._id, count: item.count, total: item.total })),
          departmentLoad,
        },
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
          analytics: { appointmentsByStatus: [] },
        },
      });
    }

    const todayStart = startOfToday();
    const todayEnd = endOfToday();

    const [todayAppointments, totalAppointments, appointmentsByStatus] = await Promise.all([
      Appointment.find({
        doctor: doctor._id,
        appointmentDate: { $gte: todayStart, $lte: todayEnd },
        status: { $ne: 'Cancelled' },
      })
        .populate('patient', 'fullName phone age gender')
        .populate('department', 'name')
        .sort({ appointmentTime: 1 }),
      Appointment.countDocuments({ doctor: doctor._id }),
      Appointment.aggregate([
        { $match: { doctor: doctor._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        doctor,
        stats: { totalAppointments, todayCount: todayAppointments.length },
        todayAppointments,
        analytics: { appointmentsByStatus: appointmentsByStatus.map((item) => ({ name: item._id, value: item.count })) },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getReceptionistDashboard = async (req, res, next) => {
  try {
    const todayStart = startOfToday();
    const todayEnd = endOfToday();

    const [todayAppointments, registeredPatients, billsByStatus] = await Promise.all([
      Appointment.find({ appointmentDate: { $gte: todayStart, $lte: todayEnd } })
        .populate('patient', 'fullName phone')
        .populate({ path: 'doctor', populate: { path: 'user', select: 'fullName' } })
        .populate('department', 'name')
        .sort({ appointmentTime: 1 }),
      Patient.find().sort({ createdAt: -1 }).limit(10),
      Bill.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } }]),
    ]);

    res.json({
      success: true,
      data: {
        stats: { todayAppointments: todayAppointments.length, registeredPatients: registeredPatients.length },
        todayAppointments,
        registeredPatients,
        analytics: { billsByStatus: billsByStatus.map((item) => ({ name: item._id, count: item.count, total: item.total })) },
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
          patient: { fullName: req.user.fullName, bloodGroup: '-', age: '-' },
          myAppointments: [],
          myPrescriptions: [],
          myBills: [],
          analytics: { billsByStatus: [] },
        },
      });
    }

    const [myAppointments, myPrescriptions, myBills, billsByStatus] = await Promise.all([
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
      Bill.aggregate([
        { $match: { patient: patient._id } },
        { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        patient,
        myAppointments,
        myPrescriptions,
        myBills,
        analytics: { billsByStatus: billsByStatus.map((item) => ({ name: item._id, count: item.count, total: item.total })) },
      },
    });
  } catch (error) {
    next(error);
  }
};
