import React from 'react';

const RadioGroup = ({ label, value, onChange, options, inline = false }) => {
  return (
    <div className="form-group">
      <label>{label}</label>
      <div style={{ display: 'flex', gap: '1rem', flexDirection: inline ? 'row' : 'column', marginTop: '0.5rem' }}>
        {options.map((opt, idx) => (
          <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'normal', cursor: 'pointer', margin: 0 }}>
            <input 
              type="radio" 
              name={label} 
              value={opt} 
              checked={value === opt}
              onChange={() => onChange(opt)} 
              style={{ width: 'auto', margin: 0 }}
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
};

export default RadioGroup;
