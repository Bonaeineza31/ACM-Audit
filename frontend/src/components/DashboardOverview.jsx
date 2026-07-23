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
      if (res.status === 401) {
        localStorage.removeItem('isLoggedIn');
        window.location.reload();
        return;
      }
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

      {data.kpis.assessments.value === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', marginTop: '2rem' }}>
          <h2 style={{ color: '#18459D', marginBottom: '1rem' }}>No assessments in this period</h2>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>There is no data available for the selected filters. Try widening your date range or selecting a different operator/area.</p>
        </div>
      ) : (
        <>
          <div className="kpi-grid">
            <div className="kpi-card glass-container">
              <h3>Cashless Adoption</h3>
              <div className="kpi-value">{data.kpis.cashlessAdoption.value}%</div>
              <div className={`kpi-trend ${data.kpis.cashlessAdoption.trend >= 0 ? 'trend-up' : 'trend-down'}`}>
                {data.kpis.cashlessAdoption.trend >= 0 ? '↑' : '↓'} {Math.abs(data.kpis.cashlessAdoption.trend)}%
              </div>
            </div>
            <div className="kpi-card glass-container">
              <h3>Assessments</h3>
              <div className="kpi-value">{data.kpis.assessments.value}</div>
              <div className={`kpi-trend ${data.kpis.assessments.trend >= 0 ? 'trend-up' : 'trend-down'}`}>
                {data.kpis.assessments.trend >= 0 ? '↑' : '↓'} {Math.abs(data.kpis.assessments.trend)}%
              </div>
            </div>
            <div className="kpi-card glass-container">
              <h3>Revenue-Risk Incidents</h3>
              <div className="kpi-value text-danger">{data.kpis.revenueRiskIncidents.value}</div>
              <div className={`kpi-trend ${data.kpis.revenueRiskIncidents.trend <= 0 ? 'trend-up' : 'trend-down'}`}>
                {data.kpis.revenueRiskIncidents.trend <= 0 ? '↓' : '↑'} {Math.abs(data.kpis.revenueRiskIncidents.trend)}%
              </div>
            </div>
            <div className="kpi-card glass-container">
              <h3>Compliance Pass Rate</h3>
              <div className="kpi-value">{data.kpis.compliancePassRate.value}%</div>
              <div className={`kpi-trend ${data.kpis.compliancePassRate.trend >= 0 ? 'trend-up' : 'trend-down'}`}>
                {data.kpis.compliancePassRate.trend >= 0 ? '↑' : '↓'} {Math.abs(data.kpis.compliancePassRate.trend)}%
              </div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="card chart-container glass-container">
              <h3>Cashless Adoption Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.charts.cashlessAdoptionOverTime}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis unit="%" />
                  <Tooltip />
                  <Line type="monotone" dataKey="adoption" stroke="#18459D" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="card chart-container glass-container">
              <h3>Revenue-Risk Incidents by Operator</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.charts.incidentsByOperator}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="operator" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="incidents" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card table-container glass-container mt-4">
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
                  {data.operatorComparison.map((op, idx) => (
                    <tr key={idx}>
                      <td>{op.operator}</td>
                      <td>{op.assessmentCount}</td>
                      <td className={op.adoption < 75 ? 'text-danger' : ''}>{op.adoption}%</td>
                      <td className={op.healthScore < 80 ? 'text-danger' : ''}>{op.healthScore}</td>
                      <td className={op.passRate < 90 ? 'text-danger' : ''}>{op.passRate}%</td>
                      <td>{op.avgTime}</td>
                      <td className={op.incidentDensity > 3 ? 'text-danger' : ''}>{op.incidentDensity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      
      <div className="mt-4">
        <h3 className="mb-3">All Assessments</h3>
        <AssessmentList onViewDetail={onViewDetail} />
      </div>
    </div>
  );
};

export default DashboardOverview;
