import PropTypes from 'prop-types';
import { getImageLoadingProps } from './utils';
import ResponsiveImage from './ResponsiveImage';

function ScienceCallout({ scienceCallout }) {
  if (!scienceCallout) {
    return null;
  }

  const { title, body, images = [] } = scienceCallout;

  return (
    <section className="science" data-landing-part="science">
      <div className="science__text">
        {title && <h2>{title}</h2>}
        {body && <p>{body}</p>}
      </div>
      {!!images.length && (
        <div className="science__gallery">
          {images.map((image) => (
            <ResponsiveImage
              key={image.src}
              src={image.src}
              alt={image.alt || title}
              {...getImageLoadingProps()}
            />
          ))}
        </div>
      )}
    </section>
  );
}

ScienceCallout.propTypes = {
  scienceCallout: PropTypes.shape({
    title: PropTypes.string,
    body: PropTypes.string,
    images: PropTypes.arrayOf(
      PropTypes.shape({
        src: PropTypes.string,
        alt: PropTypes.string,
      }),
    ),
  }),
};

export default ScienceCallout;
