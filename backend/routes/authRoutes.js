import express from 'express';
const router = express.Router();
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { Resend } from 'resend';
import rateLimit from 'express-rate-limit';

const resend = new Resend(process.env.RESEND_API_KEY);

// Rate limiting for Magic Links (max 5 requests per hour per IP)
const magicLinkLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 5,
  message: { error: 'Too many requests from this IP, please try again after an hour' }
});

router.post('/magic-link', magicLinkLimiter, async (req, res) => {
  const { email } = req.body;

  if (!email || (!email.endsWith('@acgroup.rw') && !email.endsWith('@acmobility.com') && email !== 'b.ineza@alustudent.com')) {
    return res.status(403).json({ error: 'Access restricted to AC Mobility accounts' });
  }

  try {
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(200).json({ message: 'If that address is registered, a sign-in link is on its way.' });
    }

    const user = userResult.rows[0];

    // Invalidate old links for this user so only the newest works
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
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1).replace('.', ' ');

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: process.env.RESEND_FROM || 'onboarding@resend.dev',
        to: email,
        subject: "Your Dashboard Sign-in Link",
        text: `Hello,\n\nPlease use this link to access the platform:\n\n${magicLinkUrl}\n\nThis link will expire in 15 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 500px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #f7fbff; padding: 20px; text-align: center; border-bottom: 1px solid #e0e0e0;">
              <h2 style="color: #0056b3; margin: 0;">AC Mobility Dashboard</h2>
            </div>
            <div style="padding: 30px 20px;">
              <p style="font-size: 16px;">Hello ${formattedName},</p>
              <p style="font-size: 16px;">We received a request to sign in to the AC Mobility Analytics Dashboard. Click the secure button below to access your account instantly.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${magicLinkUrl}" style="background-color: #ffb800; color: #333; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-size: 16px; display: inline-block;">
                  Sign In to Dashboard
                </a>
              </div>
              
              <p style="font-size: 14px; color: #777;">This link is valid for exactly <strong>15 minutes</strong> and can only be used once.</p>
            </div>
            <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #999;">
              &copy; ${new Date().getFullYear()} AC Mobility. All rights reserved.
            </div>
          </div>
        `
      });
    } else {
      console.log('\n==== MAGIC LINK GENERATED ====');
      console.log(`URL: ${magicLinkUrl}`);
      console.log('==============================\n');
    }

    res.status(200).json({ message: 'If that address is registered, a sign-in link is on its way.' });
  } catch (error) {
    res.status(500).json({ error: String(error), stack: error.stack || 'No stack' });
  }
});

router.post('/verify', async (req, res) => {
  const { email, token } = req.body;

  try {
    const userResult = await pool.query('SELECT id, role FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired link' });
    }
    const user = userResult.rows[0];

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Ensure the link exists, is not expired, AND has not been used yet
    const linkResult = await pool.query(
      'SELECT id FROM magic_links WHERE user_id = $1 AND token_hash = $2 AND expires_at > NOW() AND used = FALSE',
      [user.id, tokenHash]
    );

    if (linkResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired link' });
    }

    // Mark the link as used so it cannot be used again
    await pool.query('UPDATE magic_links SET used = TRUE WHERE id = $1', [linkResult.rows[0].id]);

    const sessionToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'supersecretacmobility',
      { expiresIn: '8h' }
    );

    res.cookie('acm_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000 // 8 hours
    });

    res.status(200).json({ message: 'Authentication successful', role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('acm_session');
  res.status(200).json({ message: 'Logged out successfully' });
});

export default router;
