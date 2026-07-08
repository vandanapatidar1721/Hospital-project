import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';

export const getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    let filter = {};
    if (role) filter.role = role;

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
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
      email,
      password,
      role: 'receptionist',
      phone,
    });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { fullName, email, phone, role, isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) throw new AppError('User not found', 404);

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

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new AppError('User not found', 404);
    if (user.role === 'admin') throw new AppError('Cannot delete admin user', 403);

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
