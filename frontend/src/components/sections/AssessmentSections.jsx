import React from 'react';
import TextInput from '../controls/TextInput';
import SelectInput from '../controls/SelectInput';
import RatingInput from '../controls/RatingInput';
import RadioGroup from '../controls/RadioGroup';

// Base props for all sections: data (object), updateField (function)

export const GeneralInfo = ({ data, updateField }) => (
  <div className="panel animate-fade-in">
    <h2>Field Assessment Information</h2>
    <TextInput label="Assessment Date" type="date" value={data['Assessment Date']} onChange={v => updateField('Assessment Date', v)} required />
    <TextInput label="Assessment Time" type="time" value={data['Assessment Time']} onChange={v => updateField('Assessment Time', v)} required />
    <TextInput label="Bus Company" value={data['Bus Company']} onChange={v => updateField('Bus Company', v)} />
    <TextInput label="Area" value={data['Area']} onChange={v => updateField('Area', v)} />
    <TextInput label="Assessor" value={data['Assessor']} onChange={v => updateField('Assessor', v)} />
    <TextInput label="Weather Conditions" value={data['Weather Conditions']} onChange={v => updateField('Weather Conditions', v)} />
  </div>
);

export const SectionA = ({ data, updateField }) => (
  <div className="panel animate-fade-in">
    <h2>Section A: POS Device Performance</h2>
    <p>Rate each item from 1 (Poor) to 5 (Excellent).</p>
    {[
      "POS powers on successfully",
      "POS application loads correctly",
      "Transaction processing speed",
      "Ticket generation speed",
      "Receipt printing quality and speed",
      "Network connectivity",
      "GPS/location accuracy (if applicable)",
      "Battery performance",
      "Transaction success rate",
      "Overall device reliability"
    ].map(item => (
      <div key={item} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <RatingInput label={item} value={data[`${item} - Rating`]} onChange={v => updateField(`${item} - Rating`, v)} />
        </div>
      </div>
    ))}
    <TextInput label="Comments" type="textarea" value={data['Section A Notes']} onChange={v => updateField('Section A Notes', v)} />
  </div>
);

export const SectionB = ({ data, updateField }) => (
  <div className="panel animate-fade-in">
    <h2>Section B: Transaction Timing</h2>
    <p>Measure using a stopwatch (Seconds).</p>
    {[
      "Select passenger destination (sec)",
      "Process payment (sec)",
      "Generate ticket (sec)",
      "Print receipt (sec)",
      "Complete one passenger transaction (sec)"
    ].map(item => (
      <TextInput key={item} label={item} type="number" value={data[item]} onChange={v => updateField(item, v)} />
    ))}
  </div>
);

export const SectionC = ({ data, updateField }) => (
  <div className="panel animate-fade-in">
    <h2>Section C: Operational Compliance</h2>
    {[
      "POS ready before boarding",
      "Battery sufficiently charged",
      "Printer functioning correctly",
      "Mobile network available",
      "Ticketing officer familiar with POS",
      "All passengers issued tickets",
      "End-of-day reconciliation completed"
    ].map(item => (
      <RadioGroup key={item} label={item} options={["Yes", "No"]} value={data[`${item} (Yes/No)`]} onChange={v => updateField(`${item} (Yes/No)`, v)} inline />
    ))}
    <TextInput label="Remarks" type="textarea" value={data['Section C Remarks']} onChange={v => updateField('Section C Remarks', v)} />
  </div>
);

export const SectionD = ({ data, updateField }) => (
  <div className="panel animate-fade-in">
    <h2>Section D: Payment Method Adoption</h2>
    <p>Observe actual transactions.</p>
    {["Mobile Money", "Card", "Cash", "Other"].map(item => (
      <TextInput key={item} label={`${item} Transactions`} type="number" value={data[`${item} - Transactions`]} onChange={v => updateField(`${item} - Transactions`, v)} />
    ))}
  </div>
);

export const SectionE = ({ data, updateField }) => {
  // Simplification for the passenger survey
  return (
    <div className="panel animate-fade-in">
      <h2>Section E: Passenger Experience Survey</h2>
      <p>Interview at least 10 passengers (Not fully implemented here for brevity, recommend using dynamic passenger list component).</p>
      {/* We can expand this if needed */}
    </div>
  );
};

