import AssessmentModel from '../models/assessmentModel.js';

export const createAssessment = async (req, res, next) => {
  try {
    const newAssessment = await AssessmentModel.create(req.body);
    res.status(201).json({ message: 'Assessment created successfully', data: newAssessment });
  } catch (error) {
    next(error);
  }
};

export const getAssessments = async (req, res, next) => {
  try {
    // Prevent Vercel from caching the response
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const assessments = await AssessmentModel.findAll();
    
    // Privacy feature: Strip section F if user is Viewer
    if (req.user && req.user.role === 'Viewer') {
      const sanitized = assessments.map(a => {
        const copy = { ...a };
        delete copy.pos_issues_today;
        delete copy.unsuccessful_transactions;
        delete copy.network_interruption_freq;
        delete copy.greatest_cause_of_delay;
        delete copy.officer_suggestions;
        return copy;
      });
      return res.json(sanitized);
    }
    
    res.json(assessments);
  } catch (error) {
    next(error);
  }
};
