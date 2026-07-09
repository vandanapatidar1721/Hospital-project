import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import { generateToken } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { buildUploadUrl } from '../middleware/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadRoot = path.resolve(__dirname, '../uploads');

const deleteUploadedProfileImage = async (profileImage) => {
  if (!profileImage?.startsWith('/uploads/')) return;

  const filename = path.basename(profileImage);
  try {
    await fs.unlink(path.join(uploadRoot, filename));
  } catch {
    // If the file is already missing, still remove it from the user profile.
  }
};

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

export const updateProfileImage = async (req, res, next) => {
  try {
    if (!req.file) throw new AppError('Profile image is required', 400);

    const user = await User.findById(req.user._id);
    if (!user) throw new AppError('User not found', 404);

    await deleteUploadedProfileImage(user.profileImage);
    user.profileImage = buildUploadUrl(req.file.filename);
    await user.save();

    res.json({ success: true, data: user, message: 'Profile image updated' });
  } catch (error) {
    next(error);
  }
};

export const deleteProfileImage = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new AppError('User not found', 404);
    if (!user.profileImage) throw new AppError('No profile image to delete', 400);

    await deleteUploadedProfileImage(user.profileImage);
    user.profileImage = '';
    await user.save();

    res.json({ success: true, data: user, message: 'Profile image deleted' });
  } catch (error) {
    next(error);
  }
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
