import User from '../models/User.js';
import Patient from '../models/Patient.js';
import { generateToken } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403);
    }

    const token = generateToken(user._id);
    res.json({ success: true, token, user });
  } catch (error) {
    next(error);
  }
};

export const signup = async (req, res, next) => {
  let createdUser = null;

  try {
    const { fullName, email, password, age, gender, phone, address, bloodGroup } = req.body;
    const normalizedEmail = email.toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) throw new AppError('Email already registered', 400);

    createdUser = await User.create({
      fullName,
      email: normalizedEmail,
      password,
      role: 'patient',
      phone,
    });

    await Patient.create({
      user: createdUser._id,
      fullName,
      age,
      gender,
      phone,
      address,
      bloodGroup,
    });

    const token = generateToken(createdUser._id);
    res.status(201).json({ success: true, token, user: createdUser });
  } catch (error) {
    if (createdUser) {
      try {
        await User.findByIdAndDelete(createdUser._id);
      } catch {
        // Preserve the original signup error for the client.
      }
    }
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!(await user.comparePassword(currentPassword))) {
      throw new AppError('Current password is incorrect', 400);
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};
