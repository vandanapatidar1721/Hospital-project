import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Bill from '../models/Bill.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import { AppError } from '../middleware/errorHandler.js';
import { assertDoctorOrPatientAccess } from '../services/ownership.js';

const billPopulate = [
  { path: 'patient', select: 'fullName phone address' },
  { path: 'doctor', populate: { path: 'user', select: 'fullName' } },
  { path: 'appointment', select: 'appointmentDate appointmentTime status' },
];

export const getBills = async (req, res, next) => {
  try {
    const { search, patient, status } = req.query;
    let filter = {};

    if (patient) filter.patient = patient;
    if (status) filter.status = status;

    if (req.user.role === 'patient') {
      const pat = await Patient.findOne({ user: req.user._id });
      if (pat) filter.patient = pat._id;
    }

    let bills = await Bill.find(filter).populate(billPopulate).sort({ createdAt: -1 });

    if (search) {
      const term = search.toLowerCase();
      bills = bills.filter(
        (b) =>
          b.patient?.fullName?.toLowerCase().includes(term) ||
          b.doctor?.user?.fullName?.toLowerCase().includes(term)
      );
    }

    res.json({ success: true, data: bills });
  } catch (error) {
    next(error);
  }
};

export const getBill = async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id).populate(billPopulate);
    if (!bill) throw new AppError('Bill not found', 404);
    await assertDoctorOrPatientAccess(req.user, bill);
    res.json({ success: true, data: bill });
  } catch (error) {
    next(error);
  }
};

export const createBill = async (req, res, next) => {
  try {
    const { appointment: appointmentId, consultationFee, medicineCharges, status } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) throw new AppError('Appointment not found', 404);

    const existing = await Bill.findOne({ appointment: appointmentId });
    if (existing) throw new AppError('Bill already exists for this appointment', 400);

    let medCharges = medicineCharges;
    if (medCharges === undefined) {
      const prescription = await Prescription.findOne({ appointment: appointmentId });
      medCharges = prescription
        ? prescription.items.reduce((sum, item) => sum + (item.price || 0), 0)
        : 0;
    }

    let consultFee = consultationFee;
    if (consultFee === undefined) {
      const doctor = await Doctor.findById(appointment.doctor);
      consultFee = doctor?.consultationFee || 500;
    }

    const totalAmount = Number(consultFee) + Number(medCharges);

    const bill = await Bill.create({
      appointment: appointmentId,
      patient: appointment.patient,
      doctor: appointment.doctor,
      consultationFee: consultFee,
      medicineCharges: medCharges,
      totalAmount,
      status: status || 'Unpaid',
    });

    const populated = await Bill.findById(bill._id).populate(billPopulate);
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

export const updateBill = async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) throw new AppError('Bill not found', 404);

    const { consultationFee, medicineCharges, status } = req.body;
    if (consultationFee !== undefined) bill.consultationFee = consultationFee;
    if (medicineCharges !== undefined) bill.medicineCharges = medicineCharges;
    if (status) bill.status = status;

    bill.totalAmount = bill.consultationFee + bill.medicineCharges;
    await bill.save();

    const populated = await Bill.findById(bill._id).populate(billPopulate);
    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};
