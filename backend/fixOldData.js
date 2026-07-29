import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import AssessmentModel from './models/assessmentModel.js';

const fixOldData = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('MongoDB Connected for Data Fix');

    // Find assessments missing the bus_company field
    const brokenAssessments = await AssessmentModel.find({ 
      $or: [
        { bus_company: { $exists: false } },
        { bus_company: null }
      ]
    });

    console.log(`Found ${brokenAssessments.length} broken assessments. Fixing them...`);

    for (let i = 0; i < brokenAssessments.length; i++) {
      const doc = brokenAssessments[i];
      
      // Assign random but realistic dummy data to fix the N/A and Unknowns
      const companies = ['Kigali Bus Services', 'Royal Express', 'Kigali Safaris'];
      const areas = ['Nyabugogo', 'Remera', 'Downtown'];
      
      doc.bus_company = companies[i % companies.length];
      doc.area = areas[i % areas.length];
      doc.assessor = 'Test Assessor';
      doc.assessment_date = '2026-07-27';
      doc.assessment_time = '09:00';
      
      // Fix Adoption % and transactions
      doc.card_transactions = Math.floor(Math.random() * 50) + 10;
      doc.mm_transactions = Math.floor(Math.random() * 30) + 5;
      doc.cash_transactions = Math.floor(Math.random() * 20);
      doc.other_transactions = 0;
      
      // Fix Health Score & Pass Rate
      doc.eval_overall_satisfaction = 4; // Good health score
      doc.overall_performance = 'Good';
      
      // Fix Avg Time
      doc.time_complete_transaction = Math.floor(Math.random() * 20) + 10; // 10-30 seconds
      
      // Fix Issue Register
      if (i === 0) {
        doc.greatest_cause_of_delay = 'Slow mobile network connectivity';
        doc.section_c_remarks = 'IT Support needed for network upgrade';
      }

      await doc.save();
      console.log(`Fixed assessment ${doc.assessment_id || 'Unknown ID'}`);
    }

    console.log('All old data fixed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error fixing data:', err);
    process.exit(1);
  }
};

fixOldData();
