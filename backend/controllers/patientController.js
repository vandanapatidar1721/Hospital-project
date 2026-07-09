import User from '../models/User.js';
import Patient from '../models/Patient.js';
import { AppError } from '../middleware/errorHandler.js';
import { escapeRegex } from '../utils/validators.js';
import { assertPatientAccess } from '../services/ownership.js';
import { cleanupStaleRoleData } from '../services/roleSync.js';

const ensurePatientProfiles = async () => {
  const users = await User.find({ role: 'patient' });

  await Promise.all(users.map(async (user) => {
    const exists = await Patient.exists({ user: user._id });
    if (!exists && user.phone) {
      await Patient.create({
        user: user._id,
        fullName: user.fullName,
        age: 0,
        gender: 'Other',
        phone: user.phone,
        address: '-',
        bloodGroup: 'O+',
      });
    }
  }));
};

export const getPatients = async (req, res, next) => {
  try {
    const { search } = req.query;
    let filter = {};

    if (search) {
      const safeSearch = escapeRegex(search);
      filter = {
        $or: [
          { fullName: { $regex: safeSearch, $options: 'i' } },
          { phone: { $regex: safeSearch, $options: 'i' } },
        ],
      };
    }

    await cleanupStaleRoleData();
    let patients = await Patient.find(filter).populate('user', 'fullName email role').sort({ createdAt: -1 });
    patients = patients.filter((patient) => !patient.user || patient.user.role === 'patient');
    res.json({ success: true, data: patients });
  } catch (error) {
    next(error);
  }
};

export const getPatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('user', 'fullName email');
    if (!patient) throw new AppError('Patient not found', 404);
    await assertPatientAccess(req.user, patient._id);
    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

export const createPatient = async (req, res, next) => {
  let user = null;

  try {
    const { fullName, age, gender, phone, address, bloodGroup, email, password } = req.body;

    let userId = null;
    if (email && password) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) throw new AppError('Email already registered', 400);

      user = await User.create({
        fullName,
        email: email.toLowerCase(),
        password,
        role: 'patient',
        phone,
      });
      userId = user._id;
    }

    const patient = await Patient.create({
      user: userId,
      fullName,
      age,
      gender,
      phone,
      address,
      bloodGroup,
    });

    const populated = await Patient.findById(patient._id).populate('user', 'fullName email');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    if (user?._id) await User.findByIdAndDelete(user._id);
    next(error);
  }
};

export const updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) throw new AppError('Patient not found', 404);

    const { fullName, age, gender, phone, address, bloodGroup } = req.body;
    Object.assign(patient, {
      ...(fullName !== undefined && { fullName }),
      ...(age !== undefined && { age }),
      ...(gender !== undefined && { gender }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address }),
      ...(bloodGroup !== undefined && { bloodGroup }),
    });
    await patient.save();

    if (patient.user && (fullName !== undefined || phone !== undefined)) {
      await User.findByIdAndUpdate(
        patient.user,
        {
          ...(fullName !== undefined && { fullName }),
          ...(phone !== undefined && { phone }),
        },
        { runValidators: true }
      );
    }

    const populated = await Patient.findById(patient._id).populate('user', 'fullName email');
    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

export const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) throw new AppError('Patient not found', 404);

    if (patient.user) await User.findByIdAndDelete(patient.user);
    await Patient.findByIdAndDelete(patient._id);

    res.json({ success: true, message: 'Patient deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getMyPatientProfile = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) throw new AppError('Patient profile not found', 404);
    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};
