import PropTypes from 'prop-types';
import { getImageLoadingProps } from './utils';
import ResponsiveImage from './ResponsiveImage';

function HowToUseSection({ howToUse }) {
  if (!howToUse) {
    return null;
  }

  const { title, subtitle, steps = [], animation } = howToUse;

  if (!steps.length && !animation?.src) {
    return null;
  }

  return (
    <section className="how-to" data-landing-part="how-to">
      <div className="how-to__intro">
        {title && <h2>{title}</h2>}
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="how-to__content">
        {!!steps.length && (
          <ol className="how-to__steps">
            {steps.map((step) => (
              <li key={step.label}>
                <div className="how-to__step-card">
                  {step.image?.src ? (
                    <ResponsiveImage
                      src={step.image.src}
                      alt={step.image.alt || step.label}
                      {...getImageLoadingProps()}
                    />
                  ) : null}
                  <div>
                    <h3>{step.label}</h3>
                    <p>{step.description}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
        {animation?.src ? (
          <ResponsiveImage
            className="how-to__animation"
            src={animation.src}
            alt={animation.alt || title}
            {...getImageLoadingProps()}
          />
        ) : null}
      </div>
    </section>
  );
}

HowToUseSection.propTypes = {
  howToUse: PropTypes.shape({
    title: PropTypes.string,
    subtitle: PropTypes.string,
    steps: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        description: PropTypes.string,
        image: PropTypes.shape({
          src: PropTypes.string,
          alt: PropTypes.string,
        }),
      }),
    ),
    animation: PropTypes.shape({
      src: PropTypes.string,
      alt: PropTypes.string,
    }),
  }),
};

export default HowToUseSection;