export const SectionF = ({ data, updateField }) => (
  <div className="panel animate-fade-in">
    <h2>Section F: Ticketing Officer Interview</h2>
    <TextInput label="1. Were there any POS issues during today?" type="textarea" value={data['POS Issues Today']} onChange={v => updateField('POS Issues Today', v)} />
    <TextInput label="2. Were any transactions unsuccessful?" type="textarea" value={data['Unsuccessful Transactions']} onChange={v => updateField('Unsuccessful Transactions', v)} />
    <RadioGroup label="3. How frequently do network interruptions affect ticket sales?" options={["Never", "Rarely", "Sometimes", "Often", "Always"]} value={data['Network Interruption Frequency']} onChange={v => updateField('Network Interruption Frequency', v)} />
    <TextInput label="4. What causes the greatest delays during ticket sales?" type="textarea" value={data['Greatest Cause of Delay']} onChange={v => updateField('Greatest Cause of Delay', v)} />
    <TextInput label="5. Suggestions for improvement" type="textarea" value={data['Officer Suggestions for Improvement']} onChange={v => updateField('Officer Suggestions for Improvement', v)} />
  </div>
);

export const SectionG = ({ data, updateField }) => (
  <div className="panel animate-fade-in">
    <h2>Section G: Boarding Process Observation</h2>
    <TextInput label="Average passenger queue length (persons)" type="number" value={data['Average Passenger Queue Length (persons)']} onChange={v => updateField('Average Passenger Queue Length (persons)', v)} />
    <TextInput label="Average boarding time per passenger (sec)" type="number" value={data['Average Boarding Time per Passenger (sec)']} onChange={v => updateField('Average Boarding Time per Passenger (sec)', v)} />
    <TextInput label="Longest waiting time observed (sec)" type="number" value={data['Longest Waiting Time Observed (sec)']} onChange={v => updateField('Longest Waiting Time Observed (sec)', v)} />
    <TextInput label="Congestion during boarding (notes)" type="textarea" value={data['Congestion During Boarding (notes)']} onChange={v => updateField('Congestion During Boarding (notes)', v)} />
  </div>
);

export const SectionH = ({ data, updateField }) => (
  <div className="panel animate-fade-in">
    <h2>Section H: Exception and Incident Log</h2>
    {[
      "Failed transactions",
      "Printer issues",
      "POS application freezes",
      "Network outages",
      "Manual tickets issued",
      "Duplicate tickets",
      "Passenger complaints"
    ].map(item => (
      <TextInput key={item} label={item} type="number" value={data[item]} onChange={v => updateField(item, v)} />
    ))}
  </div>
);

export const SectionI = ({ data, updateField }) => (
  <div className="panel animate-fade-in">
    <h2>Section I: Overall System Evaluation</h2>
    <p>Rate from 1 (Poor) to 5 (Excellent).</p>
    {[
      "Ease of use", "Transaction speed", "Ticketing process", "Payment options", 
      "System reliability", "User interface", "Staff efficiency", 
      "Customer experience", "Reporting capability", "Overall satisfaction"
    ].map(item => (
      <RatingInput key={item} label={item} value={data[`${item} - Rating`]} onChange={v => updateField(`${item} - Rating`, v)} />
    ))}
  </div>
);

export const SectionJ = ({ data, updateField }) => (
  <div className="panel animate-fade-in">
    <h2>Section J & K: Assessor Observations & Overall Assessment</h2>
    <TextInput label="Strengths" type="textarea" value={data['Strengths']} onChange={v => updateField('Strengths', v)} />
    <TextInput label="Weaknesses" type="textarea" value={data['Weaknesses']} onChange={v => updateField('Weaknesses', v)} />
    <TextInput label="Risks Identified" type="textarea" value={data['Risks Identified']} onChange={v => updateField('Risks Identified', v)} />
    <TextInput label="Recommended Improvements" type="textarea" value={data['Recommended Improvements']} onChange={v => updateField('Recommended Improvements', v)} />
    
    <RadioGroup label="Overall Performance" options={["Excellent", "Good", "Fair", "Poor"]} value={data['Overall Performance']} onChange={v => updateField('Overall Performance', v)} />
    <RadioGroup label="Would you recommend continued operation of the AFC system?" options={["Yes", "Yes, with improvements", "No"]} value={data['Recommend Continued Operation']} onChange={v => updateField('Recommend Continued Operation', v)} />
    <TextInput label="Reason" type="textarea" value={data['Reason']} onChange={v => updateField('Reason', v)} />
    
    <h3>Supporting Evidence</h3>
    <RadioGroup label="Photographs Taken" options={["Yes", "No"]} value={data['Photographs Taken']} onChange={v => updateField('Photographs Taken', v)} inline />
    <RadioGroup label="Video Recorded" options={["Yes", "No"]} value={data['Video Recorded']} onChange={v => updateField('Video Recorded', v)} inline />
    <TextInput label="Assessor Signature" value={data['Assessor Signature']} onChange={v => updateField('Assessor Signature', v)} />
    <TextInput label="Supervisor Review" value={data['Supervisor Review']} onChange={v => updateField('Supervisor Review', v)} />
  </div>
);
