import './App.css';
import LandingPage from './pages/LandingPage';
import ProductsPage from './pages/ProductsPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderCompletedPage from './pages/OrderCompletedPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Dashboard from './pages/Dashboard';

function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';

  if (path.startsWith('/dashboard')) {
    return <Dashboard />;
  }

  if (path === '/products') {
    return <ProductsPage />;
  }

  if (path.startsWith('/checkout')) {
    return <CheckoutPage />;
  }

  if (path.startsWith('/order-completed')) {
    return <OrderCompletedPage />;
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
