import mongoose from 'mongoose';

const billSchema = new mongoose.Schema(
  {
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    consultationFee: { type: Number, required: true, min: 0 },
    medicineCharges: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['Paid', 'Unpaid'], default: 'Unpaid' },
  },
  { timestamps: true }
);

export default mongoose.model('Bill', billSchema);
