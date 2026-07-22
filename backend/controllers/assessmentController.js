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
    res.json(assessments);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAssessment,
  getAssessments
};
