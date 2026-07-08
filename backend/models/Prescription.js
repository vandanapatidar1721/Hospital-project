import mongoose from 'mongoose';

const prescriptionItemSchema = new mongoose.Schema(
  {
    medicineName: { type: String, required: true, trim: true },
    dosage: { type: String, required: true, trim: true },
    duration: { type: String, required: true, trim: true },
    instructions: { type: String, trim: true, default: '' },
    price: { type: Number, default: 0, min: 0 },
  },
  { _id: true }
);

const prescriptionSchema = new mongoose.Schema(
  {
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    items: [prescriptionItemSchema],
    additionalNotes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Prescription', prescriptionSchema);
