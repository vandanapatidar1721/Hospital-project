import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    qualification: { type: String, required: true, trim: true },
    experience: { type: Number, required: true, min: 0 },
    phone: { type: String, required: true, trim: true },
    consultationFee: { type: Number, default: 500, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Doctor', doctorSchema);
