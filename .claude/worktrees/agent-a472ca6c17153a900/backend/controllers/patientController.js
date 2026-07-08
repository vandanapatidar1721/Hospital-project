import User from '../models/User.js';
import Patient from '../models/Patient.js';
import { AppError } from '../middleware/errorHandler.js';

export const getPatients = async (req, res, next) => {
  try {
    const { search } = req.query;
    let filter = {};

    if (search) {
      filter = {
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const patients = await Patient.find(filter).populate('user', 'fullName email').sort({ createdAt: -1 });
    res.json({ success: true, data: patients });
  } catch (error) {
    next(error);
  }
};

export const getPatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('user', 'fullName email');
    if (!patient) throw new AppError('Patient not found', 404);
    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

export const createPatient = async (req, res, next) => {
  try {
    const { fullName, age, gender, phone, address, bloodGroup, email, password } = req.body;

    let userId = null;
    if (email && password) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) throw new AppError('Email already registered', 400);

      const user = await User.create({
        fullName,
        email,
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
    next(error);
  }
};

export const updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) throw new AppError('Patient not found', 404);

    const { fullName, age, gender, phone, address, bloodGroup } = req.body;
    Object.assign(patient, { fullName, age, gender, phone, address, bloodGroup });
    await patient.save();

    if (patient.user && fullName) {
      await User.findByIdAndUpdate(patient.user, { fullName, phone });
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
