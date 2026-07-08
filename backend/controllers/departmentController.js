import Department from '../models/Department.js';
import { AppError } from '../middleware/errorHandler.js';
import { escapeRegex } from '../utils/validators.js';

const doctorDepartmentDefaults = [
  { name: 'General Medicine', description: 'Primary healthcare and general consultations' },
  { name: 'Cardiology', description: 'Heart and cardiovascular care' },
  { name: 'Neurology', description: 'Brain, spine, and nervous system care' },
  { name: 'Orthopedics', description: 'Bones, joints, and musculoskeletal care' },
  { name: 'Pediatrics', description: 'Medical care for infants, children, and adolescents' },
  { name: 'ENT', description: 'Ear, nose, and throat specialist care' },
  { name: 'Dermatology', description: 'Skin, hair, and nail care' },
  { name: 'Gynecology', description: 'Women’s health and reproductive care' },
  { name: 'Obstetrics', description: 'Pregnancy and childbirth care' },
  { name: 'Ophthalmology', description: 'Eye and vision care' },
  { name: 'Dentistry', description: 'Dental and oral health care' },
  { name: 'Psychiatry', description: 'Mental health diagnosis and treatment' },
  { name: 'Radiology', description: 'Imaging and diagnostic radiology' },
  { name: 'Pathology', description: 'Laboratory medicine and diagnostics' },
  { name: 'Oncology', description: 'Cancer diagnosis and treatment' },
  { name: 'Urology', description: 'Urinary tract and male reproductive care' },
  { name: 'Nephrology', description: 'Kidney care and treatment' },
  { name: 'Gastroenterology', description: 'Digestive system care' },
  { name: 'Pulmonology', description: 'Lung and respiratory care' },
  { name: 'Endocrinology', description: 'Hormone and metabolic disorder care' },
  { name: 'Emergency Medicine', description: 'Emergency and trauma care' },
  { name: 'Anesthesiology', description: 'Anesthesia and pain management' },
  { name: 'Physiotherapy', description: 'Rehabilitation and physical therapy' },
];

const ensureDefaultDepartments = async () => {
  await Promise.all(
    doctorDepartmentDefaults.map((department) =>
      Department.updateOne(
        { name: department.name },
        { $setOnInsert: department },
        { upsert: true }
      )
    )
  );
};

export const getDepartments = async (req, res, next) => {
  try {
    await ensureDefaultDepartments();
    const { search } = req.query;
    const filter = search ? { name: { $regex: escapeRegex(search), $options: 'i' } } : {};
    const departments = await Department.find(filter).sort({ name: 1 });
    res.json({ success: true, data: departments });
  } catch (error) {
    next(error);
  }
};

export const getDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) throw new AppError('Department not found', 404);
    res.json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const department = await Department.create(req.body);
    res.status(201).json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!department) throw new AppError('Department not found', 404);
    res.json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) throw new AppError('Department not found', 404);
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    next(error);
  }
};
