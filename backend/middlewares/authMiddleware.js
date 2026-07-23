const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.acm_session;
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No session cookie provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretacmobility');
    
    // Resolve role server-side on every request
    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [decoded.userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    const role = userResult.rows[0].role;
    if (role !== 'Viewer') {
      return res.status(403).json({ error: 'Forbidden: Viewer access required' });
    }

    req.user = { userId: decoded.userId, role };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
  }
};

module.exports = authMiddleware;
