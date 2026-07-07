import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import { AppError } from '../middleware/errorHandler.js';

const doctorPopulate = [
  { path: 'user', select: 'fullName email phone isActive' },
  { path: 'department', select: 'name' },
];

export const getDoctors = async (req, res, next) => {
  try {
    const { search, department } = req.query;
    let filter = {};

    if (department) filter.department = department;

    let doctors = await Doctor.find(filter).populate(doctorPopulate).sort({ createdAt: -1 });

    if (search) {
      const term = search.toLowerCase();
      doctors = doctors.filter(
        (d) =>
          d.user?.fullName?.toLowerCase().includes(term) ||
          d.qualification?.toLowerCase().includes(term) ||
          d.department?.name?.toLowerCase().includes(term)
      );
    }

    res.json({ success: true, data: doctors });
  } catch (error) {
    next(error);
  }
};

export const getDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate(doctorPopulate);
    if (!doctor) throw new AppError('Doctor not found', 404);
    res.json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

export const createDoctor = async (req, res, next) => {
  try {
    const { fullName, email, password, department, qualification, experience, phone, consultationFee } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new AppError('Email already registered', 400);

    const user = await User.create({
      fullName,
      email,
      password,
      role: 'doctor',
      phone,
    });

    const doctor = await Doctor.create({
      user: user._id,
      department,
      qualification,
      experience,
      phone,
      consultationFee: consultationFee || 500,
    });

    const populated = await Doctor.findById(doctor._id).populate(doctorPopulate);
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

export const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) throw new AppError('Doctor not found', 404);

    const { fullName, email, department, qualification, experience, phone, consultationFee, isActive } = req.body;

    if (fullName || email || isActive !== undefined) {
      await User.findByIdAndUpdate(doctor.user, {
        ...(fullName && { fullName }),
        ...(email && { email }),
        ...(isActive !== undefined && { isActive }),
        ...(phone && { phone }),
      });
    }

    Object.assign(doctor, {
      ...(department && { department }),
      ...(qualification && { qualification }),
      ...(experience !== undefined && { experience }),
      ...(phone && { phone }),
      ...(consultationFee !== undefined && { consultationFee }),
    });
    await doctor.save();

    const populated = await Doctor.findById(doctor._id).populate(doctorPopulate);
    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

export const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) throw new AppError('Doctor not found', 404);

    await User.findByIdAndDelete(doctor.user);
    await Doctor.findByIdAndDelete(doctor._id);

    res.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getMyDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id }).populate(doctorPopulate);
    if (!doctor) throw new AppError('Doctor profile not found', 404);
    res.json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};
