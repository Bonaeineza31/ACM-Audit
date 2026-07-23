const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');

// Rate limiter: 5 requests per hour
const magicLinkLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many requests from this IP, please try again after an hour' }
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
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

  try {
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(200).json({ message: 'If that address is registered, a sign-in link is on its way.' });
    }

    const user = userResult.rows[0];
    
    // Invalidate previous outstanding links for this user
    await pool.query('UPDATE magic_links SET used = TRUE WHERE user_id = $1 AND used = FALSE', [user.id]);

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await pool.query(
      "INSERT INTO magic_links (user_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '15 minutes')",
      [user.id, tokenHash]
    );

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const magicLinkUrl = `${baseUrl}/?token=${token}&email=${encodeURIComponent(email)}`;
    
    // Extract name from email (e.g. bonae@acgroup.rw -> Bonae)
    const namePart = email.split('@')[0];
    const userName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    // Try to send real email if SMTP is configured, otherwise fallback to console
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail({
        from: `"AC Mobility Admin" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Secure Sign-in Link - AC Mobility",
        text: `Hello ${userName},\n\nPlease use this link to access the AC Mobility Field Assessment Tool:\n\n${magicLinkUrl}\n\nThis link will expire in 15 minutes.`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 30px; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #18459D; margin: 0; font-size: 24px;">AC Mobility</h2>
              <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Field Assessment Tool</p>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <h3 style="color: #333; margin-top: 0;">Hello ${userName},</h3>
              <p style="color: #555; line-height: 1.6;">You requested a secure magic link to access the platform. Click the button below to sign in instantly.</p>
              
              <div style="text-align: center; margin: 35px 0;">
                <a href="${magicLinkUrl}" style="background-color: #18459D; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Access Dashboard</a>
              </div>
              
              <p style="color: #777; font-size: 13px; line-height: 1.5; margin-bottom: 0;">
                If the button doesn't work, you can copy and paste this link into your browser:<br>
                <a href="${magicLinkUrl}" style="color: #18459D; word-break: break-all;">${magicLinkUrl}</a>
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>This link is for your account only and will expire in 15 minutes.</p>
              <p>&copy; ${new Date().getFullYear()} AC Mobility. All rights reserved.</p>
            </div>
          </div>
        `
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
