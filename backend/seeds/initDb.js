const pool = require('../config/db');

const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assessments (
        id SERIAL PRIMARY KEY,
        assessment_id VARCHAR(255) UNIQUE NOT NULL,
        assessment_date DATE,
        assessment_time TIME,
        bus_company VARCHAR(255),
        area VARCHAR(255),
        address VARCHAR(255),
        gps_lat DECIMAL(9,6),
        gps_lng DECIMAL(9,6),
        assessor VARCHAR(255),
        weather_conditions VARCHAR(255),
        
        -- Section A Ratings
        pos_powers_on INT,
        pos_application_loads INT,
        transaction_speed INT,
        ticket_generation_speed INT,
        receipt_printing_quality INT,
        network_connectivity INT,
        gps_accuracy INT,
        battery_performance INT,
        transaction_success_rate INT,
        overall_device_reliability INT,
        section_a_notes TEXT,
        
        -- Section B Timing
        time_select_destination DECIMAL(5,2),
        time_process_payment DECIMAL(5,2),
        time_generate_ticket DECIMAL(5,2),
        time_print_receipt DECIMAL(5,2),
        time_complete_transaction DECIMAL(5,2),
        
        -- Section C Compliance
        pos_ready_before_boarding VARCHAR(10),
        battery_sufficiently_charged VARCHAR(10),
        printer_functioning VARCHAR(10),
        mobile_network_available VARCHAR(10),
        officer_familiar_with_pos VARCHAR(10),
        all_passengers_issued_tickets VARCHAR(10),
        eod_reconciliation_completed VARCHAR(10),
        section_c_remarks TEXT,
        
        -- Section D Payment Adoption
        mm_transactions INT,
        card_transactions INT,
        cash_transactions INT,
        other_transactions INT,
        
        -- Section F Officer Interview
        pos_issues_today TEXT,
        unsuccessful_transactions TEXT,
        network_interruption_freq VARCHAR(50),
        greatest_cause_of_delay TEXT,
        officer_suggestions TEXT,
        
        -- Section G Boarding Observation
        avg_queue_length INT,
        avg_boarding_time DECIMAL(5,2),
        longest_waiting_time DECIMAL(5,2),
        congestion_notes TEXT,
        
        -- Section H Incidents
        incidents_failed_transactions INT,
        incidents_printer_issues INT,
        incidents_pos_freezes INT,
        incidents_network_outages INT,
        incidents_manual_tickets INT,
        incidents_duplicate_tickets INT,
        incidents_passenger_complaints INT,
        
        -- Section I Overall Evaluation
        eval_ease_of_use INT,
        eval_transaction_speed INT,
        eval_ticketing_process INT,
        eval_payment_options INT,
        eval_system_reliability INT,
        eval_user_interface INT,
        eval_staff_efficiency INT,
        eval_customer_experience INT,
        eval_reporting_capability INT,
        eval_overall_satisfaction INT,
        
        -- Section J Assessor Observations
        obs_strengths TEXT,
        obs_weaknesses TEXT,
        obs_risks TEXT,
        obs_improvements TEXT,
        
        -- Section K Overall & Sign-off
        overall_performance VARCHAR(50),
        recommend_continued_operation VARCHAR(50),
        reason TEXT,
        photographs_taken VARCHAR(10),
        video_recorded VARCHAR(10),
        additional_attachments TEXT,
        assessor_signature VARCHAR(255),
        assessor_sign_off_date DATE,
        supervisor_review VARCHAR(255),
        supervisor_review_date DATE,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS passengers (
        id SERIAL PRIMARY KEY,
        assessment_id VARCHAR(255) REFERENCES assessments(assessment_id) ON DELETE CASCADE,
        passenger_number INT,
        payment_method VARCHAR(50),
        ease_of_payment VARCHAR(50),
        served_quickly VARCHAR(10),
        received_ticket_immediately VARCHAR(10),
        experienced_issue VARCHAR(10),
        issue_explanation TEXT,
        overall_satisfaction INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database tables initialized successfully');
  } catch (err) {
    console.error('Error initializing database tables:', err);
  } finally {
    // Optionally close the pool if running as a standalone script
    // pool.end();
  }
};

if (require.main === module) {
  initDb().then(() => process.exit(0));
}

module.exports = initDb;
