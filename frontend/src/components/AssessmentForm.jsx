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
      assessment_id: formData['Assessment ID'] || `ACM-AUDIT-${Math.floor(1000 + Math.random() * 9000)}`,
      assessment_date: formData['Date'] || new Date().toISOString().split('T')[0],
      assessment_time: formData['Time'] || new Date().toTimeString().split(' ')[0],
      bus_company: formData['Bus Company / Sacco'],
      area: formData['Area / Route'],
      address: formData['Physical Address'],
      gps_lat: formData['GPS Coordinates (Lat)'],
      gps_lng: formData['GPS Coordinates (Lng)'],
      assessor: formData['Name of Assessor'],
      weather_conditions: formData['Weather Conditions'],
      
      pos_powers_on: formData['POS device powers on?'],
      pos_application_loads: formData['Ticketing application loads?'],
      transaction_speed: formData['Speed of transaction (1-5)'],
      ticket_generation_speed: formData['Ticket generation speed (1-5)'],
      receipt_printing_quality: formData['Receipt printing quality (1-5)'],
      network_connectivity: formData['Network connectivity strength (1-5)'],
      gps_accuracy: formData['GPS location accuracy (1-5)'],
      battery_performance: formData['Battery performance / drainage rate (1-5)'],
      transaction_success_rate: formData['Transaction success rate'],
      overall_device_reliability: formData['Overall device reliability'],
      section_a_notes: formData['Comments'],

      time_select_destination: formData['Time to select destination'],
      time_process_payment: formData['Time to process payment'],
      time_generate_ticket: formData['Time to generate ticket'],
      time_print_receipt: formData['Time to print receipt'],
      time_complete_transaction: formData['Total time to complete transaction'],
      pos_ready_before_boarding: formData['POS ready before passengers board?'],
      battery_sufficiently_charged: formData['Battery sufficiently charged for shift?'],
      printer_functioning: formData['Printer functioning correctly?'],
      mobile_network_available: formData['Mobile network available?'],
      officer_familiar_with_pos: formData['Officer familiar with POS operation?'],
      all_passengers_issued_tickets: formData['All passengers issued tickets before departure?'],
      eod_reconciliation_completed: formData['End of Day reconciliation completed properly?'],
      section_c_remarks: formData['Remarks'],

      mm_transactions: formData['Mobile Money (M-Pesa, Momo)'],
      card_transactions: formData['Tap-and-Go Cards'],
      cash_transactions: formData['Cash (if applicable)'],
      other_transactions: formData['Other'],
      
      pos_issues_today: formData['1. Were there any POS issues during today?'],
      unsuccessful_transactions: formData['2. Were any transactions unsuccessful?'],
      network_interruption_freq: formData['3. How frequently do network interruptions affect ticket sales?'],
      greatest_cause_of_delay: formData['4. What causes the greatest delays during ticket sales?'],
      officer_suggestions: formData['5. Suggestions for improvement'],
      
      avg_queue_length: formData['Average passenger queue length (persons)'],
      avg_boarding_time: formData['Average boarding time per passenger (sec)'],
      longest_waiting_time: formData['Longest waiting time observed (sec)'],
      congestion_notes: formData['Congestion during boarding (notes)'],
      
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

      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="form-content">
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
              type="submit" 
              className="btn btn-primary ml-auto submit-btn" 
              disabled={isSubmitting}
              onClick={(e) => {
                // Check if they just changed to this tab a split second ago
                if (Date.now() - window.lastTabChangeTime < 1000) {
                  e.preventDefault();
                  return;
                }
                if (e.detail > 1) {
                  e.preventDefault();
                }
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
      </form>
    </div>
  );
}

export default AssessmentForm;
