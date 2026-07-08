import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true },
    fullName: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0, max: 150 },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Patient', patientSchema);
