import { useEffect } from 'react';
import PropTypes from 'prop-types';

function CheckoutModal({ open, onClose, children }) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div className="checkout-modal" role="dialog" aria-modal="true" onClick={handleBackdropClick}>
      <div className="checkout-modal__content">
        <button type="button" className="checkout-modal__close" onClick={onClose} aria-label="Close checkout">
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

CheckoutModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  children: PropTypes.node,
};

export default CheckoutModal;
