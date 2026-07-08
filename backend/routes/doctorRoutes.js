import { Router } from 'express';
import {
  getDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getMyDoctorProfile,
} from '../controllers/doctorController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { doctorUpdateValidation, doctorValidation } from '../utils/validators.js';

const router = Router();

router.use(protect);

router.get('/me', authorize('doctor'), getMyDoctorProfile);
router.get('/', authorize('admin', 'doctor', 'receptionist', 'patient'), getDoctors);
router.get('/:id', authorize('admin', 'doctor', 'receptionist', 'patient'), getDoctor);
router.post('/', authorize('admin'), doctorValidation, validate, createDoctor);
router.put('/:id', authorize('admin'), doctorUpdateValidation, validate, updateDoctor);
router.delete('/:id', authorize('admin'), deleteDoctor);

export default router;
