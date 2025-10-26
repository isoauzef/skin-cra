import PropTypes from 'prop-types';
import { getImageLoadingProps } from './utils';
import ResponsiveImage from './ResponsiveImage';

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
          </ul>
        )}
      </div>
      {image?.src ? (
        <ResponsiveImage
          className="guarantee__image"
          src={image.src}
          alt={image.alt || headline}
          {...getImageLoadingProps()}
        />
      ) : null}
    </section>
  );
}

GuaranteeSection.propTypes = {
  guarantee: PropTypes.shape({
    headline: PropTypes.string,
    body: PropTypes.string,
    contact: PropTypes.shape({
      email: PropTypes.string,
    }),
    image: PropTypes.shape({
      src: PropTypes.string,
      alt: PropTypes.string,
    }),
  }),
};

export default GuaranteeSection;
