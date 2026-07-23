import { useState } from 'react';
import './App.css';
import AssessmentForm from './components/AssessmentForm';
import AssessmentList from './components/AssessmentList';
import AssessmentDetail from './components/AssessmentDetail';
import Login from './components/Login';
import acmobilityLogo from './assets/acmobility_full.png';

function App() {
  // view state: 'landing', 'auditForm', 'viewData'
  const [currentView, setCurrentView] = useState('landing');
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem('adminToken'));

  const handleNavigate = (view) => {
    setCurrentView(view);
    setSelectedAssessment(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setAuthToken(null);
    handleNavigate('landing');
  };

  const renderContent = () => {
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
            <Login 
              onLoginSuccess={(token) => {
                localStorage.setItem('adminToken', token);
                setAuthToken(token);
              }} 
              onCancel={() => handleNavigate('landing')} 
            />
          );
        }

        if (selectedAssessment) {
          return (
            <div className="animate-fade-in">
              <AssessmentDetail 
                assessment={selectedAssessment} 
                onBack={() => setSelectedAssessment(null)} 
              />
            </div>
          );
        }
        return (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => handleNavigate('landing')}>
                &larr; Back to Home
              </button>
              <button className="btn btn-secondary" onClick={handleLogout}>
                Logout
              </button>
            </div>
            <AssessmentList onViewDetail={setSelectedAssessment} />
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
