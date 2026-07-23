const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const pool = require('../config/db');

// Rate limiter: 5 requests per hour
const magicLinkLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many requests from this IP, please try again after an hour' }
});

router.post('/magic-link', magicLinkLimiter, async (req, res) => {
  let { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }
  
  email = email.trim().toLowerCase();

  if (!email.endsWith('@acgroup.rw') && !email.endsWith('@acmobility.com')) {
    return res.status(400).json({ error: 'Invalid domain. Please use your AC Mobility email.' });
  }

  const genericResponse = { message: 'If that address is registered, a sign-in link is on its way. It expires in 15 minutes.' };

  try {
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.json(genericResponse);
    }

    const userId = userResult.rows[0].id;

    // Invalidate previous outstanding links for this user
    await pool.query('UPDATE magic_links SET used = TRUE WHERE user_id = $1 AND used = FALSE', [userId]);

    // Generate crypto token
    const token = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(
      'INSERT INTO magic_links (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [userId, hash, expiresAt]
    );

    const magicLink = `http://localhost:5173/verify?token=${token}&email=${encodeURIComponent(email)}`;
    console.log(`\n\n==== MAGIC LINK GENERATED ====\nUser: ${email}\nLink: ${magicLink}\n==============================\n\n`);

    return res.json(genericResponse);
  } catch (error) {
    console.error('Magic link error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/verify', async (req, res) => {
  const { token, email } = req.body;

  if (!token || !email) {
    return res.status(400).json({ error: 'Missing token or email' });
  }

  try {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Check if token exists, is valid, and matches email
    const linkResult = await pool.query(`
      SELECT m.id, m.user_id, u.role
      FROM magic_links m
      JOIN users u ON m.user_id = u.id
      WHERE m.token_hash = $1 AND u.email = $2 AND m.used = FALSE AND m.expires_at > NOW()
    `, [hash, email]);

    if (linkResult.rows.length === 0) {
      return res.status(401).json({ error: 'Expired or invalid link' });
    }

    const { id, user_id, role } = linkResult.rows[0];

    // Invalidate token
    await pool.query('UPDATE magic_links SET used = TRUE WHERE id = $1', [id]);

    // Create session token (expires in 7 days)
    const sessionToken = jwt.sign({ userId: user_id }, process.env.JWT_SECRET || 'supersecretacmobility', { expiresIn: '7d' });

    res.cookie('acm_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ success: true, role });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('acm_session');
  res.json({ success: true });
});

module.exports = router;
