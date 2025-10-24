import { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { PaymentElement, useCheckout } from '@stripe/react-stripe-js/checkout';

const STATUS = {
  idle: 'idle',
  loading: 'loading',
  success: 'success',
  error: 'error',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formatCurrency = (amount, currency = 'usd') => {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return '';
  }

  const normalizedCurrency = typeof currency === 'string' && currency ? currency.toUpperCase() : 'USD';

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: normalizedCurrency,
      minimumFractionDigits: 2,
    }).format(numericAmount);
  } catch (_error) {
    return `$${numericAmount.toFixed(2)}`;
  }
};

const validateEmail = async (email, checkout) => {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    return { isValid: false, message: 'Enter your email address.' };
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { isValid: false, message: 'Enter a valid email address.' };
  }

  if (!checkout || typeof checkout.updateEmail !== 'function') {
    return { isValid: true, value: trimmedEmail };
  }

  try {
    const result = await checkout.updateEmail({ email: trimmedEmail });

    if (result?.error) {
      return { isValid: false, message: result.error.message || 'Email is not valid.' };
    }

    return { isValid: true, value: trimmedEmail };
  } catch (primaryError) {
    try {
      const fallbackResult = await checkout.updateEmail(trimmedEmail);

      if (fallbackResult?.error) {
        return {
          isValid: false,
          message: fallbackResult.error.message || 'Email is not valid.',
        };
      }

      return { isValid: true, value: trimmedEmail };
    } catch (secondaryError) {
      return {
        isValid: false,
        message: secondaryError.message || primaryError.message || 'Unable to validate email.',
      };
    }
  }
};

