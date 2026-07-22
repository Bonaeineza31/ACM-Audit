import React from 'react';

const RatingInput = ({ label, value, onChange }) => {
  return (
    <div className="form-group">
      <label>{label}</label>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        {[1, 2, 3, 4, 5].map(num => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '2px solid var(--border-color)',
              background: value === num ? 'var(--acm-light-blue)' : 'var(--bg-secondary)',
              color: value === num ? 'white' : 'var(--text-primary)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              borderColor: value === num ? 'var(--acm-light-blue)' : 'var(--border-color)'
            }}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RatingInput;
