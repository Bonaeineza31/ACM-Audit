import mongoose from 'mongoose';
import dotenv from 'dotenv';
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.DATABASE_URL).then((mongoose) => {
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
      return mongoose;
    });
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDB;
