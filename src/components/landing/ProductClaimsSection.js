import PropTypes from 'prop-types';
import { resolveAssetPath, getImageLoadingProps } from './utils';

function ProductClaimsSection({ productClaims }) {
  if (!productClaims) {
    return null;
  }

  const { title, items = [], supportingImage } = productClaims;

  if (!title && !items.length && !supportingImage?.src) {
    return null;
  }

  return (
    <section className="claims" data-landing-part="claims">
      <div className="claims__text">
        {title && <h2>{title}</h2>}
        {!!items.length && (
          <ul>
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </div>
      {supportingImage?.src && (
        <img
          className="claims__image"
          src={resolveAssetPath(supportingImage.src)}
          alt={supportingImage.alt || title}
          {...getImageLoadingProps()}
        />
      )}
    </section>
  );
}

ProductClaimsSection.propTypes = {
  productClaims: PropTypes.shape({
    title: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.string),
    supportingImage: PropTypes.shape({
      src: PropTypes.string,
      alt: PropTypes.string,
    }),
  }),
};

export default ProductClaimsSection;
