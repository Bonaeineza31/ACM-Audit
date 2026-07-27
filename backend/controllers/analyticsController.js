import AssessmentModel from '../models/assessmentModel.js';

const calcTrend = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export const getKPIs = async (req, res, next) => {
  try {
    const { startDate, endDate, operator, area } = req.query;
    
    let match = {};
    if (operator && operator !== 'all') match.bus_company = operator;
    if (area && area !== 'all') match.area = area;

    const kpiPipeline = [
      { $match: match },
      {
        $group: {
          _id: null,
          total_assessments: { $sum: 1 },
          total_cashless: { $sum: { $add: [{ $ifNull: ["$card_transactions", 0] }, { $ifNull: ["$mm_transactions", 0] }] } },
          total_transactions: { $sum: { $add: [{ $ifNull: ["$card_transactions", 0] }, { $ifNull: ["$mm_transactions", 0] }, { $ifNull: ["$cash_transactions", 0] }, { $ifNull: ["$other_transactions", 0] }] } },
          total_revenue_risks: { $sum: { $add: [{ $ifNull: ["$incidents_failed_transactions", 0] }, { $ifNull: ["$incidents_manual_tickets", 0] }, { $ifNull: ["$incidents_duplicate_tickets", 0] }] } },
          passed_assessments: {
            $sum: {
              $cond: [{ $or: [{ $eq: ["$overall_performance", "Pass"] }, { $gte: ["$eval_overall_satisfaction", 4] }] }, 1, 0]
            }
          }
        }
      }
    ];

    let prevMatch = { ...match };
    // Basic fallback: 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    prevMatch.createdAt = { $lt: sevenDaysAgo };

    const prevKpiPipeline = [
      { $match: prevMatch },
      {
        $group: {
          _id: null,
          total_assessments: { $sum: 1 },
          total_cashless: { $sum: { $add: [{ $ifNull: ["$card_transactions", 0] }, { $ifNull: ["$mm_transactions", 0] }] } },
          total_transactions: { $sum: { $add: [{ $ifNull: ["$card_transactions", 0] }, { $ifNull: ["$mm_transactions", 0] }, { $ifNull: ["$cash_transactions", 0] }, { $ifNull: ["$other_transactions", 0] }] } },
          total_revenue_risks: { $sum: { $add: [{ $ifNull: ["$incidents_failed_transactions", 0] }, { $ifNull: ["$incidents_manual_tickets", 0] }, { $ifNull: ["$incidents_duplicate_tickets", 0] }] } },
          passed_assessments: {
            $sum: {
              $cond: [{ $or: [{ $eq: ["$overall_performance", "Pass"] }, { $gte: ["$eval_overall_satisfaction", 4] }] }, 1, 0]
            }
          }
        }
      }
    ];

    const [kpiResult, prevKpiResult] = await Promise.all([
      AssessmentModel.aggregate(kpiPipeline),
      AssessmentModel.aggregate(prevKpiPipeline)
    ]);
    
    const row = kpiResult[0] || {};
    const prevRow = prevKpiResult[0] || {};
    
    const totalAssessments = row.total_assessments || 0;
    const totalCashless = row.total_cashless || 0;
    const totalTransactions = row.total_transactions || 0;
    const totalRisks = row.total_revenue_risks || 0;
    const passedAssessments = row.passed_assessments || 0;

    const prevTotalAssessments = prevRow.total_assessments || 0;
    const prevTotalCashless = prevRow.total_cashless || 0;
    const prevTotalTransactions = prevRow.total_transactions || 0;
    const prevTotalRisks = prevRow.total_revenue_risks || 0;
    const prevPassedAssessments = prevRow.passed_assessments || 0;

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
    const lineChartPipeline = [
      { $match: match },
      {
        $group: {
          _id: "$assessment_date",
          cashless: { $sum: { $add: [{ $ifNull: ["$card_transactions", 0] }, { $ifNull: ["$mm_transactions", 0] }] } },
          total: { $sum: { $add: [{ $ifNull: ["$card_transactions", 0] }, { $ifNull: ["$mm_transactions", 0] }, { $ifNull: ["$cash_transactions", 0] }, { $ifNull: ["$other_transactions", 0] }] } }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 10 }
    ];
    
    const lineChartResult = await AssessmentModel.aggregate(lineChartPipeline);
    const cashlessAdoptionOverTime = lineChartResult.map(r => ({
      date: r._id || 'Unknown',
      adoption: r.total > 0 ? Math.round((r.cashless / r.total) * 100) : 0
    }));

    // 3. Bar Chart: Incidents by Operator
    const barChartPipeline = [
      { $match: match },
      {
        $group: {
          _id: "$bus_company",
          incidents: { $sum: { $add: [{ $ifNull: ["$incidents_failed_transactions", 0] }, { $ifNull: ["$incidents_manual_tickets", 0] }, { $ifNull: ["$incidents_duplicate_tickets", 0] }] } }
        }
      },
      { $sort: { incidents: -1 } },
      { $limit: 5 }
    ];
    
    const barChartResult = await AssessmentModel.aggregate(barChartPipeline);
    const incidentsByOperator = barChartResult.map(r => ({
      operator: r._id || 'Unknown',
      incidents: r.incidents
    }));

    // 4. Operator Comparison Table
    const opPipeline = [
      { $match: match },
      {
        $group: {
          _id: "$bus_company",
          assessmentCount: { $sum: 1 },
          cashless: { $sum: { $add: [{ $ifNull: ["$card_transactions", 0] }, { $ifNull: ["$mm_transactions", 0] }] } },
          total: { $sum: { $add: [{ $ifNull: ["$card_transactions", 0] }, { $ifNull: ["$mm_transactions", 0] }, { $ifNull: ["$cash_transactions", 0] }, { $ifNull: ["$other_transactions", 0] }] } },
          healthSum: { $sum: { $ifNull: ["$eval_overall_satisfaction", 0] } },
          passed: {
            $sum: {
              $cond: [{ $or: [{ $eq: ["$overall_performance", "Pass"] }, { $gte: ["$eval_overall_satisfaction", 4] }] }, 1, 0]
            }
          },
          avgTime: { $avg: { $ifNull: ["$time_complete_transaction", 0] } },
          incidents: { $sum: { $add: [{ $ifNull: ["$incidents_failed_transactions", 0] }, { $ifNull: ["$incidents_manual_tickets", 0] }, { $ifNull: ["$incidents_duplicate_tickets", 0] }] } }
        }
      }
    ];
    
    const opResult = await AssessmentModel.aggregate(opPipeline);
    const operatorComparison = opResult.map(r => {
      const tot = r.total || 0;
      const count = r.assessmentCount || 0;
      const healthAvg = count > 0 ? (r.healthSum / count) : 0;
      
      return {
        operator: r._id || 'Unknown',
        assessmentCount: count,
        adoption: tot > 0 ? Math.round((r.cashless / tot) * 100) : 0,
        healthScore: healthAvg ? Math.round((healthAvg / 5) * 100) : 0,
        passRate: count > 0 ? Math.round((r.passed / count) * 100) : 0,
        avgTime: r.avgTime ? r.avgTime.toFixed(1) : 0,
        incidentDensity: count > 0 ? (r.incidents / count).toFixed(1) : 0
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
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const issuesPipeline = [
      {
        $match: {
          greatest_cause_of_delay: { $exists: true, $ne: null, $ne: "" },
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $project: {
          _id: 1,
          assessment_date: 1,
          bus_company: 1,
          area: 1,
          assessor: 1,
          section_c_remarks: 1,
          greatest_cause_of_delay: 1,
        }
      },
      { $sort: { createdAt: -1 } }
    ];
    
    // In MongoDB we can't easily do OVER(PARTITION) inline like SQL, 
    // so we'll just fetch them and flag repeats in code for simplicity
    const issuesResult = await AssessmentModel.aggregate(issuesPipeline);
    
    // Count occurrences for repeats
    const counts = {};
    issuesResult.forEach(r => {
      const key = `${r.bus_company}-${r.greatest_cause_of_delay}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    
    const issues = issuesResult.map(r => {
      const key = `${r.bus_company}-${r.greatest_cause_of_delay}`;
      return {
        id: r._id,
        failedItem: r.greatest_cause_of_delay || 'System Issue',
        operator: r.bus_company || 'Unknown',
        area: r.area || 'Unknown',
        date: r.assessment_date || 'Unknown',
        assessor: r.assessor || 'Unknown',
        status: 'open',
        owner: r.section_c_remarks || 'IT Support',
        isRepeat: counts[key] >= 2
      };
    });
    
    res.json(issues);
  } catch (error) {
    next(error);
  }
};
