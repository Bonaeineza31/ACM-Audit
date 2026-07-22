import { useState } from 'react';
import './App.css';
import AssessmentForm from './components/AssessmentForm';
import AssessmentList from './components/AssessmentList';

function App() {
  // view state: 'landing', 'auditForm', 'viewData'
  const [currentView, setCurrentView] = useState('landing');

  const renderContent = () => {
    switch (currentView) {
      case 'auditForm':
        return (
          <div className="animate-fade-in">
            <button className="btn btn-secondary mb-2" onClick={() => setCurrentView('landing')}>
              &larr; Back to Home
            </button>
            <AssessmentForm />
          </div>
        );
      case 'viewData':
        return (
          <div className="animate-fade-in">
            <button className="btn btn-secondary mb-2" onClick={() => setCurrentView('landing')}>
              &larr; Back to Home
            </button>
            <AssessmentList />
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
          {/* Logo implementation: If the user saves the image to src/assets, this will load it */}
          {/* We're using an img tag with an error fallback to the text logo if the image isn't found yet */}
          <img 
            src="/src/assets/acmobility_full.png" 
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
