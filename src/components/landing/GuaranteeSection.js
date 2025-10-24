import PropTypes from 'prop-types';
import { resolveAssetPath } from './utils';

function GuaranteeSection({ guarantee }) {
  if (!guarantee) {
    return null;
  }

  const { headline, body, contact, image } = guarantee;

  return (
    <section className="guarantee" data-landing-part="guarantee">
      <div className="guarantee__text">
        {headline && <h2>{headline}</h2>}
        {body && <p>{body}</p>}
        {contact && (
          <ul>
            {contact.email && <li><strong>Email:</strong> <a href={`mailto:${contact.email}`}>{contact.email}</a></li>}
            {contact.phone && <li><strong>Phone:</strong> <a href={`tel:${contact.phone}`}>{contact.phone}</a></li>}
          </ul>
        )}
      </div>
      {image?.src && (
        <img
          className="guarantee__image"
          src={resolveAssetPath(image.src)}
          alt={image.alt || headline}
          loading="lazy"
        />
      )}
    </section>
  );
}

GuaranteeSection.propTypes = {
  guarantee: PropTypes.shape({
    headline: PropTypes.string,
    body: PropTypes.string,
    contact: PropTypes.shape({
      email: PropTypes.string,
      phone: PropTypes.string,
    }),
    image: PropTypes.shape({
      src: PropTypes.string,
      alt: PropTypes.string,
    }),
  }),
};

export default GuaranteeSection;
