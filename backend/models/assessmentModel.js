import mongoose from 'mongoose';

const passengerSchema = new mongoose.Schema({
  passenger_number: Number,
  payment_method: String,
  ease_of_payment: String,
  served_quickly: String,
  received_ticket_immediately: String,
  experienced_issue: String,
  issue_explanation: String,
  overall_satisfaction: Number,
});

const assessmentSchema = new mongoose.Schema({
  assessment_id: { type: String, required: true, unique: true },
  assessment_date: String,
  assessment_time: String,
  bus_company: String,
  area: String,
  address: String,
  gps_lat: Number,
  gps_lng: Number,
  assessor: String,
  weather_conditions: String,
  
  pos_powers_on: Number,
  pos_application_loads: Number,
  transaction_speed: Number,
  ticket_generation_speed: Number,
  receipt_printing_quality: Number,
  network_connectivity: Number,
  gps_accuracy: Number,
  battery_performance: Number,
  transaction_success_rate: Number,
  overall_device_reliability: Number,
  section_a_notes: String,

  time_select_destination: Number,
  time_process_payment: Number,
  time_generate_ticket: Number,
  time_print_receipt: Number,
  time_complete_transaction: Number,
  
  pos_ready_before_boarding: String,
  battery_sufficiently_charged: String,
  printer_functioning: String,
  mobile_network_available: String,
  officer_familiar_with_pos: String,
  all_passengers_issued_tickets: String,
  eod_reconciliation_completed: String,
  section_c_remarks: String,

  mm_transactions: Number,
  card_transactions: Number,
  cash_transactions: Number,
  other_transactions: Number,
  
  pos_issues_today: String,
  unsuccessful_transactions: String,
  network_interruption_freq: String,
  greatest_cause_of_delay: String,
  officer_suggestions: String,
  
  avg_queue_length: Number,
  avg_boarding_time: Number,
  longest_waiting_time: Number,
  congestion_notes: String,
  
  incidents_failed_transactions: Number,
  incidents_printer_issues: Number,
  incidents_pos_freezes: Number,
  incidents_network_outages: Number,
  incidents_manual_tickets: Number,
  incidents_duplicate_tickets: Number,
  incidents_passenger_complaints: Number,
  
  eval_ease_of_use: Number,
  eval_transaction_speed: Number,
  eval_ticketing_process: Number,
  eval_payment_options: Number,
  eval_system_reliability: Number,
  eval_user_interface: Number,
  eval_staff_efficiency: Number,
  eval_customer_experience: Number,
  eval_reporting_capability: Number,
  eval_overall_satisfaction: Number,
  
  obs_strengths: String,
  obs_weaknesses: String,
  obs_risks: String,
  obs_improvements: String,
  
  overall_performance: String,
  recommend_continued_operation: String,
  reason: String,
  photographs_taken: String,
  video_recorded: String,
  additional_attachments: String,
  assessor_signature: String,
  assessor_sign_off_date: String,
  supervisor_review: String,
  supervisor_review_date: String,

  passengers: [passengerSchema]

}, { timestamps: true, strict: false });

// Support finding all easily
assessmentSchema.statics.findAll = function() {
  return this.find().sort({ createdAt: -1 });
};

const AssessmentModel = mongoose.model('Assessment', assessmentSchema);
export default AssessmentModel;
