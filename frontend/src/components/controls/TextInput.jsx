import React from 'react';

const TextInput = ({ label, type = "text", value, onChange, placeholder, required = false }) => {
  return (
    <div className="form-group">
      <label>{label} {required && <span style={{color: 'var(--danger)'}}>*</span>}</label>
      {type === 'textarea' ? (
        <textarea
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
        />
      ) : (
        <input 
          type={type} 
          value={value || ''} 
          onChange={e => onChange(e.target.value)} 
          placeholder={placeholder}
          required={required}
        />
      )}
    </div>
  );
};

export default TextInput;
