import useLandingContent from '../hooks/useLandingContent';
import './LegalPage.css';

const renderParagraphContent = (paragraph) => {
  const text = typeof paragraph === 'string' ? paragraph.trim() : '';

  if (!text) {
    return null;
  }

  const segments = text.split(/\n+/).map((segment) => segment.trim()).filter(Boolean);

  if (!segments.length) {
    return null;
  }

  const nodes = [];
  let listBuffer = [];

  const flushList = (keyBase) => {
    if (!listBuffer.length) {
      return;
    }

    const items = listBuffer.map((item, listIndex) => (
      <li key={`${keyBase}-item-${listIndex}`}>{item}</li>
    ));

    nodes.push(
      <ul key={`${keyBase}-list`}>
        {items}
      </ul>,
    );

    listBuffer = [];
  };

  segments.forEach((segment, index) => {
    if (/^[-*]\s+/.test(segment)) {
      listBuffer.push(segment.replace(/^[-*]\s+/, ''));
    } else {
      flushList(`segment-${index}`);
      nodes.push(<p key={`paragraph-${index}`}>{segment}</p>);
    }
  });

  flushList(`segment-${segments.length}`);

  return nodes.length ? nodes : null;
};

function TermsOfService() {
  const { content, isLoading, error } = useLandingContent();

  if (isLoading) {
    return <div className="legal-page" data-legal-page="terms">Loading terms of service…</div>;
  }

  if (error) {
    return (
      <div className="legal-page" data-legal-page="terms">
        Unable to load terms of service content.
      </div>
    );
  }

  const terms = content?.termsOfService;
  const blocks = Array.isArray(terms?.blocks) ? terms.blocks : [];

  if (!terms || (!blocks.length && !terms.title)) {
    return (
      <div className="legal-page" data-legal-page="terms">
        <header className="legal-page__header">
          <h1>Terms of Service</h1>
        </header>
        <p>No terms of service content is available.</p>
      </div>
    );
  }

  return (
    <div className="legal-page" data-legal-page="terms">
      <header className="legal-page__header">
        <h1>{terms.title || 'Terms of Service'}</h1>
        {terms.lastUpdated ? <p>Last updated: {terms.lastUpdated}</p> : null}
      </header>
      {blocks.map((block, index) => {
        const hasTitle = typeof block?.title === 'string' && block.title.trim().length > 0;
        const contentNodes = renderParagraphContent(block?.paragraph);

        if (!hasTitle && !contentNodes) {
          return null;
        }

        return (
          <section key={block?.title || `block-${index}`}>
            {hasTitle ? <h2>{block.title}</h2> : null}
            {contentNodes}
          </section>
        );
      })}
      {!blocks.length ? <p>No terms of service sections configured.</p> : null}
    </div>
  );
}

export default TermsOfService;
