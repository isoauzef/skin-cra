import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import StripeCheckoutContainer from '../StripeCheckoutContainer';

const CheckoutSection = forwardRef(function CheckoutSection({ checkout }, ref) {
  if (!checkout) {
    return null;
  }

  return (
    <section
      ref={ref}
      className="checkout-inline"
      id="checkout-section"
      data-landing-part="checkout"
    >
      <div className="checkout-inline__inner">
        <div className="checkout-inline__header">
          {checkout.title ? <h2>{checkout.title}</h2> : null}
          {checkout.subtitle ? <p>{checkout.subtitle}</p> : null}
        </div>
        <StripeCheckoutContainer checkout={checkout} displayMode="inline" />
      </div>
    </section>
  );
});

CheckoutSection.propTypes = {
  checkout: PropTypes.shape({
    title: PropTypes.string,
    subtitle: PropTypes.string,
  }),
};

export default CheckoutSection;
