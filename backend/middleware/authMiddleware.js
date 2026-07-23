const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const requireAuth = async (req, res, next) => {
  const token = req.cookies.acm_session;
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No session token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretacmobility');
    const userResult = await pool.query('SELECT id, email, role FROM users WHERE id = $1', [decoded.userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Unauthorized: Invalid user' });
    }
    
    // Attach user to request for downstream controllers
    req.user = userResult.rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid session token' });
  }
};

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

module.exports = { requireAuth, requireRole };
