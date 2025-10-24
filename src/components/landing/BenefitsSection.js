import PropTypes from 'prop-types';
import { resolveAssetPath, getImageLoadingProps } from './utils';

function BenefitsSection({ benefits }) {
  if (!benefits) {
    return null;
  }

  const { title, items = [] } = benefits;

  if (!items.length) {
    return null;
  }

  return (
    <section className="benefits" data-landing-part="benefits">
      {title && <h2>{title}</h2>}
      <div className="benefits__grid">
        {items.map((item) => (
          <article key={item.title} className="benefits__card">
            {item.image?.src && (
              <img
                src={resolveAssetPath(item.image.src)}
                alt={item.image.alt || item.title}
                {...getImageLoadingProps()}
              />
            )}
            <p className="benefits__title">{item.title}</p>
            <p className="benefits__description">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

BenefitsSection.propTypes = {
  benefits: PropTypes.shape({
    title: PropTypes.string,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
        image: PropTypes.shape({
          src: PropTypes.string,
          alt: PropTypes.string,
        }),
      }),
    ),
  }),
};

export default BenefitsSection;
