import PropTypes from 'prop-types';
import { isExternalUrl } from './utils';

function FinalCtaSection({ finalCta, onCtaClick }) {
  if (!finalCta) {
    return null;
  }

  const { headline, subheadline, cta, supportingCopy } = finalCta;

  if (!headline && !cta?.href) {
    return null;
  }

  const handleClick = (event) => {
    if (onCtaClick) {
      event.preventDefault();
      onCtaClick(event);
    }
  };

  return (
    <section className="final-cta" data-landing-part="final-cta">
      <div className="final-cta__content">
        {headline && <h2>{headline}</h2>}
        {subheadline && <p className="final-cta__subheadline">{subheadline}</p>}
        {cta?.href && (
          <a
            className="hero__cta hero__cta--primary"
            href={cta.href}
            target={isExternalUrl(cta.href) ? '_blank' : undefined}
            rel={isExternalUrl(cta.href) ? 'noreferrer' : undefined}
            onClick={handleClick}
          >
            {cta.label || 'Get started'}
          </a>
        )}
        {supportingCopy && <p className="final-cta__supporting">{supportingCopy}</p>}
      </div>
    </section>
  );
}

FinalCtaSection.propTypes = {
  finalCta: PropTypes.shape({
    headline: PropTypes.string,
    subheadline: PropTypes.string,
    cta: PropTypes.shape({
      label: PropTypes.string,
      href: PropTypes.string,
    }),
    supportingCopy: PropTypes.string,
  }),
  onCtaClick: PropTypes.func,
};

export default FinalCtaSection;
