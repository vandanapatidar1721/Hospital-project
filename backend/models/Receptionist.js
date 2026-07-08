import mongoose from 'mongoose';

const receptionistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    shift: { type: String, trim: true, default: 'General' },
  },
  { timestamps: true }
);

export default mongoose.model('Receptionist', receptionistSchema);
