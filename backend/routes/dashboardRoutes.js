import { Router } from 'express';
import {
  getAdminDashboard,
  getDoctorDashboard,
  getReceptionistDashboard,
  getPatientDashboard,
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/admin', authorize('admin'), getAdminDashboard);
router.get('/doctor', authorize('doctor'), getDoctorDashboard);
router.get('/receptionist', authorize('receptionist'), getReceptionistDashboard);
router.get('/patient', authorize('patient'), getPatientDashboard);

export default router;
