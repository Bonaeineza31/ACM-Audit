const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (password === adminPassword) {
    // Generate token
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
    return res.json({ token });
  } else {
    return res.status(401).json({ error: 'Invalid password' });
  }
});

module.exports = router;
