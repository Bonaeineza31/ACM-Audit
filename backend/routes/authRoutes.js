const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

router.post('/magic-link', async (req, res) => {
  let { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }
  
  email = email.trim().toLowerCase();

  if (!email.endsWith('@acgroup.rw') && !email.endsWith('@acmobility.com')) {
    return res.status(400).json({ error: 'Invalid domain. Please use your AC Mobility email.' });
  }

  try {
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(200).json({ message: 'If that address is registered, a sign-in link is on its way.' });
    }

    const user = userResult.rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await pool.query(
      "INSERT INTO magic_links (user_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '1 hour')",
      [user.id, tokenHash]
    );

    const magicLinkUrl = `http://localhost:5173/?token=${token}&email=${encodeURIComponent(email)}`;

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail({
        from: `"AC Mobility Admin" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Your Admin Dashboard Sign-in Link",
        text: `Hello,\n\nHere is your secure sign-in link for the AC Mobility Field Assessment Tool:\n\n${magicLinkUrl}\n\nThis link will expire in 1 hour.`,
        html: `<h3>Hello,</h3><p>Here is your secure sign-in link for the AC Mobility Field Assessment Tool:</p><p><a href="${magicLinkUrl}" style="padding: 10px 20px; background-color: #18459D; color: white; text-decoration: none; border-radius: 5px;">Sign In Now</a></p><p>Or copy this link: <br> ${magicLinkUrl}</p><p>This link will expire in 1 hour.</p>`
      });
      console.log(`==== EMAIL SENT TO ${email} ====`);
    } else {
      console.log('\n==== MAGIC LINK GENERATED ====');
      console.log(`User: ${email}`);
      console.log(`Link: ${magicLinkUrl}`);
      console.log('==============================\n');
    }

    res.status(200).json({ message: 'If that address is registered, a sign-in link is on its way.' });
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
