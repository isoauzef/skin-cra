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

function PrivacyPolicy() {
  const { content, isLoading, error } = useLandingContent();

  if (isLoading) {
    return <div className="legal-page" data-legal-page="privacy">Loading privacy policy…</div>;
  }

  if (error) {
    return (
      <div className="legal-page" data-legal-page="privacy">
        Unable to load privacy policy content.
      </div>
    );
  }

  const policy = content?.privacyPolicy;
  const blocks = Array.isArray(policy?.blocks) ? policy.blocks : [];

  if (!policy || (!blocks.length && !policy.title)) {
    return (
      <div className="legal-page" data-legal-page="privacy">
        <header className="legal-page__header">
          <h1>Privacy Policy</h1>
        </header>
        <p>No privacy policy content is available.</p>
      </div>
    );
  }

  return (
    <div className="legal-page" data-legal-page="privacy">
      <header className="legal-page__header">
        <h1>{policy.title || 'Privacy Policy'}</h1>
        {policy.lastUpdated ? <p>Last updated: {policy.lastUpdated}</p> : null}
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
      {!blocks.length ? <p>No privacy policy sections configured.</p> : null}
    </div>
  );
}

export default PrivacyPolicy;
