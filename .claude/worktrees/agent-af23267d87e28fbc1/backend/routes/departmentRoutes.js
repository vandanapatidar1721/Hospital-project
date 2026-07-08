import { Router } from 'express';
import {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { departmentValidation } from '../utils/validators.js';

const router = Router();

router.use(protect);

router.get('/', authorize('admin', 'doctor', 'receptionist', 'patient'), getDepartments);
router.get('/:id', authorize('admin', 'doctor', 'receptionist', 'patient'), getDepartment);
router.post('/', authorize('admin'), departmentValidation, validate, createDepartment);
router.put('/:id', authorize('admin'), departmentValidation, validate, updateDepartment);
router.delete('/:id', authorize('admin'), deleteDepartment);

export default router;
