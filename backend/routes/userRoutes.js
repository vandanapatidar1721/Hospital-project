import { Router } from 'express';
import { getUsers, createUser, createReceptionist, syncRoleDocuments, updateUser, deleteUser } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createUserValidation, receptionistValidation, userUpdateValidation } from '../utils/validators.js';

const router = Router();

router.use(protect, authorize('admin'));

router.get('/', getUsers);
router.post('/', createUserValidation, validate, createUser);
router.post('/receptionist', receptionistValidation, validate, createReceptionist);
router.post('/sync-role-documents', syncRoleDocuments);
router.put('/:id', userUpdateValidation, validate, updateUser);
router.delete('/:id', deleteUser);

export default router;
