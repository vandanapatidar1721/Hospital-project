import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Department from '../models/Department.js';
import { AppError } from '../middleware/errorHandler.js';

const doctorPopulate = [
  { path: 'user', select: 'fullName email phone role isActive' },
  { path: 'department', select: 'name' },
];

const getDefaultDepartment = async () => {
  let department = await Department.findOne({ name: 'General Medicine' });
  if (!department) {
    department = await Department.create({
      name: 'General Medicine',
      description: 'Default department for general consultations',
    });
  }
  return department;
};

const ensureDoctorProfiles = async () => {
  const users = await User.find({ role: 'doctor' });
  const defaultDepartment = await getDefaultDepartment();

  await Promise.all(users.map(async (user) => {
    const exists = await Doctor.exists({ user: user._id });
    if (!exists && user.phone) {
      await Doctor.create({
        user: user._id,
        department: defaultDepartment._id,
        qualification: 'General Physician',
        experience: 0,
        phone: user.phone,
        consultationFee: 500,
      });
    }
  }));
};

export const getDoctors = async (req, res, next) => {
  try {
    const { search, department } = req.query;
    let filter = {};

    if (department) filter.department = department;

    await ensureDoctorProfiles();
    let doctors = await Doctor.find(filter).populate(doctorPopulate).sort({ createdAt: -1 });
    doctors = doctors.filter((doctor) => doctor.user?.role === 'doctor');

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
  let user = null;

  try {
    const { fullName, email, password, department, qualification, experience, phone, consultationFee } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new AppError('Email already registered', 400);

    user = await User.create({
      fullName,
      email: email.toLowerCase(),
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
    if (user?._id) await User.findByIdAndDelete(user._id);
    next(error);
  }
};

export const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) throw new AppError('Doctor not found', 404);

    const { fullName, email, department, qualification, experience, phone, consultationFee, isActive } = req.body;
    const userUpdates = {};

    if (fullName !== undefined) userUpdates.fullName = fullName;
    if (phone !== undefined) userUpdates.phone = phone;
    if (isActive !== undefined) userUpdates.isActive = isActive;
    if (email) {
      const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: doctor.user } });
      if (existing) throw new AppError('Email already registered', 400);
      userUpdates.email = email.toLowerCase();
    }

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(doctor.user, userUpdates, { runValidators: true });
    }

    Object.assign(doctor, {
      ...(department && { department }),
      ...(qualification !== undefined && { qualification }),
      ...(experience !== undefined && { experience }),
      ...(phone !== undefined && { phone }),
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
