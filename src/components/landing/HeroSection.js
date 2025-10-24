import PropTypes from 'prop-types';
import { resolveAssetPath, isExternalUrl, getImageLoadingProps } from './utils';

function HeroSection({ hero, onPrimaryCtaClick, onSecondaryCtaClick }) {
  if (!hero) {
    return null;
  }

  const {
    headline,
    subheadline,
    description,
    bullets = [],
    cta,
    secondaryCta,
    guarantee,
    productImage,
  badgeImages = [],
  paymentImage,
    testimonial,
    reviewHighlightImage,
  } = hero;

  const handlePrimaryClick = (event) => {
    if (onPrimaryCtaClick) {
      event.preventDefault();
      onPrimaryCtaClick(event);
    }
  };

  const handleSecondaryClick = (event) => {
    if (onSecondaryCtaClick) {
      event.preventDefault();
      onSecondaryCtaClick(event);
    }
  };

  return (
    <section className="hero" data-landing-part="hero">
      <div className="hero__content">
        <div className="hero__copy">
          {headline && <h1>{headline}</h1>}
          {subheadline && <h2>{subheadline}</h2>}
          {description && <p className="hero__description">{description}</p>}

          {!!bullets.length && (
            <ul className="hero__bullets">
              {bullets.map((bullet) => (
                <li key={bullet}>
                  <i className="icp icp-auto fas fa-check" aria-hidden="true" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="hero__actions">
            {cta?.href && (
              <a
                className="hero__cta hero__cta--primary"
                href={cta.href}
                target={isExternalUrl(cta.href) ? '_blank' : undefined}
                rel={isExternalUrl(cta.href) ? 'noreferrer' : undefined}
                onClick={handlePrimaryClick}
              >
                {cta.label || 'Learn more'}
              </a>
            )}
            {secondaryCta?.href && (
              <a
                className="hero__cta hero__cta--secondary"
                href={secondaryCta.href}
                target={isExternalUrl(secondaryCta.href) ? '_blank' : undefined}
                rel={isExternalUrl(secondaryCta.href) ? 'noreferrer' : undefined}
                onClick={handleSecondaryClick}
              >
                {secondaryCta.label || 'Discover now'}
              </a>
            )}
          </div>

          {guarantee && (
            <div className="hero__guarantee">
              {guarantee.tagline && <strong>{guarantee.tagline}</strong>}
              {guarantee.supportingCopy && <span>{guarantee.supportingCopy}</span>}
            </div>
          )}

          {(badgeImages.length || paymentImage?.src || reviewHighlightImage?.src) && (
            <div className="hero__support">
              {!!badgeImages.length && (
                <ul className="hero__badges">
                  {badgeImages.map((badge) => (
                    <li key={badge.src}>
                      {badge.src && (
                        <img
                          src={resolveAssetPath(badge.src)}
                          alt={badge.alt || badge.label}
                          {...getImageLoadingProps({ aboveFold: true })}
                        />
                      )}
                      {badge.label && <span>{badge.label}</span>}
                    </li>
                  ))}
                </ul>
              )}
              {(paymentImage?.src || reviewHighlightImage?.src) && (
                <div className="hero__support-row">
                  {paymentImage?.src && (
                    <img
                      className="hero__payment"
                      src={resolveAssetPath(paymentImage.src)}
                      alt={paymentImage.alt || 'Payment methods'}
                      {...getImageLoadingProps({ aboveFold: true })}
                    />
                  )}

                  {reviewHighlightImage?.src && (
                    <div className="hero__reviews">
                      <img
                        src={resolveAssetPath(reviewHighlightImage.src)}
                        alt={reviewHighlightImage.alt || 'Customer reviews'}
                        {...getImageLoadingProps({ aboveFold: true })}
                      />
                      {reviewHighlightImage.label && <span>{reviewHighlightImage.label}</span>}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {(productImage?.src || testimonial) && (
          <div className="hero__media">
            {productImage?.src && (
              <img
                className="hero__product"
                src={resolveAssetPath(productImage.src)}
                alt={productImage.alt || 'Featured product'}
                {...getImageLoadingProps({ aboveFold: true })}
              />
            )}

            {testimonial && (
              <figure className="hero__testimonial">
                {testimonial.avatar && (
                  <img
                    src={resolveAssetPath(testimonial.avatar)}
                    alt={testimonial.name ? `${testimonial.name} testimonial` : 'Customer testimonial'}
                    {...getImageLoadingProps({ aboveFold: true })}
                  />
                )}
                <blockquote>
                  {testimonial.quote}
                </blockquote>
                {testimonial.name && <figcaption>{testimonial.name}</figcaption>}
              </figure>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

HeroSection.propTypes = {
  hero: PropTypes.shape({
    headline: PropTypes.string,
    subheadline: PropTypes.string,
    description: PropTypes.string,
    bullets: PropTypes.arrayOf(PropTypes.string),
    cta: PropTypes.shape({
      label: PropTypes.string,
      href: PropTypes.string,
    }),
    secondaryCta: PropTypes.shape({
      label: PropTypes.string,
      href: PropTypes.string,
    }),
    guarantee: PropTypes.shape({
      tagline: PropTypes.string,
      supportingCopy: PropTypes.string,
    }),
    productImage: PropTypes.shape({
      src: PropTypes.string,
      alt: PropTypes.string,
    }),
    badgeImages: PropTypes.arrayOf(
      PropTypes.shape({
        src: PropTypes.string,
        alt: PropTypes.string,
        label: PropTypes.string,
      }),
    ),
    paymentImage: PropTypes.shape({
      src: PropTypes.string,
      alt: PropTypes.string,
    }),
    testimonial: PropTypes.shape({
      name: PropTypes.string,
      quote: PropTypes.string,
      avatar: PropTypes.string,
    }),
    reviewHighlightImage: PropTypes.shape({
      src: PropTypes.string,
      alt: PropTypes.string,
      label: PropTypes.string,
    }),
  }),
  onPrimaryCtaClick: PropTypes.func,
  onSecondaryCtaClick: PropTypes.func,
};

export default HeroSection;
