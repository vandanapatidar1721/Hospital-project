import { body } from 'express-validator';

export const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const phoneValidation = body('phone')
  .trim()
  .matches(/^\d{10}$/)
  .withMessage('Phone number must be 10 digits');

const optionalPhoneValidation = body('phone')
  .optional({ values: 'falsy' })
  .trim()
  .matches(/^\d{10}$/)
  .withMessage('Phone number must be 10 digits');

const appointmentDateValidation = body('appointmentDate')
  .notEmpty()
  .withMessage('Appointment date is required')
  .custom((value) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(value);
    appointmentDate.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
      throw new Error('Appointment date cannot be in the past');
    }
    return true;
  });

const validateOptionalPatientLogin = [
  body('email')
    .optional({ values: 'falsy' })
    .isEmail()
    .withMessage('Valid email is required'),
  body('password').custom((value, { req }) => {
    if (req.body.email && !value) {
      throw new Error('Password is required when email is provided');
    }
    if (value && value.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    if (value && !req.body.email) {
      throw new Error('Email is required when password is provided');
    }
    return true;
  }),
];

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
  phoneValidation,
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
  body('consultationFee').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('Consultation fee must be positive'),
  phoneValidation,
];

export const doctorUpdateValidation = [
  body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('Valid email is required'),
  body('department').optional({ values: 'falsy' }).isMongoId().withMessage('Valid department is required'),
  body('qualification').optional({ values: 'falsy' }).trim().notEmpty().withMessage('Qualification cannot be empty'),
  body('experience').optional({ values: 'falsy' }).isInt({ min: 0 }).withMessage('Experience must be a positive number'),
  body('consultationFee').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('Consultation fee must be positive'),
  optionalPhoneValidation,
  body('isActive').optional().isBoolean().withMessage('Status must be active or inactive'),
];

export const patientValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('age').isInt({ min: 0, max: 150 }).withMessage('Valid age is required'),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Valid gender is required'),
  phoneValidation,
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('bloodGroup')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Valid blood group is required'),
  ...validateOptionalPatientLogin,
];

export const patientUpdateValidation = [
  body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('age').optional({ values: 'falsy' }).isInt({ min: 0, max: 150 }).withMessage('Valid age is required'),
  body('gender').optional({ values: 'falsy' }).isIn(['Male', 'Female', 'Other']).withMessage('Valid gender is required'),
  optionalPhoneValidation,
  body('address').optional({ values: 'falsy' }).trim().notEmpty().withMessage('Address cannot be empty'),
  body('bloodGroup')
    .optional({ values: 'falsy' })
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Valid blood group is required'),
];

export const appointmentValidation = [
  body('patient').custom((value, { req }) => {
    if (req.user?.role !== 'patient' && !value) {
      throw new Error('Patient is required');
    }
    return true;
  }),
  body('doctor').notEmpty().withMessage('Doctor is required'),
  body('department').notEmpty().withMessage('Department is required'),
  appointmentDateValidation,
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
  body('consultationFee').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('Consultation fee must be positive'),
  body('medicineCharges').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('Medicine charges must be positive'),
  body('status').optional({ values: 'falsy' }).isIn(['Paid', 'Unpaid']).withMessage('Valid bill status is required'),
];

export const billUpdateValidation = [
  body('consultationFee').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('Consultation fee must be positive'),
  body('medicineCharges').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('Medicine charges must be positive'),
  body('status').optional({ values: 'falsy' }).isIn(['Paid', 'Unpaid']).withMessage('Valid bill status is required'),
];

export const createUserValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .isIn(['admin', 'doctor', 'receptionist', 'patient'])
    .withMessage('Valid role is required'),
  optionalPhoneValidation,
  body('department').optional({ values: 'falsy' }).isMongoId().withMessage('Valid department is required'),
  body('experience').optional({ values: 'falsy' }).isInt({ min: 0 }).withMessage('Experience must be a positive number'),
  body('consultationFee').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('Consultation fee must be positive'),
  body('age').optional({ values: 'falsy' }).isInt({ min: 0, max: 150 }).withMessage('Valid age is required'),
  body('gender').optional({ values: 'falsy' }).isIn(['Male', 'Female', 'Other']).withMessage('Valid gender is required'),
  body('bloodGroup')
    .optional({ values: 'falsy' })
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Valid blood group is required'),
];

export const receptionistValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  optionalPhoneValidation,
];

export const userUpdateValidation = [
  body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('Valid email is required'),
  optionalPhoneValidation,
  body('role')
    .optional()
    .isIn(['admin', 'doctor', 'receptionist', 'patient'])
    .withMessage('Valid role is required'),
  body('isActive').optional().isBoolean().withMessage('Status must be active or inactive'),
  body('department').optional({ values: 'falsy' }).isMongoId().withMessage('Valid department is required'),
  body('qualification').optional({ values: 'falsy' }).trim().notEmpty().withMessage('Qualification cannot be empty'),
  body('experience').optional({ values: 'falsy' }).isInt({ min: 0 }).withMessage('Experience must be a positive number'),
  body('consultationFee').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('Consultation fee must be positive'),
  body('age').optional({ values: 'falsy' }).isInt({ min: 0, max: 150 }).withMessage('Valid age is required'),
  body('gender').optional({ values: 'falsy' }).isIn(['Male', 'Female', 'Other']).withMessage('Valid gender is required'),
  body('address').optional({ values: 'falsy' }).trim().notEmpty().withMessage('Address cannot be empty'),
  body('bloodGroup')
    .optional({ values: 'falsy' })
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Valid blood group is required'),
];
