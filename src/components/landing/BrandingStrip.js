import PropTypes from 'prop-types';
import { getImageLoadingProps } from './utils';
import ResponsiveImage from './ResponsiveImage';

function BrandingStrip({ branding }) {
  if (!branding) {
    return null;
  }

  const { logo, saleBanners = [], reviewBadge } = branding;

  return (
    <header className="branding-strip" data-landing-part="branding">
      <div className="branding-strip__inner">
        {logo?.src ? (
          <ResponsiveImage
            className="branding-strip__logo"
            src={logo.src}
            alt={logo.alt || 'Brand logo'}
            {...getImageLoadingProps({ aboveFold: true })}
          />
        ) : null}

        <div className="branding-strip__messages">
          {saleBanners.map((banner) => (
            <p key={banner.id || banner.message} className="branding-strip__banner">
              {banner.message}
            </p>
          ))}
        </div>

        {reviewBadge?.image ? (
          <div className="branding-strip__review" aria-label="Product rating">
            <ResponsiveImage
              src={reviewBadge.image}
              alt={reviewBadge.alt || 'Rating badge'}
              {...getImageLoadingProps({ aboveFold: true })}
            />
            <span>{reviewBadge.ratingLabel}</span>
            <span>{reviewBadge.reviewCountLabel}</span>
          </div>
        ) : null}
      </div>
    </header>
  );
}

BrandingStrip.propTypes = {
  branding: PropTypes.shape({
    logo: PropTypes.shape({
      src: PropTypes.string,
      alt: PropTypes.string,
    }),
    saleBanners: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        message: PropTypes.string,
      }),
    ),
    reviewBadge: PropTypes.shape({
      image: PropTypes.string,
      alt: PropTypes.string,
      ratingLabel: PropTypes.string,
      reviewCountLabel: PropTypes.string,
    }),
  }),
};

export default BrandingStrip;