function StripeCheckoutForm({ selectedOption, onBackToOptions }) {
  const checkoutState = useCheckout();
  const checkout = checkoutState && Object.prototype.hasOwnProperty.call(checkoutState, 'checkout')
    ? checkoutState.checkout
    : null;
  const checkoutStatus = checkoutState?.type || (checkout ? 'ready' : 'loading');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [status, setStatus] = useState(STATUS.idle);
  const [message, setMessage] = useState('');

  const isProcessing = status === STATUS.loading;

  const summaryPrice = useMemo(() => {
    if (!selectedOption) {
      return '';
    }

    if (selectedOption.displayPrice) {
      return selectedOption.displayPrice;
    }

    if (Number.isFinite(selectedOption.price)) {
      return formatCurrency(selectedOption.price, selectedOption.currency);
    }

    return '';
  }, [selectedOption]);

  const canSubmit = useMemo(() => {
    if (!checkout) {
      return false;
    }

    if (typeof checkout.canConfirm === 'function') {
      try {
        return checkout.canConfirm();
      } catch (error) {
        console.warn('checkout.canConfirm() failed, falling back to ready state check.', error);
        return true;
      }
    }

    return checkout.canConfirm !== undefined ? Boolean(checkout.canConfirm) : true;
  }, [checkout]);

  const handleEmailBlur = useCallback(async () => {
    if (!email || !checkout) {
      return;
    }

    const result = await validateEmail(email, checkout);

    if (!result.isValid) {
      setEmailError(result.message || 'Email is not valid.');
    } else {
      setEmailError('');
    }
  }, [checkout, email]);

  const handleEmailChange = useCallback(
    (event) => {
      setEmail(event.target.value);

      if (emailError) {
        setEmailError('');
      }

      if (status === STATUS.error && message) {
        setStatus(STATUS.idle);
        setMessage('');
      }
    },
    [emailError, message, status],
  );

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (!checkout) {
        return;
      }

      setStatus(STATUS.loading);
      setMessage('');

      const validation = await validateEmail(email, checkout);

      if (!validation.isValid) {
        setEmailError(validation.message || 'Email is not valid.');
        setStatus(STATUS.error);
        setMessage(validation.message || 'Email is not valid.');
        return;
      }

      setEmail(validation.value || email);
      setEmailError('');

      const confirmResult = await checkout.confirm();

      if (confirmResult.type === 'error') {
        setStatus(STATUS.error);
        setMessage(confirmResult.error?.message || 'Something went wrong. Please try again.');
        return;
      }

      setStatus(STATUS.loading);
      setMessage('Redirecting to confirmation…');
    },
    [checkout, email],
  );

  if (checkoutStatus === 'loading') {
    return <div className="stripe-status-message" role="status">Loading checkout…</div>;
  }

  if (checkoutStatus === 'error') {
    const checkoutError = checkoutState && Object.prototype.hasOwnProperty.call(checkoutState, 'error')
      ? checkoutState.error
      : null;
    return (
      <div className="stripe-status-message" role="alert">
        Unable to load checkout: {checkoutError?.message || 'Unknown error.'}
      </div>
    );
  }

  return (
    <form className="stripe-payment-form" onSubmit={handleSubmit}>
      {selectedOption ? (
        <div className="checkout-summary" aria-live="polite">
          <div className="checkout-summary__details">
            <p className="checkout-summary__label">Selected Package</p>
            <p className="checkout-summary__name">{selectedOption.name}</p>
            {selectedOption.summary ? (
              <p className="checkout-summary__description">{selectedOption.summary}</p>
            ) : selectedOption.subcopy ? (
              <p className="checkout-summary__description">{selectedOption.subcopy}</p>
            ) : selectedOption.description ? (
              <p className="checkout-summary__description">{selectedOption.description}</p>
            ) : null}
            {summaryPrice ? <span className="checkout-summary__price">{summaryPrice}</span> : null}
            {onBackToOptions ? (
              <button
                type="button"
                className="checkout-summary__change"
                onClick={onBackToOptions}
                disabled={isProcessing}
              >
                Change
              </button>
            ) : null}
          </div>
          <div className="checkout-summary__aside">
            {selectedOption.imageSrc ? (
              <img
                className="checkout-summary__image"
                src={selectedOption.imageSrc}
                alt={selectedOption.imageAlt || `${selectedOption.name || 'Selected'} product image`}
                loading="lazy"
              />
            ) : null}
          </div>
        </div>
      ) : null}
      <label
        className="stripe-input-label"
        htmlFor="checkout-email"
        style={{ fontFamily: 'Lato, sans-serif' }}
      >
        Email
      </label>
      <input
        id="checkout-email"
        name="checkout-email"
        type="email"
        className={`stripe-input${emailError ? ' stripe-input-error' : ''}`}
        autoComplete="email"
        value={email}
        onChange={handleEmailChange}
        onBlur={handleEmailBlur}
        placeholder="you@example.com"
        required
        style={{ fontFamily: 'Lato, sans-serif' }}
      />
      {emailError ? (
        <div id="email-errors" className="stripe-status-message stripe-status-error" role="alert">
          {emailError}
        </div>
      ) : null}
      <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
      <button
        type="submit"
        className="stripe-submit-button btn btn-primary btn-one-style"
        disabled={isProcessing || !checkout || !canSubmit}
      >
        <span>{isProcessing ? 'Processing…' : 'Complete Purchase'}</span>
      </button>
      {message ? (
        <div
          className={`stripe-status-message${
            status === STATUS.error ? ' stripe-status-error' : ''
          }${status === STATUS.success ? ' stripe-status-success' : ''}`}
          role={status === STATUS.error ? 'alert' : 'status'}
        >
          {message}
        </div>
      ) : null}
    </form>
  );
}

StripeCheckoutForm.propTypes = {
  selectedOption: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    summary: PropTypes.string,
    subcopy: PropTypes.string,
    displayPrice: PropTypes.string,
    price: PropTypes.number,
    currency: PropTypes.string,
    imageSrc: PropTypes.string,
    imageAlt: PropTypes.string,
  }),
  onBackToOptions: PropTypes.func,
};

export default StripeCheckoutForm;
