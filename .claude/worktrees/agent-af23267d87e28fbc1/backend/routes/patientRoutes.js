import { Router } from 'express';
import {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  getMyPatientProfile,
} from '../controllers/patientController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { patientValidation } from '../utils/validators.js';

const router = Router();

router.use(protect);

router.get('/me', authorize('patient'), getMyPatientProfile);
router.get('/', authorize('admin', 'doctor', 'receptionist'), getPatients);
router.get('/:id', authorize('admin', 'doctor', 'receptionist', 'patient'), getPatient);
router.post('/', authorize('admin', 'receptionist'), patientValidation, validate, createPatient);
router.put('/:id', authorize('admin', 'receptionist'), updatePatient);
router.delete('/:id', authorize('admin'), deletePatient);

export default router;
