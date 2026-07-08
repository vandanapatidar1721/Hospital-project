import { Router } from 'express';
import { getBills, getBill, createBill, updateBill } from '../controllers/billController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { billUpdateValidation, billValidation } from '../utils/validators.js';

const router = Router();

router.use(protect);

router.get('/', authorize('admin', 'receptionist', 'patient'), getBills);
router.get('/:id', authorize('admin', 'receptionist', 'patient'), getBill);
router.post('/', authorize('admin', 'receptionist'), billValidation, validate, createBill);
router.put('/:id', authorize('admin', 'receptionist'), billUpdateValidation, validate, updateBill);

export default router;
