import pool from '../config/db.js';

// Helper to calculate percentage change
const calcTrend = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export const getKPIs = async (req, res, next) => {
  try {
    const { startDate, endDate, operator, area } = req.query;
    
    // Base WHERE clause
    let whereClause = 'WHERE 1=1';
    let queryParams = [];
    
    if (operator && operator !== 'all') {
      queryParams.push(operator);
      whereClause += ` AND bus_company = $${queryParams.length}`;
    }
    
    if (area && area !== 'all') {
      queryParams.push(area);
      whereClause += ` AND area = $${queryParams.length}`;
    }

    // 1. KPIs (Current Period)
    const kpiQuery = `
      SELECT 
        COUNT(*) as total_assessments,
        COALESCE(SUM(card_transactions + mm_transactions), 0) as total_cashless,
        COALESCE(SUM(card_transactions + mm_transactions + cash_transactions + other_transactions), 0) as total_transactions,
        COALESCE(SUM(incidents_failed_transactions + incidents_manual_tickets + incidents_duplicate_tickets), 0) as total_revenue_risks,
        COUNT(CASE WHEN overall_performance = 'Pass' OR eval_overall_satisfaction >= 4 THEN 1 END) as passed_assessments
      FROM assessments
      ${whereClause}
    `;
    
    // 1b. KPIs (Previous Period for Trend)
    // For simplicity without complex date logic in MVP, we'll assume the previous period is all records BEFORE the current period.
    // If no dates provided, trend is compared to 0.
    let prevWhereClause = 'WHERE 1=1';
    let prevParams = [];
    if (operator && operator !== 'all') { prevParams.push(operator); prevWhereClause += ` AND bus_company = $${prevParams.length}`; }
    if (area && area !== 'all') { prevParams.push(area); prevWhereClause += ` AND area = $${prevParams.length}`; }
    // Just a basic fallback for trend if no time filter is applied (compare to a week ago)
    prevWhereClause += ` AND assessment_date < CURRENT_DATE - INTERVAL '7 days'`;

    const prevKpiQuery = `
      SELECT 
        COUNT(*) as total_assessments,
        COALESCE(SUM(card_transactions + mm_transactions), 0) as total_cashless,
        COALESCE(SUM(card_transactions + mm_transactions + cash_transactions + other_transactions), 0) as total_transactions,
        COALESCE(SUM(incidents_failed_transactions + incidents_manual_tickets + incidents_duplicate_tickets), 0) as total_revenue_risks,
        COUNT(CASE WHEN overall_performance = 'Pass' OR eval_overall_satisfaction >= 4 THEN 1 END) as passed_assessments
      FROM assessments
      ${prevWhereClause}
    `;

    const [kpiResult, prevKpiResult] = await Promise.all([
      pool.query(kpiQuery, queryParams),
      pool.query(prevKpiQuery, prevParams)
    ]);
    
    const row = kpiResult.rows[0];
    const prevRow = prevKpiResult.rows[0];
    
    const totalAssessments = parseInt(row.total_assessments) || 0;
    const totalCashless = parseInt(row.total_cashless) || 0;
    const totalTransactions = parseInt(row.total_transactions) || 0;
    const totalRisks = parseInt(row.total_revenue_risks) || 0;
    const passedAssessments = parseInt(row.passed_assessments) || 0;

    const prevTotalAssessments = parseInt(prevRow.total_assessments) || 0;
    const prevTotalCashless = parseInt(prevRow.total_cashless) || 0;
    const prevTotalTransactions = parseInt(prevRow.total_transactions) || 0;
    const prevTotalRisks = parseInt(prevRow.total_revenue_risks) || 0;
    const prevPassedAssessments = parseInt(prevRow.passed_assessments) || 0;

    const cashlessAdoption = totalTransactions > 0 ? ((totalCashless / totalTransactions) * 100) : 0;
    const prevCashlessAdoption = prevTotalTransactions > 0 ? ((prevTotalCashless / prevTotalTransactions) * 100) : 0;
    
    const passRate = totalAssessments > 0 ? ((passedAssessments / totalAssessments) * 100) : 0;
    const prevPassRate = prevTotalAssessments > 0 ? ((prevPassedAssessments / prevTotalAssessments) * 100) : 0;

    const kpis = {
      cashlessAdoption: { 
        value: parseFloat(cashlessAdoption.toFixed(1)), 
        trend: parseFloat(calcTrend(cashlessAdoption, prevCashlessAdoption).toFixed(1))
      },
      assessments: { 
        value: totalAssessments, 
        trend: parseFloat(calcTrend(totalAssessments, prevTotalAssessments).toFixed(1))
      },
      revenueRiskIncidents: { 
        value: totalRisks, 
        trend: parseFloat(calcTrend(totalRisks, prevTotalRisks).toFixed(1)) 
      },
      compliancePassRate: { 
        value: parseFloat(passRate.toFixed(1)), 
        trend: parseFloat(calcTrend(passRate, prevPassRate).toFixed(1))
      }
    };

    // 2. Line Chart: Cashless Adoption Over Time
    const lineChartQuery = `
      SELECT 
        assessment_date as date,
        COALESCE(SUM(card_transactions + mm_transactions), 0) as cashless,
        COALESCE(SUM(card_transactions + mm_transactions + cash_transactions + other_transactions), 0) as total
      FROM assessments
      ${whereClause}
      GROUP BY assessment_date
      ORDER BY assessment_date ASC
      LIMIT 10
    `;
    const lineChartResult = await pool.query(lineChartQuery, queryParams);
    const cashlessAdoptionOverTime = lineChartResult.rows.map(r => ({
      date: r.date || 'Unknown',
      adoption: parseInt(r.total) > 0 ? Math.round((parseInt(r.cashless) / parseInt(r.total)) * 100) : 0
    }));

    // 3. Bar Chart: Incidents by Operator
    const barChartQuery = `
      SELECT 
        bus_company as operator,
        COALESCE(SUM(incidents_failed_transactions + incidents_manual_tickets + incidents_duplicate_tickets), 0) as incidents
      FROM assessments
      ${whereClause}
      GROUP BY bus_company
      ORDER BY incidents DESC
      LIMIT 5
    `;
    const barChartResult = await pool.query(barChartQuery, queryParams);
    const incidentsByOperator = barChartResult.rows.map(r => ({
      operator: r.operator || 'Unknown',
      incidents: parseInt(r.incidents)
    }));

    // 4. Operator Comparison Table
    const opQuery = `
      SELECT 
        bus_company as operator,
        COUNT(*) as assessmentCount,
        COALESCE(SUM(card_transactions + mm_transactions), 0) as cashless,
        COALESCE(SUM(card_transactions + mm_transactions + cash_transactions + other_transactions), 0) as total,
        AVG(eval_overall_satisfaction) as health,
        COUNT(CASE WHEN overall_performance = 'Pass' OR eval_overall_satisfaction >= 4 THEN 1 END) as passed,
        AVG(time_complete_transaction) as avgTime,
        COALESCE(SUM(incidents_failed_transactions + incidents_manual_tickets + incidents_duplicate_tickets), 0) as incidents
      FROM assessments
      ${whereClause}
      GROUP BY bus_company
    `;
    const opResult = await pool.query(opQuery, queryParams);
    
    const operatorComparison = opResult.rows.map(r => {
      const tot = parseInt(r.total) || 0;
      const count = parseInt(r.assessmentcount) || 0;
      return {
        operator: r.operator || 'Unknown',
        assessmentCount: count,
        adoption: tot > 0 ? Math.round((parseInt(r.cashless) / tot) * 100) : 0,
        healthScore: r.health ? Math.round((parseFloat(r.health) / 5) * 100) : 0,
        passRate: count > 0 ? Math.round((parseInt(r.passed) / count) * 100) : 0,
        avgTime: r.avgtime ? parseFloat(r.avgtime).toFixed(1) : 0,
        incidentDensity: count > 0 ? (parseInt(r.incidents) / count).toFixed(1) : 0
      };
    });

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

export const getIssues = async (req, res, next) => {
  try {
    const issuesQuery = `
      WITH IssueCounts AS (
        SELECT 
          id,
          assessment_date as date,
          bus_company as operator,
          area,
          assessor,
          section_c_remarks as owner,
          greatest_cause_of_delay as faileditem,
          COUNT(*) OVER(PARTITION BY bus_company, greatest_cause_of_delay) as count_30_days
        FROM assessments
        WHERE greatest_cause_of_delay IS NOT NULL AND greatest_cause_of_delay != ''
        AND assessment_date >= CURRENT_DATE - INTERVAL '30 days'
      )
      SELECT * FROM IssueCounts
      ORDER BY count_30_days DESC, id DESC
    `;
    const issuesResult = await pool.query(issuesQuery);
    
    const issues = issuesResult.rows.map(r => ({
      id: r.id,
      failedItem: r.faileditem || 'System Issue',
      operator: r.operator || 'Unknown',
      area: r.area || 'Unknown',
      date: r.date || 'Unknown',
      assessor: r.assessor || 'Unknown',
      status: 'open', // Mocked status since we don't have an issue tracker table yet
      owner: r.owner || 'IT Support',
      isRepeat: parseInt(r.count_30_days) >= 2
    }));
    
    res.json(issues);
  } catch (error) {
    next(error);
  }
};


