import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Receptionist from '../models/Receptionist.js';
import Department from '../models/Department.js';
import { AppError } from '../middleware/errorHandler.js';
import { escapeRegex } from '../utils/validators.js';

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

const syncUserRoleDocument = async (user, data = {}) => {
  const userId = user._id;
  const role = data.role || user.role;
  const effectiveName = data.fullName || user.fullName;
  const effectivePhone = data.phone || user.phone || '0000000000';

  if (role === 'doctor') {
    const existingDoctor = await Doctor.findOne({ user: userId });
    const defaultDepartment = data.department ? null : await getDefaultDepartment();

    await Doctor.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          user: userId,
          department: data.department || existingDoctor?.department || defaultDepartment._id,
          qualification: data.qualification || existingDoctor?.qualification || 'General Physician',
          experience: data.experience !== undefined && data.experience !== '' ? Number(data.experience) : existingDoctor?.experience ?? 0,
          phone: effectivePhone,
          consultationFee:
            data.consultationFee !== undefined && data.consultationFee !== ''
              ? Number(data.consultationFee)
              : existingDoctor?.consultationFee || 500,
        },
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    await Promise.all([
      Patient.deleteMany({ user: userId }),
      Receptionist.deleteMany({ user: userId }),
    ]);
    return;
  }

  if (role === 'patient') {
    const existingPatient = await Patient.findOne({ user: userId });

    await Patient.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          user: userId,
          fullName: effectiveName,
          age: data.age !== undefined && data.age !== '' ? Number(data.age) : existingPatient?.age ?? 0,
          gender: data.gender || existingPatient?.gender || 'Other',
          phone: effectivePhone,
          address: data.address || existingPatient?.address || '-',
          bloodGroup: data.bloodGroup || existingPatient?.bloodGroup || 'O+',
        },
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    await Promise.all([
      Doctor.deleteMany({ user: userId }),
      Receptionist.deleteMany({ user: userId }),
    ]);
    return;
  }

  if (role === 'receptionist') {
    await Receptionist.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          user: userId,
          fullName: effectiveName,
          phone: effectivePhone,
          shift: data.shift || 'General',
        },
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    await Promise.all([
      Doctor.deleteMany({ user: userId }),
      Patient.deleteMany({ user: userId }),
    ]);
    return;
  }

  await Promise.all([
    Doctor.deleteMany({ user: userId }),
    Patient.deleteMany({ user: userId }),
    Receptionist.deleteMany({ user: userId }),
  ]);
};

const attachProfiles = async (users) => {
  const userList = Array.isArray(users) ? users : [users];
  const ids = userList.map((user) => user._id);
  const [doctors, patients, receptionists] = await Promise.all([
    Doctor.find({ user: { $in: ids } }).populate('department', 'name').lean(),
    Patient.find({ user: { $in: ids } }).lean(),
    Receptionist.find({ user: { $in: ids } }).lean(),
  ]);

  const doctorByUser = new Map(doctors.map((doctor) => [String(doctor.user), doctor]));
  const patientByUser = new Map(patients.map((patient) => [String(patient.user), patient]));
  const receptionistByUser = new Map(receptionists.map((receptionist) => [String(receptionist.user), receptionist]));

  const enriched = userList.map((user) => {
    const plainUser = user.toObject ? user.toObject() : user;
    const doctor = doctorByUser.get(String(plainUser._id));
    const patient = patientByUser.get(String(plainUser._id));
    const receptionist = receptionistByUser.get(String(plainUser._id));

    return {
      ...plainUser,
      ...(doctor && {
        doctorProfile: doctor,
        department: doctor.department,
        qualification: doctor.qualification,
        experience: doctor.experience,
        consultationFee: doctor.consultationFee,
      }),
      ...(patient && {
        patientProfile: patient,
        age: patient.age,
        gender: patient.gender,
        address: patient.address,
        bloodGroup: patient.bloodGroup,
      }),
      ...(receptionist && {
        receptionistProfile: receptionist,
        shift: receptionist.shift,
      }),
    };
  });

  return Array.isArray(users) ? enriched : enriched[0];
};

export const getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    let filter = {};
    if (role) filter.role = role;

    if (search) {
      const safeSearch = escapeRegex(search);
      filter.$or = [
        { fullName: { $regex: safeSearch, $options: 'i' } },
        { email: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    await Promise.all(users.map((user) => syncUserRoleDocument(user)));
    const plainUsers = users.map((user) => user.toObject());
    const enrichedUsers = await attachProfiles(plainUsers);
    res.json({ success: true, data: enrichedUsers });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { fullName, email, password, phone, role } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new AppError('Email already registered', 400);

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      role,
      phone,
    });

    await syncUserRoleDocument(user, req.body);
    const savedUser = await User.findById(user._id).select('-password').lean();
    const enrichedUser = await attachProfiles(savedUser);

    res.status(201).json({ success: true, data: enrichedUser, message: `${role} user created successfully` });
  } catch (error) {
    next(error);
  }
};

export const createReceptionist = async (req, res, next) => {
  try {
    const { fullName, email, password, phone } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new AppError('Email already registered', 400);

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      role: 'receptionist',
      phone,
    });

    await syncUserRoleDocument(user, { fullName, phone, role: 'receptionist' });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const syncRoleDocuments = async (req, res, next) => {
  try {
    const users = await User.find();
    await Promise.all(users.map((user) => syncUserRoleDocument(user)));
    res.json({ success: true, message: 'Role documents synced successfully', count: users.length });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new AppError('User not found', 404);

    const {
      fullName,
      email,
      phone,
      role,
      isActive,
    } = req.body;

    if (email && email.toLowerCase() !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
      if (existing) throw new AppError('Email already registered', 400);
      user.email = email.toLowerCase();
    }

    if (fullName !== undefined) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();
    await syncUserRoleDocument(user, req.body);

    const savedUser = await User.findById(user._id).select('-password').lean();
    const enrichedUser = await attachProfiles(savedUser);
    res.json({ success: true, data: enrichedUser, message: `${savedUser.role} role synced successfully` });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new AppError('User not found', 404);
    if (user.role === 'admin') throw new AppError('Cannot delete admin user', 403);

    await Promise.all([
      Doctor.deleteMany({ user: user._id }),
      Patient.deleteMany({ user: user._id }),
      Receptionist.deleteMany({ user: user._id }),
      User.findByIdAndDelete(req.params.id),
    ]);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
