const AssessmentModel = require('../models/assessmentModel');

const createAssessment = async (req, res, next) => {
  try {
    const id = await AssessmentModel.create(req.body);
    res.status(201).json({ message: 'Assessment saved successfully', id });
  } catch (error) {
    next(error);
  }
};

const getAssessments = async (req, res, next) => {
  try {
    const assessments = await AssessmentModel.findAll();
    
    // If user is a Viewer, redact Section F (Officer Interview)
    if (req.user && req.user.role === 'Viewer') {
      const redactedAssessments = assessments.map(assessment => {
        const {
          pos_issues_today,
          unsuccessful_transactions,
          network_interruption_freq,
          greatest_cause_of_delay,
          officer_suggestions,
          ...allowedData
        } = assessment;
        return allowedData;
      });
      return res.json(redactedAssessments);
    }

    res.json(assessments);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAssessment,
  getAssessments
};
