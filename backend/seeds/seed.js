import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Receptionist from '../models/Receptionist.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import Bill from '../models/Bill.js';

dotenv.config();

const requiredEnv = (key) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
};

const departments = [
  { name: 'Cardiology', description: 'Heart and cardiovascular system care' },
  { name: 'Neurology', description: 'Brain and nervous system disorders' },
  { name: 'Orthopedics', description: 'Bones, joints, and musculoskeletal system' },
  { name: 'Pediatrics', description: 'Medical care for infants and children' },
  { name: 'General Medicine', description: 'Primary healthcare and general treatment' },
  { name: 'ENT', description: 'Ear, nose, and throat specialist care' },
];

async function seed() {
  try {
    await mongoose.connect(requiredEnv('MONGODB_URI'));

    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Doctor.deleteMany({}),
      Patient.deleteMany({}),
      Receptionist.deleteMany({}),
      Appointment.deleteMany({}),
      Prescription.deleteMany({}),
      Bill.deleteMany({}),
    ]);

    await User.create({
      fullName: 'System Admin',
      email: requiredEnv('SEED_ADMIN_EMAIL'),
      password: requiredEnv('SEED_ADMIN_PASSWORD'),
      role: 'admin',
      phone: '9876543210',
    });

    const receptionistUser = await User.create({
      fullName: 'Sarah Johnson',
      email: requiredEnv('SEED_RECEPTIONIST_EMAIL'),
      password: requiredEnv('SEED_RECEPTIONIST_PASSWORD'),
      role: 'receptionist',
      phone: '9876543211',
    });

    await Receptionist.create({
      user: receptionistUser._id,
      fullName: 'Sarah Johnson',
      phone: '9876543211',
      shift: 'Morning',
    });

    const createdDepts = await Department.insertMany(departments);

    const doctorUsers = await Promise.all([
      User.create({
        fullName: 'Dr. Rajesh Kumar',
        email: requiredEnv('SEED_DOCTOR1_EMAIL'),
        password: requiredEnv('SEED_DOCTOR1_PASSWORD'),
        role: 'doctor',
        phone: '9876543212',
      }),
      User.create({
        fullName: 'Dr. Priya Sharma',
        email: requiredEnv('SEED_DOCTOR2_EMAIL'),
        password: requiredEnv('SEED_DOCTOR2_PASSWORD'),
        role: 'doctor',
        phone: '9876543213',
      }),
      User.create({
        fullName: 'Dr. Amit Patel',
        email: requiredEnv('SEED_DOCTOR3_EMAIL'),
        password: requiredEnv('SEED_DOCTOR3_PASSWORD'),
        role: 'doctor',
        phone: '9876543214',
      }),
    ]);

    const doctors = await Doctor.insertMany([
      { user: doctorUsers[0]._id, department: createdDepts[0]._id, qualification: 'MD Cardiology', experience: 12, phone: '9876543212', consultationFee: 800 },
      { user: doctorUsers[1]._id, department: createdDepts[1]._id, qualification: 'MD Neurology', experience: 8, phone: '9876543213', consultationFee: 750 },
      { user: doctorUsers[2]._id, department: createdDepts[4]._id, qualification: 'MBBS, MD', experience: 15, phone: '9876543214', consultationFee: 600 },
    ]);

    const patientUser = await User.create({
      fullName: 'John Doe',
      email: requiredEnv('SEED_PATIENT_EMAIL'),
      password: requiredEnv('SEED_PATIENT_PASSWORD'),
      role: 'patient',
      phone: '9876543215',
    });

    const patients = await Patient.insertMany([
      { user: patientUser._id, fullName: 'John Doe', age: 35, gender: 'Male', phone: '9876543215', address: '123 Main St, City', bloodGroup: 'O+' },
      { fullName: 'Jane Smith', age: 28, gender: 'Female', phone: '9876543216', address: '456 Oak Ave, City', bloodGroup: 'A+' },
      { fullName: 'Robert Wilson', age: 45, gender: 'Male', phone: '9876543217', address: '789 Pine Rd, City', bloodGroup: 'B+' },
      { fullName: 'Aisha Khan', age: 31, gender: 'Female', phone: '9876543218', address: '22 Lake View Road, City', bloodGroup: 'AB+' },
      { fullName: 'Vikram Singh', age: 52, gender: 'Male', phone: '9876543219', address: '78 Green Park, City', bloodGroup: 'A-' },
      { fullName: 'Meera Joshi', age: 24, gender: 'Female', phone: '9876543220', address: '14 Sunshine Colony, City', bloodGroup: 'O-' },
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const appointments = await Appointment.insertMany([
      { patient: patients[0]._id, doctor: doctors[0]._id, department: createdDepts[0]._id, appointmentDate: today, appointmentTime: '10:00 AM', status: 'Completed' },
      { patient: patients[1]._id, doctor: doctors[1]._id, department: createdDepts[1]._id, appointmentDate: today, appointmentTime: '11:30 AM', status: 'Pending' },
      { patient: patients[2]._id, doctor: doctors[2]._id, department: createdDepts[4]._id, appointmentDate: tomorrow, appointmentTime: '09:00 AM', status: 'Pending' },
      { patient: patients[3]._id, doctor: doctors[0]._id, department: createdDepts[0]._id, appointmentDate: today, appointmentTime: '02:00 PM', status: 'Pending' },
      { patient: patients[4]._id, doctor: doctors[1]._id, department: createdDepts[1]._id, appointmentDate: yesterday, appointmentTime: '04:30 PM', status: 'Completed' },
      { patient: patients[5]._id, doctor: doctors[2]._id, department: createdDepts[4]._id, appointmentDate: nextWeek, appointmentTime: '12:00 PM', status: 'Pending' },
    ]);

    await Prescription.insertMany([
      {
        appointment: appointments[0]._id,
        patient: patients[0]._id,
        doctor: doctors[0]._id,
        items: [
          { medicineName: 'Aspirin', dosage: '75mg', duration: '30 days', instructions: 'Take after breakfast', price: 150 },
          { medicineName: 'Atorvastatin', dosage: '20mg', duration: '30 days', instructions: 'Take at night', price: 300 },
        ],
        additionalNotes: 'Follow up in 4 weeks',
      },
      {
        appointment: appointments[4]._id,
        patient: patients[4]._id,
        doctor: doctors[1]._id,
        items: [
          { medicineName: 'Vitamin B12', dosage: '500mcg', duration: '15 days', instructions: 'Take after lunch', price: 180 },
          { medicineName: 'Paracetamol', dosage: '500mg', duration: '3 days', instructions: 'Take only if fever occurs', price: 60 },
        ],
        additionalNotes: 'Review test reports next visit',
      },
    ]);

    await Bill.insertMany([
      {
        appointment: appointments[0]._id,
        patient: patients[0]._id,
        doctor: doctors[0]._id,
        consultationFee: 800,
        medicineCharges: 450,
        totalAmount: 1250,
        status: 'Paid',
      },
      {
        appointment: appointments[4]._id,
        patient: patients[4]._id,
        doctor: doctors[1]._id,
        consultationFee: 750,
        medicineCharges: 240,
        totalAmount: 990,
        status: 'Unpaid',
      },
      {
        appointment: appointments[3]._id,
        patient: patients[3]._id,
        doctor: doctors[0]._id,
        consultationFee: 800,
        medicineCharges: 0,
        totalAmount: 800,
        status: 'Unpaid',
      },
    ]);

    process.exit(0);
  } catch (error) {
    process.stderr.write(`Seed failed: ${error.message}\n`);
    process.exit(1);
  }
}

seed();
