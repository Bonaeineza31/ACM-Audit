import React, { useState, useEffect } from 'react';
import './IssueRegister.css';

const IssueRegister = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analytics/issues', {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch issues');
      const data = await res.json();
      setIssues(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'open':
        return <span className="status-badge open">Open</span>;
      case 'acknowledged':
        return <span className="status-badge acknowledged">Acknowledged</span>;
      case 'resolved':
        return <span className="status-badge resolved">Resolved</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const filteredIssues = statusFilter === 'all' 
    ? issues 
    : issues.filter(i => i.status.toLowerCase() === statusFilter);

  if (loading) return <div className="text-center p-5">Loading issue register...</div>;
  if (error) return <div className="alert error">Error: {error}</div>;

  return (
    <div className="issue-register-container glass-container animate-fade-in">
      <div className="issue-header">
        <h2>Automated Issue Register</h2>
        <div className="filters">
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)} 
            className="form-control"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
          <button className="btn btn-primary">Export CSV</button>
        </div>
      </div>

      <div className="table-responsive mt-3">
        <table className="acm-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Failed Item (Reason)</th>
              <th>Operator</th>
              <th>Area</th>
              <th>Date</th>
              <th>Assessor</th>
              <th>Status</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            {filteredIssues.map((issue) => (
              <tr key={issue.id}>
                <td>ISS-{issue.id.toString().padStart(4, '0')}</td>
                <td className="fw-bold">{issue.failedItem}</td>
                <td>{issue.operator}</td>
                <td>{issue.area}</td>
                <td>{issue.date}</td>
                <td>{issue.assessor}</td>
                <td>{getStatusBadge(issue.status)}</td>
                <td>{issue.owner}</td>
              </tr>
            ))}
            {filteredIssues.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center py-4">No issues match the selected filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IssueRegister;
