import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env file from backend directory
dotenv.config({ path: path.join(__dirname, '.env') });

const seedAdmin = async () => {
  try {
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('MongoDB Connected');

    const adminEmail = 'b.ineza@alustudent.com';

    let user = await User.findOne({ email: adminEmail });
    if (!user) {
      user = await User.create({
        email: adminEmail,
        role: 'admin'
      });
      console.log(`Admin user ${adminEmail} created successfully!`);
    } else {
      console.log(`Admin user ${adminEmail} already exists.`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
