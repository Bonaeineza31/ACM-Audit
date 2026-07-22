import React from 'react';

const SelectInput = ({ label, value, onChange, options, required = false }) => {
  return (
    <div className="form-group">
      <label>{label} {required && <span style={{color: 'var(--danger)'}}>*</span>}</label>
      <select 
        value={value || ''} 
        onChange={e => onChange(e.target.value)}
        required={required}
      >
        <option value="" disabled>Select an option</option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
};

export default SelectInput;
