import PropTypes from 'prop-types';
import { resolveAssetPath } from './utils';

function TestimonialsSection({ testimonials }) {
  if (!testimonials) {
    return null;
  }

  const { title, cards = [] } = testimonials;

  if (!cards.length) {
    return null;
  }

  return (
    <section className="testimonials" data-landing-part="testimonials">
      {title && <h2>{title}</h2>}
      <div className="testimonials__grid">
        {cards.map((card) => (
          <article key={card.name} className="testimonials__card">
            {card.image?.src && (
              <img
                src={resolveAssetPath(card.image.src)}
                alt={card.image.alt || card.name}
                loading="lazy"
              />
            )}
            <div className="testimonials__meta">
              <h3>{card.name}</h3>
              {card.badge && <span className="testimonials__badge">{card.badge}</span>}
            </div>
            <blockquote>{card.quote}</blockquote>
          </article>
        ))}
      </div>
    </section>
  );
}

TestimonialsSection.propTypes = {
  testimonials: PropTypes.shape({
    title: PropTypes.string,
    cards: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        badge: PropTypes.string,
        quote: PropTypes.string,
        image: PropTypes.shape({
          src: PropTypes.string,
          alt: PropTypes.string,
        }),
      }),
    ),
  }),
};

export default TestimonialsSection;
