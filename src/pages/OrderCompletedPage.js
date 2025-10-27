import { useMemo } from 'react';
import useLandingContent from '../hooks/useLandingContent';
import { BrandingStrip, FooterSection } from '../components/landing';
import StripeCheckoutReturn from '../components/StripeCheckoutReturn';
import './OrderCompletedPage.css';

function OrderCompletedPage() {
  const { content, isLoading, error } = useLandingContent();
  const sessionId = useMemo(() => {
    return new URLSearchParams(window.location.search).get('session_id') || '';
  }, []);

  const apiBase = useMemo(() => {
    const configured = process.env.REACT_APP_API_BASE_URL ? process.env.REACT_APP_API_BASE_URL.trim() : '';
    if (configured) {
      return configured.replace(/\/$/, '');
    }

    return process.env.REACT_APP_API_ROUTE_PREFIX?.replace(/\/$/, '') || '/api';
  }, []);

  if (isLoading) {
    return (
      <main className="order-completed-page" data-landing-root>
        <BrandingStrip branding={content?.branding} />
        <div className="order-completed-page__status">Confirming your order…</div>
        <FooterSection footer={content?.footer} />
      </main>
    );
  }

  if (error) {
    return (
      <main className="order-completed-page" data-landing-root>
        <BrandingStrip branding={content?.branding} />
        <div className="order-completed-page__status order-completed-page__status--error">
          Unable to load confirmation details.
        </div>
        <FooterSection footer={content?.footer} />
      </main>
    );
  }

  const checkout = content?.checkout;

  if (!sessionId) {
    return (
      <main className="order-completed-page" data-landing-root>
        <BrandingStrip branding={content?.branding} />
        <div className="order-completed-page__status order-completed-page__status--error">
          Missing order reference. Please check your confirmation email.
        </div>
        <FooterSection footer={content?.footer} />
      </main>
    );
  }

  return (
    <main className="order-completed-page" data-landing-root>
      <BrandingStrip branding={content?.branding} />
      <section className="order-completed-page__content">
        <StripeCheckoutReturn
          sessionId={sessionId}
          apiBase={apiBase}
          thankYou={checkout?.thankYou}
        />
      </section>
      <FooterSection footer={content?.footer} />
    </main>
  );
}

export default OrderCompletedPage;
