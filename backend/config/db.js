import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...',process.env.MONGODB_URI);
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    // console.log(conn);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
