const pool = require('../config/db');

// Helper to calculate percentage change
const calcTrend = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

const getKPIs = async (req, res, next) => {
  try {
    const { startDate, endDate, operator, area } = req.query;
    
    // For MVP, we will just return mock KPIs that match the PRD until we build out the full complex SQL queries
    // This allows the frontend to be built immediately.
    const kpis = {
      cashlessAdoption: { value: 78.5, trend: 2.1 },
      assessments: { value: 142, trend: 15 },
      revenueRiskIncidents: { value: 12, trend: -5 },
      compliancePassRate: { value: 92.3, trend: 1.2 }
    };

    // Mock Line Chart Data
    const cashlessAdoptionOverTime = [
      { date: '2026-07-01', adoption: 70 },
      { date: '2026-07-08', adoption: 72 },
      { date: '2026-07-15', adoption: 75 },
      { date: '2026-07-22', adoption: 78.5 }
    ];

    // Mock Bar Chart Data
    const incidentsByOperator = [
      { operator: 'Kigali Bus Services', incidents: 8 },
      { operator: 'Royal Express', incidents: 3 },
      { operator: 'Kigali Safaris', incidents: 1 }
    ];

    // Mock Operator Comparison
    const operatorComparison = [
      { operator: 'Kigali Bus Services', adoption: 80, healthScore: 95, passRate: 90, avgTime: 12, incidentDensity: 2.5, assessmentCount: 80 },
      { operator: 'Royal Express', adoption: 75, healthScore: 88, passRate: 85, avgTime: 15, incidentDensity: 4.2, assessmentCount: 45 },
      { operator: 'Kigali Safaris', adoption: 72, healthScore: 92, passRate: 88, avgTime: 14, incidentDensity: 3.1, assessmentCount: 17 }
    ];

    res.json({
      kpis,
      charts: {
        cashlessAdoptionOverTime,
        incidentsByOperator
      },
      operatorComparison
    });
  } catch (error) {
    next(error);
  }
};

const getIssues = async (req, res, next) => {
  try {
    // Mock Issue Register
    const issues = [
      { id: 1, failedItem: 'Network Connectivity (Score: 1)', operator: 'Kigali Bus Services', area: 'Nyabugogo', date: '2026-07-22', assessor: 'bonae', status: 'open', owner: 'IT Support' },
      { id: 2, failedItem: 'Printer Not Functioning', operator: 'Royal Express', area: 'Remera', date: '2026-07-21', assessor: 'ineza', status: 'acknowledged', owner: 'Maintenance' },
      { id: 3, failedItem: 'Repeat Flag: Battery Performance', operator: 'Kigali Safaris', area: 'Downtown', date: '2026-07-20', assessor: 'bonae', status: 'resolved', owner: 'Hardware Team' }
    ];
    
    res.json(issues);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getKPIs,
  getIssues
};
