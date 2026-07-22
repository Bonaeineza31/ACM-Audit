import React from 'react';
import RadioGroup from '../controls/RadioGroup';
import RatingInput from '../controls/RatingInput';
import TextInput from '../controls/TextInput';

export const PassengerSurvey = ({ data, updateField }) => {
  const passengers = data.passengers || [];

  const addPassenger = () => {
    updateField('passengers', [...passengers, {}]);
  };

  const updatePassenger = (index, field, value) => {
    const newPassengers = [...passengers];
    newPassengers[index] = { ...newPassengers[index], [field]: value };
    updateField('passengers', newPassengers);
  };

  const removePassenger = (index) => {
    const newPassengers = passengers.filter((_, i) => i !== index);
    updateField('passengers', newPassengers);
  };

  return (
    <div className="panel animate-fade-in">
      <h2>Section E: Passenger Experience Survey</h2>
      <p>Interview at least 10 passengers.</p>
      
      {passengers.map((p, index) => (
        <div key={index} style={{ border: '1px solid var(--border-color)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', position: 'relative' }}>
          <button 
            type="button" 
            onClick={() => removePassenger(index)}
            style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Remove
          </button>
          <h3 style={{ marginTop: 0 }}>Passenger #{index + 1}</h3>
          
          <RadioGroup 
            label="1. How did you pay today?" 
            options={["Mobile Money", "Cash", "Other"]} 
            value={p['Payment Method Used']} 
            onChange={v => updatePassenger(index, 'Payment Method Used', v)} 
            inline 
          />
          
          <RadioGroup 
            label="2. How easy was the payment process?" 
            options={["Very Easy", "Easy", "Neutral", "Difficult", "Very Difficult"]} 
            value={p['Ease of Payment Process']} 
            onChange={v => updatePassenger(index, 'Ease of Payment Process', v)} 
          />
          
          <RadioGroup 
            label="3. Were you served quickly?" 
            options={["Yes", "No"]} 
            value={p['Served Quickly (Yes/No)']} 
            onChange={v => updatePassenger(index, 'Served Quickly (Yes/No)', v)} 
            inline 
          />
          
          <RadioGroup 
            label="4. Did you receive your ticket immediately after payment?" 
            options={["Yes", "No"]} 
            value={p['Received Ticket Immediately (Yes/No)']} 
            onChange={v => updatePassenger(index, 'Received Ticket Immediately (Yes/No)', v)} 
            inline 
          />
          
          <RadioGroup 
            label="5. Did you experience any payment or ticketing issues?" 
            options={["No", "Yes"]} 
            value={p['Experienced Payment/Ticketing Issue (Yes/No)']} 
            onChange={v => updatePassenger(index, 'Experienced Payment/Ticketing Issue (Yes/No)', v)} 
            inline 
          />
          {p['Experienced Payment/Ticketing Issue (Yes/No)'] === 'Yes' && (
            <TextInput 
              label="Please explain:" 
              type="textarea" 
              value={p['Issue Explanation']} 
              onChange={v => updatePassenger(index, 'Issue Explanation', v)} 
            />
          )}
          
          <RatingInput 
            label="6. Overall satisfaction (1-5)" 
            value={p['Overall Satisfaction (1-5)']} 
            onChange={v => updatePassenger(index, 'Overall Satisfaction (1-5)', v)} 
          />
        </div>
      ))}
      
      <button type="button" className="btn btn-secondary" onClick={addPassenger} style={{ width: '100%' }}>
        + Add Passenger Interview
      </button>
    </div>
  );
};
