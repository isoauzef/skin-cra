import { useState } from 'react';
import PropTypes from 'prop-types';

function FaqSection({ faq }) {
  const [openIndex, setOpenIndex] = useState(null);

  if (!faq) {
    return null;
  }

  const { title, items = [] } = faq;

  const handleToggle = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  if (!items.length) {
    return null;
  }

  return (
    <section className="faq" data-landing-part="faq">
      {title && <h2>{title}</h2>}
      <div className="faq__items">
        {items.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <article
              key={item.question}
              className={`faq__item${isOpen ? ' faq__item--open' : ''}`}
            >
              <button
                type="button"
                className="faq__trigger"
                onClick={() => handleToggle(index)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${index}`}
              >
                <span>{item.question}</span>
                <span className="faq__icon" aria-hidden="true">{isOpen ? '−' : '+'}</span>
              </button>
              <div
                id={`faq-panel-${index}`}
                className="faq__content"
                hidden={!isOpen}
              >
                <p>{item.answer}</p>
              </div>
          </article>
          );
        })}
      </div>
    </section>
  );
}

FaqSection.propTypes = {
  faq: PropTypes.shape({
    title: PropTypes.string,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        question: PropTypes.string,
        answer: PropTypes.string,
      }),
    ),
  }),
};

export default FaqSection;
