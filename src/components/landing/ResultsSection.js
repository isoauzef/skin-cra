import PropTypes from 'prop-types';
import { resolveAssetPath } from './utils';

function ResultsSection({ results }) {
  if (!results) {
    return null;
  }

  const { title, intro, stories = [] } = results;

  if (!stories.length) {
    return null;
  }

  return (
    <section className="results" data-landing-part="results">
      <div className="results__intro">
        {title && <h2>{title}</h2>}
        {intro && <p>{intro}</p>}
      </div>
      <div className="results__grid">
        {stories.map((story) => (
          <article key={story.name} className="results__card">
            {story.image?.src && (
              <img
                src={resolveAssetPath(story.image.src)}
                alt={story.image.alt || story.name}
                loading="lazy"
              />
            )}
            <blockquote>{story.quote}</blockquote>
            <h3>{story.name}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}

ResultsSection.propTypes = {
  results: PropTypes.shape({
    title: PropTypes.string,
    intro: PropTypes.string,
    stories: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        quote: PropTypes.string,
        image: PropTypes.shape({
          src: PropTypes.string,
          alt: PropTypes.string,
        }),
      }),
    ),
  }),
};

export default ResultsSection;
