import { useState } from 'react';
import './AssessmentForm.css';

import { 
  GeneralInfo, SectionA, SectionB, SectionC, SectionD, 
  SectionF, SectionG, SectionH, SectionI, SectionJ 
} from './sections/AssessmentSections';
import { PassengerSurvey } from './sections/PassengerSurvey';

function AssessmentForm() {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const tabs = [
    'General',
    'Sec A: POS',
    'Sec B: Time',
    'Sec C: Ops',
    'Sec D: Payment',
    'Sec E: Survey',
    'Sec F: Officer',
    'Sec G: Boarding',
    'Sec H: Incidents',
    'Sec I: Eval',
    'Sec J-K: Final'
  ];

  const handleUpdateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (submitStatus) setSubmitStatus(null);
  };

  const handleKeyDown = (e) => {
    // Prevent Enter key from accidentally submitting the entire form
    // unless they are inside a textarea where Enter should create a newline
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    // Map the human-readable frontend keys to the backend snake_case keys
    const mappedData = {
      assessment_id: formData['Assessment ID'] || `ACM-AUDIT-${Math.floor(1000 + Math.random() * 9000)}`, // Backend overrides this now
      assessment_date: formData['Assessment Date'] || new Date().toISOString().split('T')[0],
      assessment_time: formData['Assessment Time'] || new Date().toTimeString().split(' ')[0],
      bus_company: formData['Bus Company'],
      area: formData['Area'],
      address: formData['Physical Address'],
      gps_lat: formData['GPS Coordinates (Lat)'],
      gps_lng: formData['GPS Coordinates (Lng)'],
      assessor: formData['Assessor'],
      weather_conditions: formData['Weather Conditions'],
      
      pos_powers_on: formData['POS powers on successfully - Rating'],
      pos_application_loads: formData['POS application loads correctly - Rating'],
      transaction_speed: formData['Transaction processing speed - Rating'],
      ticket_generation_speed: formData['Ticket generation speed - Rating'],
      receipt_printing_quality: formData['Receipt printing quality and speed - Rating'],
      network_connectivity: formData['Network connectivity - Rating'],
      gps_accuracy: formData['GPS/location accuracy (if applicable) - Rating'],
      battery_performance: formData['Battery performance - Rating'],
      transaction_success_rate: formData['Transaction success rate - Rating'],
      overall_device_reliability: formData['Overall device reliability - Rating'],
      section_a_notes: formData['Section A Notes'],

      time_select_destination: formData['Select passenger destination (sec)'],
      time_process_payment: formData['Process payment (sec)'],
      time_generate_ticket: formData['Generate ticket (sec)'],
      time_print_receipt: formData['Print receipt (sec)'],
      time_complete_transaction: formData['Complete one passenger transaction (sec)'],
      
      pos_ready_before_boarding: formData['POS ready before boarding (Yes/No)'],
      battery_sufficiently_charged: formData['Battery sufficiently charged (Yes/No)'],
      printer_functioning: formData['Printer functioning correctly (Yes/No)'],
      mobile_network_available: formData['Mobile network available (Yes/No)'],
      officer_familiar_with_pos: formData['Ticketing officer familiar with POS (Yes/No)'],
      all_passengers_issued_tickets: formData['All passengers issued tickets (Yes/No)'],
      eod_reconciliation_completed: formData['End-of-day reconciliation completed (Yes/No)'],
      section_c_remarks: formData['Section C Remarks'],

      mm_transactions: formData['Mobile Money - Transactions'],
      card_transactions: formData['Card - Transactions'],
      cash_transactions: formData['Cash - Transactions'],
      other_transactions: formData['Other - Transactions'],
      
      pos_issues_today: formData['POS Issues Today'],
      unsuccessful_transactions: formData['Unsuccessful Transactions'],
      network_interruption_freq: formData['Network Interruption Frequency'],
      greatest_cause_of_delay: formData['Greatest Cause of Delay'],
      officer_suggestions: formData['Officer Suggestions for Improvement'],
      
      avg_queue_length: formData['Average Passenger Queue Length (persons)'],
      avg_boarding_time: formData['Average Boarding Time per Passenger (sec)'],
      longest_waiting_time: formData['Longest Waiting Time Observed (sec)'],
      congestion_notes: formData['Congestion During Boarding (notes)'],
      
      incidents_failed_transactions: formData['Failed transactions'],
      incidents_printer_issues: formData['Printer issues'],
      incidents_pos_freezes: formData['POS application freezes'],
      incidents_network_outages: formData['Network outages'],
      incidents_manual_tickets: formData['Manual tickets issued'],
      incidents_duplicate_tickets: formData['Duplicate tickets'],
      incidents_passenger_complaints: formData['Passenger complaints'],
      
      eval_ease_of_use: formData['Ease of use - Rating'],
      eval_transaction_speed: formData['Transaction speed - Rating'],
      eval_ticketing_process: formData['Ticketing process - Rating'],
      eval_payment_options: formData['Payment options - Rating'],
      eval_system_reliability: formData['System reliability - Rating'],
      eval_user_interface: formData['User interface - Rating'],
      eval_staff_efficiency: formData['Staff efficiency - Rating'],
      eval_customer_experience: formData['Customer experience - Rating'],
      eval_reporting_capability: formData['Reporting capability - Rating'],
      eval_overall_satisfaction: formData['Overall satisfaction - Rating'],
      
      obs_strengths: formData['Strengths'],
      obs_weaknesses: formData['Weaknesses'],
      obs_risks: formData['Risks Identified'],
      obs_improvements: formData['Recommended Improvements'],
      overall_performance: formData['Overall Performance'],
      recommend_continued_operation: formData['Recommend Continued Operation'],
      reason: formData['Reason'],
      photographs_taken: formData['Photographs Taken'],
      video_recorded: formData['Video Recorded'],
      assessor_signature: formData['Assessor Signature'],
      supervisor_review: formData['Supervisor Review']
    };

    try {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mappedData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Submission failed');
      }
      
      setSubmitStatus('success');
      // Reset form so the user can enter another assessment
      setFormData({});
      setActiveTab(0);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    } catch (error) {
      console.error(error);
      setSubmitStatus(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextTab = () => {
    window.lastTabChangeTime = Date.now();
    setActiveTab(prev => Math.min(tabs.length - 1, prev + 1));
  };
  const prevTab = () => setActiveTab(prev => Math.max(0, prev - 1));

  const renderActiveSection = () => {
    switch (activeTab) {
      case 0: return <GeneralInfo data={formData} updateField={handleUpdateField} />;
      case 1: return <SectionA data={formData} updateField={handleUpdateField} />;
      case 2: return <SectionB data={formData} updateField={handleUpdateField} />;
      case 3: return <SectionC data={formData} updateField={handleUpdateField} />;
      case 4: return <SectionD data={formData} updateField={handleUpdateField} />;
      case 5: return <PassengerSurvey data={formData} updateField={handleUpdateField} />;
      case 6: return <SectionF data={formData} updateField={handleUpdateField} />;
      case 7: return <SectionG data={formData} updateField={handleUpdateField} />;
      case 8: return <SectionH data={formData} updateField={handleUpdateField} />;
      case 9: return <SectionI data={formData} updateField={handleUpdateField} />;
      case 10: return <SectionJ data={formData} updateField={handleUpdateField} />;
      default: return null;
    }
  };

  return (
    <div className="glass-container assessment-form">
      <div className="tabs-navigation">
        {tabs.map((tab, index) => (
          <button 
            key={index}
            type="button"
            className={`tab-btn ${activeTab === index ? 'active' : ''}`}
            onClick={() => setActiveTab(index)}
          >
            <span className="tab-number">{index + 1}</span>
            <span className="tab-label">{tab}</span>
          </button>
        ))}
      </div>

      <div className="form-content" onKeyDown={handleKeyDown}>
        <div className="tab-panels">
          {renderActiveSection()}
        </div>

        <div className="form-actions">
          {activeTab > 0 && (
            <button type="button" className="btn btn-secondary" onClick={prevTab}>
              Previous
            </button>
          )}
          
          {activeTab < tabs.length - 1 ? (
            <button 
              type="button" 
              className="btn btn-primary ml-auto" 
              onClick={(e) => {
                const btn = e.target;
                btn.style.pointerEvents = 'none';
                nextTab();
                // When we reach the final tab, disable submit for 1 second to prevent double-tap
                setTimeout(() => {
                  if (btn) btn.style.pointerEvents = 'auto';
                }, 1000);
              }}
            >
              Next Section
            </button>
          ) : (
            <button 
              type="button" 
              className="btn btn-primary ml-auto submit-btn" 
              disabled={isSubmitting}
              onClick={(e) => {
                // Check if they just changed to this tab a split second ago
                if (window.lastTabChangeTime && Date.now() - window.lastTabChangeTime < 1000) {
                  return;
                }
                handleSubmit(e);
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
            </button>
          )}
        </div>

        {submitStatus === 'success' && (
          <div className="alert success animate-fade-in">Assessment submitted successfully!</div>
        )}
        {submitStatus && submitStatus !== 'success' && (
          <div className="status-message error animate-fade-in">
            Failed to submit assessment: {submitStatus}
          </div>
        )}
      </div>
    </div>
  );
}

export default AssessmentForm;
