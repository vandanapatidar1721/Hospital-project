import { Router } from 'express';
import { login, signup, getMe, changePassword, logout } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loginValidation, signupValidation, changePasswordValidation } from '../utils/validators.js';

const router = Router();

router.post('/login', loginValidation, validate, login);
router.post('/signup', signupValidation, validate, signup);
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePasswordValidation, validate, changePassword);
router.post('/logout', protect, logout);

export default router;
