import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './DashboardOverview.css';
import AssessmentList from './AssessmentList';

const DashboardOverview = ({ onViewDetail }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Global filters
  const [dateRange, setDateRange] = useState('30days');
  const [operator, setOperator] = useState('all');
  const [area, setArea] = useState('all');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/analytics/kpis?dateRange=${dateRange}&operator=${operator}&area=${area}`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, operator, area]);

  const renderTrend = (trend) => {
    if (trend > 0) return <span className="trend positive">↑ {trend}%</span>;
    if (trend < 0) return <span className="trend negative">↓ {Math.abs(trend)}%</span>;
    return <span className="trend neutral">-</span>;
  };

  if (loading && !data) return <div className="text-center p-5">Loading analytics...</div>;
  if (error) return <div className="alert error">Error: {error}</div>;
  if (!data) return null;

  // PRD: Empty state matters
  if (data.kpis.assessments.value === 0) {
    return (
      <div className="dashboard-container glass-container text-center p-5">
        <h2>No assessments in this period</h2>
        <p>Try widening the date range to see analytics.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-filters glass-container">
        <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="form-control">
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>
        <select value={operator} onChange={e => setOperator(e.target.value)} className="form-control">
          <option value="all">All Operators</option>
          <option value="Kigali Bus Services">Kigali Bus Services</option>
          <option value="Royal Express">Royal Express</option>
          <option value="Kigali Safaris">Kigali Safaris</option>
        </select>
        <select value={area} onChange={e => setArea(e.target.value)} className="form-control">
          <option value="all">All Areas</option>
          <option value="Nyabugogo">Nyabugogo</option>
          <option value="Remera">Remera</option>
          <option value="Downtown">Downtown</option>
        </select>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card glass-container">
          <h3>Cashless Adoption</h3>
          <div className="kpi-value">{data.kpis.cashlessAdoption.value}%</div>
          {renderTrend(data.kpis.cashlessAdoption.trend)}
        </div>
        <div className="kpi-card glass-container">
          <h3>Assessments</h3>
          <div className="kpi-value">{data.kpis.assessments.value}</div>
          {renderTrend(data.kpis.assessments.trend)}
        </div>
        <div className="kpi-card glass-container">
          <h3>Revenue-Risk Incidents</h3>
          <div className="kpi-value">{data.kpis.revenueRiskIncidents.value}</div>
          {renderTrend(data.kpis.revenueRiskIncidents.trend)}
        </div>
        <div className="kpi-card glass-container">
          <h3>Compliance Pass Rate</h3>
          <div className="kpi-value">{data.kpis.compliancePassRate.value}%</div>
          {renderTrend(data.kpis.compliancePassRate.trend)}
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container glass-container">
          <h3>Cashless Adoption Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.charts.cashlessAdoptionOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="adoption" name="Adoption %" stroke="#18459D" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-container glass-container">
          <h3>Revenue-Risk Incidents by Operator</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.charts.incidentsByOperator} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="operator" type="category" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="incidents" name="Incidents" fill="#FF5252" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="operator-comparison glass-container mt-4">
        <h3>Operator Comparison</h3>
        <div className="table-responsive">
          <table className="acm-table">
            <thead>
              <tr>
                <th>Operator</th>
                <th>Assessments</th>
                <th>Adoption %</th>
                <th>Health Score</th>
                <th>Pass Rate</th>
                <th>Avg Time (s)</th>
                <th>Incident Density</th>
              </tr>
            </thead>
            <tbody>
              {data.operatorComparison.map((op, i) => (
                <tr key={i}>
                  <td>{op.operator}</td>
                  <td>{op.assessmentCount}</td>
                  <td className={op.adoption < 75 ? 'text-danger' : ''}>{op.adoption}%</td>
                  <td>{op.healthScore}</td>
                  <td className={op.passRate < 90 ? 'text-danger' : ''}>{op.passRate}%</td>
                  <td>{op.avgTime}</td>
                  <td className={op.incidentDensity > 3 ? 'text-danger' : ''}>{op.incidentDensity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="mb-3">All Assessments</h3>
        <AssessmentList onViewDetail={onViewDetail} />
      </div>
    </div>
  );
};

export default DashboardOverview;
