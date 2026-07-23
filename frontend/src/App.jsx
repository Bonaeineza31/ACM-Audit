import { useState, useEffect } from 'react';
import './App.css';
import AssessmentForm from './components/AssessmentForm';
import DashboardOverview from './components/DashboardOverview';
import IssueRegister from './components/IssueRegister';
import AssessmentDetail from './components/AssessmentDetail';
import Login from './components/Login';
import acmobilityLogo from './assets/acmobility_full.png';

function App() {
  // view state: 'landing', 'auditForm', 'viewData'
  const [currentView, setCurrentView] = useState('landing');
  const [dashboardView, setDashboardView] = useState('overview');
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  
  // The actual security is the HttpOnly cookie, this is just a UI flag
  const [authToken, setAuthToken] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [verifying, setVerifying] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const email = urlParams.get('email');

    if (token && email) {
      verifyMagicLink(token, email);
    }
  }, []);

  const verifyMagicLink = async (token, email) => {
    setVerifying(true);
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAuthToken(true);
        localStorage.setItem('isLoggedIn', 'true');
        setCurrentView('viewData');
        // Clean URL
        window.history.replaceState({}, document.title, '/');
      } else {
        setAuthError(data.error || 'Invalid or expired link.');
      }
    } catch (err) {
      setAuthError('Connection error.');
    } finally {
      setVerifying(false);
    }
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
    setSelectedAssessment(null);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch(e) {}
    setAuthToken(false);
    localStorage.removeItem('isLoggedIn');
    handleNavigate('landing');
  };

  const renderContent = () => {
    if (verifying) {
      return (
        <div className="glass-container text-center p-5 animate-fade-in">
          <h2>Authenticating...</h2>
          <p>Please wait while we verify your magic link.</p>
        </div>
      );
    }

    if (authError) {
      return (
        <div className="glass-container text-center p-5 animate-fade-in">
          <h2>Authentication Failed</h2>
          <p className="alert error">{authError}</p>
          <button className="btn btn-primary mt-3" onClick={() => { setAuthError(''); handleNavigate('landing'); }}>
            Return to Home
          </button>
        </div>
      );
    }

    switch (currentView) {
      case 'auditForm':
        return (
          <div className="animate-fade-in">
            <button className="btn btn-secondary mb-2" onClick={() => handleNavigate('landing')}>
              &larr; Back to Home
            </button>
            <AssessmentForm />
          </div>
        );
      case 'viewData':
        if (!authToken) {
          return (
            <Login onCancel={() => handleNavigate('landing')} />
          );
        }

        if (selectedAssessment) {
          return (
            <div className="animate-fade-in">
              <AssessmentDetail 
                assessment={selectedAssessment} 
                onClose={() => setSelectedAssessment(null)}
              />
            </div>
          );
        }

        return (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" onClick={() => handleNavigate('landing')}>
                  &larr; Back to Home
                </button>
                <button 
                  className={`btn ${dashboardView === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setDashboardView('overview')}
                >
                  Overview
                </button>
                <button 
                  className={`btn ${dashboardView === 'issues' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setDashboardView('issues')}
                >
                  Issue Register
                </button>
              </div>
              <button className="btn btn-secondary" style={{ color: 'red' }} onClick={handleLogout}>
                Logout
              </button>
            </div>
            {dashboardView === 'overview' ? (
              <DashboardOverview onViewDetail={setSelectedAssessment} />
            ) : (
              <IssueRegister />
            )}
          </div>
        );
      case 'landing':
      default:
        return (
          <div className="landing-page glass-container animate-fade-in">
            <h2>Welcome to the Audit Dashboard</h2>
            <p className="landing-subtitle">
              Select an option below to start a new field assessment or view past reports.
            </p>
            <div className="landing-actions">
              <button className="btn btn-primary btn-large" onClick={() => setCurrentView('auditForm')}>
                Start Auditing
              </button>
              <button className="btn btn-secondary btn-large" onClick={() => setCurrentView('viewData')}>
                View Data
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-container">
          <img 
            src={acmobilityLogo} 
            alt="AC Mobility Logo" 
            className="brand-logo"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="logo text-logo-fallback" style={{ display: 'none' }}>
            <span className="logo-icon">≡</span> ac<span className="font-light">mobility</span>
          </div>
        </div>
        <h1>Field Assessment Tool</h1>
      </header>
      
      <main className="main-content">
        {renderContent()}
      </main>
      
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} AC Mobility. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
