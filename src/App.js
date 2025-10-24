import './App.css';
import LandingPage from './pages/LandingPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Dashboard from './pages/Dashboard';

function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';

  if (path.startsWith('/dashboard')) {
    return <Dashboard />;
  }

  if (path === '/privacy-policy') {
    return <PrivacyPolicy />;
  }

  if (path === '/terms-of-service') {
    return <TermsOfService />;
  }

  return <LandingPage />;
}

export default App;
