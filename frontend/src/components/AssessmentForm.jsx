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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) throw new Error('Submission failed');
      
      setSubmitStatus('success');
      // Optional: reset form
      // setFormData({});
      // setActiveTab(0);
    } catch (error) {
      console.error(error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextTab = () => setActiveTab(prev => Math.min(tabs.length - 1, prev + 1));
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

      <form onSubmit={handleSubmit} className="form-content">
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
            <button type="button" className="btn btn-primary ml-auto" onClick={nextTab}>
              Next Section
            </button>
          ) : (
            <button type="submit" className="btn btn-primary ml-auto" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
            </button>
          )}
        </div>

        {submitStatus === 'success' && (
          <div className="alert success animate-fade-in">Assessment submitted successfully!</div>
        )}
        {submitStatus === 'error' && (
          <div className="alert error animate-fade-in">Failed to submit assessment. Please try again.</div>
        )}
      </form>
    </div>
  );
}

export default AssessmentForm;
