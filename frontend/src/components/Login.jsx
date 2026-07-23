import React, { useState } from 'react';
import './Login.css';

const Login = ({ onCancel }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      // PRD: Show the same message regardless of whether it's valid or not
      setMessage(data.message || data.error || 'If that address is registered, a sign-in link is on its way. It expires in 15 minutes.');
    } catch (err) {
      setMessage('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container glass-container animate-fade-in">
      <div className="login-header">
        <h2>Admin Login</h2>
        <p>Enter your AC Mobility email. We'll send you a sign-in link.</p>
      </div>

      {!message ? (
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              placeholder="name@acmobility.com or name@acgroup.rw"
              autoFocus
              required
            />
          </div>

          <div className="login-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || !email}>
              {loading ? 'Sending...' : 'Send Link'}
            </button>
          </div>
        </form>
      ) : (
        <div className="alert success text-center">
          <p>{message}</p>
          <button className="btn btn-secondary mt-3" onClick={onCancel}>Return to Home</button>
        </div>
      )}
    </div>
  );
};

export default Login;
