import AssessmentModel from '../models/assessmentModel.js';

export const createAssessment = async (req, res, next) => {
  try {
    const assessmentData = [
      req.body.assessment_id, req.body.assessment_date, req.body.assessment_time, req.body.bus_company, req.body.area,
      req.body.address, req.body.gps_lat, req.body.gps_lng, req.body.assessor, req.body.weather_conditions,
      req.body.pos_powers_on, req.body.pos_application_loads, req.body.transaction_speed, req.body.ticket_generation_speed,
      req.body.receipt_printing_quality, req.body.network_connectivity, req.body.gps_accuracy, req.body.battery_performance,
      req.body.transaction_success_rate, req.body.overall_device_reliability, req.body.section_a_notes,
      req.body.time_select_destination, req.body.time_process_payment, req.body.time_generate_ticket,
      req.body.time_print_receipt, req.body.time_complete_transaction, req.body.pos_ready_before_boarding,
      req.body.battery_sufficiently_charged, req.body.printer_functioning, req.body.mobile_network_available,
      req.body.officer_familiar_with_pos, req.body.all_passengers_issued_tickets, req.body.eod_reconciliation_completed,
      req.body.section_c_remarks, req.body.mm_transactions, req.body.card_transactions, req.body.cash_transactions,
      req.body.other_transactions, req.body.pos_issues_today, req.body.unsuccessful_transactions,
      req.body.network_interruption_freq, req.body.greatest_cause_of_delay, req.body.officer_suggestions,
      req.body.avg_queue_length, req.body.avg_boarding_time, req.body.longest_waiting_time, req.body.congestion_notes,
      req.body.incidents_failed_transactions, req.body.incidents_printer_issues, req.body.incidents_pos_freezes,
      req.body.incidents_network_outages, req.body.incidents_manual_tickets, req.body.incidents_duplicate_tickets,
      req.body.incidents_passenger_complaints, req.body.eval_ease_of_use, req.body.eval_transaction_speed,
      req.body.eval_ticketing_process, req.body.eval_payment_options, req.body.eval_system_reliability,
      req.body.eval_user_interface, req.body.eval_staff_efficiency, req.body.eval_customer_experience,
      req.body.eval_reporting_capability, req.body.eval_overall_satisfaction, req.body.obs_strengths,
      req.body.obs_weaknesses, req.body.obs_risks, req.body.obs_improvements, req.body.overall_performance,
      req.body.recommend_continued_operation, req.body.reason, req.body.photographs_taken, req.body.video_recorded,
      req.body.additional_attachments, req.body.assessor_signature, req.body.assessor_sign_off_date,
      req.body.supervisor_review, req.body.supervisor_review_date
    ];

    const newAssessment = await AssessmentModel.create(assessmentData);
    res.status(201).json({ message: 'Assessment created successfully', data: newAssessment });
  } catch (error) {
    next(error);
  }
};

export const getAssessments = async (req, res, next) => {
  try {
    const assessments = await AssessmentModel.findAll();
    
    // Privacy feature: Strip section F if user is Viewer
    if (req.user && req.user.role === 'Viewer') {
      const sanitized = assessments.map(a => {
        const copy = { ...a };
        delete copy.pos_issues_today;
        delete copy.unsuccessful_transactions;
        delete copy.network_interruption_freq;
        delete copy.greatest_cause_of_delay;
        delete copy.officer_suggestions;
        return copy;
      });
      return res.json(sanitized);
    }
    
    res.json(assessments);
  } catch (error) {
    next(error);
  }
};
