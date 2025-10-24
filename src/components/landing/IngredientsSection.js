import PropTypes from 'prop-types';
import { resolveAssetPath, isExternalUrl, getImageLoadingProps } from './utils';

function IngredientsSection({ ingredients, onCtaClick }) {
  if (!ingredients) {
    return null;
  }

  const { title, subtitle, cards = [], cta, ctaSupportCopy } = ingredients;
  const [primaryCard] = cards;

  if (!primaryCard) {
    return null;
  }

  return (
    <section className="ingredients" data-landing-part="ingredients">
      <div className="ingredients__intro">
        {title && <h2>{title}</h2>}
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="ingredients__layout">
        <article className="ingredients__panel ingredients__panel--copy">
          <h3>{primaryCard.name}</h3>
          <p>{primaryCard.description}</p>
        </article>
        <aside className="ingredients__panel ingredients__panel--media">
          {primaryCard.image?.src && (
            <img
              src={resolveAssetPath(primaryCard.image.src)}
              alt={primaryCard.image.alt || primaryCard.name}
              {...getImageLoadingProps()}
            />
          )}
        </aside>
      </div>
      {(cta?.href || ctaSupportCopy) && (
        <div className="ingredients__cta">
          {cta?.href && (
            <a
              className="button"
              href={cta.href}
              target={isExternalUrl(cta.href) ? '_blank' : undefined}
              rel={isExternalUrl(cta.href) ? 'noreferrer' : undefined}
              onClick={onCtaClick}
            >
              {cta.label || 'Learn more'}
            </a>
          )}
          {ctaSupportCopy && <p>{ctaSupportCopy}</p>}
        </div>
      )}
    </section>
  );
}

IngredientsSection.propTypes = {
  ingredients: PropTypes.shape({
    title: PropTypes.string,
    subtitle: PropTypes.string,
    cards: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        description: PropTypes.string,
        image: PropTypes.shape({
          src: PropTypes.string,
          alt: PropTypes.string,
        }),
      }),
    ),
    cta: PropTypes.shape({
      label: PropTypes.string,
      href: PropTypes.string,
    }),
    ctaSupportCopy: PropTypes.string,
  }),
  onCtaClick: PropTypes.func,
};

export default IngredientsSection;
