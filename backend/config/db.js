import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  const conn = await mongoose.connect(process.env.DATABASE_URL);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

export default connectDB;
