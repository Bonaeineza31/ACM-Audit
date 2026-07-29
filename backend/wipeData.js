import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import AssessmentModel from './models/assessmentModel.js';

const wipeData = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('MongoDB Connected for Data Wipe');

    // Delete all assessments
    const result = await AssessmentModel.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} assessments.`);

    process.exit(0);
  } catch (err) {
    console.error('Error wiping data:', err);
    process.exit(1);
  }
};

wipeData();
