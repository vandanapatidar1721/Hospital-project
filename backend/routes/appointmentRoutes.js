import { Router } from 'express';
import {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  deleteAppointment,
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { appointmentValidation } from '../utils/validators.js';

const router = Router();

router.use(protect);

router.get('/', authorize('admin', 'doctor', 'receptionist', 'patient'), getAppointments);
router.get('/:id', authorize('admin', 'doctor', 'receptionist', 'patient'), getAppointment);
router.post('/', authorize('admin', 'receptionist', 'patient'), appointmentValidation, validate, createAppointment);
router.put('/:id', authorize('admin', 'receptionist', 'doctor'), updateAppointment);
router.patch('/:id/cancel', authorize('admin', 'receptionist', 'patient'), cancelAppointment);
router.delete('/:id', authorize('admin', 'receptionist', 'patient'), deleteAppointment);

export default router;
