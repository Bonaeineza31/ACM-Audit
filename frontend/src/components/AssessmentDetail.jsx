import React from 'react';
import './AssessmentDetail.css';

const AssessmentDetail = ({ assessment, onBack }) => {
  if (!assessment) return null;

  return (
    <div className="animate-fade-in detail-page">
      <div className="detail-header-actions">
        <button className="btn btn-secondary" onClick={onBack}>
          &larr; Back to Assessment List
        </button>
      </div>

      <div className="glass-container detail-container">
        <div className="detail-header">
          <h2>Assessment Details: {assessment.assessment_id}</h2>
          <span className="text-muted">Recorded on {new Date(assessment.created_at).toLocaleString()}</span>
        </div>

        <div className="detail-body">
          <div className="details-grid-full">
            {Object.entries(assessment).map(([key, value]) => {
              if (key === 'id' || key === 'created_at' || value === null || value === '') return null;
              
              // Format key names
              const formattedKey = key
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

              return (
                <div className="detail-card" key={key}>
                  <span className="detail-label">{formattedKey}</span>
                  <span className="detail-value">{
                    typeof value === 'boolean' ? (value ? 'Yes' : 'No') : 
                    value instanceof Date ? new Date(value).toLocaleString() : 
                    value.toString()
                  }</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentDetail;
