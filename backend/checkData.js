import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import AssessmentModel from './models/assessmentModel.js';

const checkData = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    
    const assessments = await AssessmentModel.find().sort({ createdAt: -1 }).limit(5);
    
    console.log(`Found ${assessments.length} assessments in DB:`);
    assessments.forEach(a => {
      console.log(`- ID: ${a.assessment_id} | Company: ${a.bus_company} | Date: ${a.assessment_date} | CreatedAt: ${a.createdAt}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

checkData();
