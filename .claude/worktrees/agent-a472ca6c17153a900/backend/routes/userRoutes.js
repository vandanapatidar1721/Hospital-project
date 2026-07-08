import { Router } from 'express';
import { body } from 'express-validator';
import { getUsers, createReceptionist, updateUser, deleteUser } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { userUpdateValidation } from '../utils/validators.js';

const router = Router();

router.use(protect, authorize('admin'));

router.get('/', getUsers);
router.post(
  '/receptionist',
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  createReceptionist
);
router.put('/:id', userUpdateValidation, validate, updateUser);
router.delete('/:id', deleteUser);

export default router;
