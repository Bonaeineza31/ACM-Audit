const pool = require('../config/db');

class AssessmentModel {
  static async create(data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const assessmentId = data['Assessment ID'] || \`UNSPECIFIED-\${Date.now()}\`;

      const assessmentQuery = \`
        INSERT INTO assessments (
          assessment_id, assessment_date, assessment_time, bus_company, area, address, gps_lat, gps_lng, assessor, weather_conditions,
          pos_powers_on, pos_application_loads, transaction_speed, ticket_generation_speed, receipt_printing_quality, network_connectivity, gps_accuracy, battery_performance, transaction_success_rate, overall_device_reliability, section_a_notes,
          time_select_destination, time_process_payment, time_generate_ticket, time_print_receipt, time_complete_transaction,
          pos_ready_before_boarding, battery_sufficiently_charged, printer_functioning, mobile_network_available, officer_familiar_with_pos, all_passengers_issued_tickets, eod_reconciliation_completed, section_c_remarks,
          mm_transactions, card_transactions, cash_transactions, other_transactions,
          pos_issues_today, unsuccessful_transactions, network_interruption_freq, greatest_cause_of_delay, officer_suggestions,
          avg_queue_length, avg_boarding_time, longest_waiting_time, congestion_notes,
          incidents_failed_transactions, incidents_printer_issues, incidents_pos_freezes, incidents_network_outages, incidents_manual_tickets, incidents_duplicate_tickets, incidents_passenger_complaints,
          eval_ease_of_use, eval_transaction_speed, eval_ticketing_process, eval_payment_options, eval_system_reliability, eval_user_interface, eval_staff_efficiency, eval_customer_experience, eval_reporting_capability, eval_overall_satisfaction,
          obs_strengths, obs_weaknesses, obs_risks, obs_improvements,
          overall_performance, recommend_continued_operation, reason, photographs_taken, video_recorded, additional_attachments, assessor_signature, assessor_sign_off_date, supervisor_review, supervisor_review_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21,
          $22, $23, $24, $25, $26,
          $27, $28, $29, $30, $31, $32, $33, $34,
          $35, $36, $37, $38,
          $39, $40, $41, $42, $43,
          $44, $45, $46, $47,
          $48, $49, $50, $51, $52, $53, $54,
          $55, $56, $57, $58, $59, $60, $61, $62, $63, $64,
          $65, $66, $67, $68,
          $69, $70, $71, $72, $73, $74, $75, $76, $77, $78
        ) RETURNING id;
      \`;
      
      const values = [
        assessmentId, data['Assessment Date'] || null, data['Assessment Time'] || null, data['Bus Company'], data['Area'], data['Address'], data['GPS Latitude'] ? parseFloat(data['GPS Latitude']) : null, data['GPS Longitude'] ? parseFloat(data['GPS Longitude']) : null, data['Assessor'], data['Weather Conditions'],
        data['POS powers on successfully - Rating'] || null, data['POS application loads correctly - Rating'] || null, data['Transaction processing speed - Rating'] || null, data['Ticket generation speed - Rating'] || null, data['Receipt printing quality and speed - Rating'] || null, data['Network connectivity - Rating'] || null, data['GPS/location accuracy (if applicable) - Rating'] || null, data['Battery performance - Rating'] || null, data['Transaction success rate - Rating'] || null, data['Overall device reliability - Rating'] || null, data['Section A Notes'],
        data['Select passenger destination (sec)'] ? parseFloat(data['Select passenger destination (sec)']) : null, data['Process payment (sec)'] ? parseFloat(data['Process payment (sec)']) : null, data['Generate ticket (sec)'] ? parseFloat(data['Generate ticket (sec)']) : null, data['Print receipt (sec)'] ? parseFloat(data['Print receipt (sec)']) : null, data['Complete one passenger transaction (sec)'] ? parseFloat(data['Complete one passenger transaction (sec)']) : null,
        data['POS ready before boarding (Yes/No)'], data['Battery sufficiently charged (Yes/No)'], data['Printer functioning correctly (Yes/No)'], data['Mobile network available (Yes/No)'], data['Ticketing officer familiar with POS (Yes/No)'], data['All passengers issued tickets (Yes/No)'], data['End-of-day reconciliation completed (Yes/No)'], data['Section C Remarks'],
        data['Mobile Money - Transactions'] ? parseInt(data['Mobile Money - Transactions']) : null, data['Card - Transactions'] ? parseInt(data['Card - Transactions']) : null, data['Cash - Transactions'] ? parseInt(data['Cash - Transactions']) : null, data['Other - Transactions'] ? parseInt(data['Other - Transactions']) : null,
        data['POS Issues Today'], data['Unsuccessful Transactions'], data['Network Interruption Frequency'], data['Greatest Cause of Delay'], data['Officer Suggestions for Improvement'],
        data['Average Passenger Queue Length (persons)'] ? parseInt(data['Average Passenger Queue Length (persons)']) : null, data['Average Boarding Time per Passenger (sec)'] ? parseFloat(data['Average Boarding Time per Passenger (sec)']) : null, data['Longest Waiting Time Observed (sec)'] ? parseFloat(data['Longest Waiting Time Observed (sec)']) : null, data['Congestion During Boarding (notes)'],
        data['Failed transactions'] ? parseInt(data['Failed transactions']) : null, data['Printer issues'] ? parseInt(data['Printer issues']) : null, data['POS application freezes'] ? parseInt(data['POS application freezes']) : null, data['Network outages'] ? parseInt(data['Network outages']) : null, data['Manual tickets issued'] ? parseInt(data['Manual tickets issued']) : null, data['Duplicate tickets'] ? parseInt(data['Duplicate tickets']) : null, data['Passenger complaints'] ? parseInt(data['Passenger complaints']) : null,
        data['Ease of use - Rating'] || null, data['Transaction speed - Rating'] || null, data['Ticketing process - Rating'] || null, data['Payment options - Rating'] || null, data['System reliability - Rating'] || null, data['User interface - Rating'] || null, data['Staff efficiency - Rating'] || null, data['Customer experience - Rating'] || null, data['Reporting capability - Rating'] || null, data['Overall satisfaction - Rating'] || null,
        data['Strengths'], data['Weaknesses'], data['Risks Identified'], data['Recommended Improvements'],
        data['Overall Performance'], data['Recommend Continued Operation'], data['Reason'], data['Photographs Taken'], data['Video Recorded'], data['Additional Attachments'], data['Assessor Signature'], data['Assessor Sign-off Date'] || null, data['Supervisor Review'], data['Supervisor Review Date'] || null
      ];
      
      await client.query(assessmentQuery, values);

      if (data.passengers && Array.isArray(data.passengers)) {
        const passengerQuery = \`
          INSERT INTO passengers (
            assessment_id, passenger_number, payment_method, ease_of_payment, served_quickly, received_ticket_immediately, experienced_issue, issue_explanation, overall_satisfaction
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        \`;
        
        for (let i = 0; i < data.passengers.length; i++) {
          const p = data.passengers[i];
          await client.query(passengerQuery, [
            assessmentId,
            i + 1,
            p['Payment Method Used'],
            p['Ease of Payment Process'],
            p['Served Quickly (Yes/No)'],
            p['Received Ticket Immediately (Yes/No)'],
            p['Experienced Payment/Ticketing Issue (Yes/No)'],
            p['Issue Explanation'],
            p['Overall Satisfaction (1-5)'] || null
          ]);
        }
      }
      
      await client.query('COMMIT');
      return assessmentId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findAll() {
    const result = await pool.query('SELECT assessment_id, assessment_date, bus_company, area, overall_performance FROM assessments ORDER BY created_at DESC');
    return result.rows;
  }
}

module.exports = AssessmentModel;
