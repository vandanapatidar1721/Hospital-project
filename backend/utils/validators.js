import { body } from 'express-validator';

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

export const signupValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('age').isInt({ min: 0, max: 150 }).withMessage('Valid age is required'),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Valid gender is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('bloodGroup')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Valid blood group is required'),
];

export const departmentValidation = [
  body('name').trim().notEmpty().withMessage('Department name is required'),
];

export const doctorValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('department').notEmpty().withMessage('Department is required'),
  body('qualification').trim().notEmpty().withMessage('Qualification is required'),
  body('experience').isInt({ min: 0 }).withMessage('Experience must be a positive number'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
];

export const patientValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('age').isInt({ min: 0, max: 150 }).withMessage('Valid age is required'),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Valid gender is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('bloodGroup')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Valid blood group is required'),
];

export const appointmentValidation = [
  body('patient').notEmpty().withMessage('Patient is required'),
  body('doctor').notEmpty().withMessage('Doctor is required'),
  body('department').notEmpty().withMessage('Department is required'),
  body('appointmentDate').notEmpty().withMessage('Appointment date is required'),
  body('appointmentTime').trim().notEmpty().withMessage('Appointment time is required'),
];

export const prescriptionValidation = [
  body('appointment').notEmpty().withMessage('Appointment is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one medicine is required'),
  body('items.*.medicineName').trim().notEmpty().withMessage('Medicine name is required'),
  body('items.*.dosage').trim().notEmpty().withMessage('Dosage is required'),
  body('items.*.duration').trim().notEmpty().withMessage('Duration is required'),
];

export const billValidation = [
  body('appointment').notEmpty().withMessage('Appointment is required'),
  body('consultationFee').isFloat({ min: 0 }).withMessage('Consultation fee must be positive'),
  body('medicineCharges').isFloat({ min: 0 }).withMessage('Medicine charges must be positive'),
];

export const userUpdateValidation = [
  body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('role')
    .optional()
    .isIn(['admin', 'doctor', 'receptionist', 'patient'])
    .withMessage('Valid role is required'),
  body('isActive').optional().isBoolean().withMessage('Status must be active or inactive'),
];
