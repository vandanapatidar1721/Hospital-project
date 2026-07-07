import { Router } from 'express';
import { getPrescriptions, getPrescription, createPrescription } from '../controllers/prescriptionController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { prescriptionValidation } from '../utils/validators.js';

const router = Router();

router.use(protect);

router.get('/', authorize('admin', 'doctor', 'receptionist', 'patient'), getPrescriptions);
router.get('/:id', authorize('admin', 'doctor', 'receptionist', 'patient'), getPrescription);
router.post('/', authorize('doctor'), prescriptionValidation, validate, createPrescription);

export default router;
