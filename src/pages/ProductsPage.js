import { useCallback, useMemo } from 'react';
import useLandingContent from '../hooks/useLandingContent';
import { BrandingStrip, FooterSection } from '../components/landing';
import { resolveAssetPath } from '../components/landing/utils';
import ResponsiveImage from '../components/landing/ResponsiveImage';
import './ProductsPage.css';

const formatCurrency = (amount, currency = 'usd') => {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return '';
  }

  const normalizedCurrency = typeof currency === 'string' && currency ? currency.toUpperCase() : 'USD';

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: normalizedCurrency,
      minimumFractionDigits: 2,
    }).format(numericAmount);
  } catch (_error) {
    return `$${numericAmount.toFixed(2)}`;
  }
};

function ProductsPage() {
  const { content, isLoading, error } = useLandingContent();

  const checkout = content?.checkout;
  const products = useMemo(() => {
    if (!checkout || !Array.isArray(checkout.options)) {
      return [];
    }

    return checkout.options.filter(Boolean).map((option) => ({
      ...option,
      imageSrc: option?.image?.src ? resolveAssetPath(option.image.src) : '',
      imageAlt:
        option?.image?.alt || (option?.name ? `${option.name} product image` : 'Product option image'),
      priceLabel:
        option?.displayPrice
        || formatCurrency(option?.price, option?.currency || checkout?.currency || 'usd'),
    }));
  }, [checkout]);

  const handleBuyNow = useCallback((productId) => {
    const url = new URL(window.location.href);
    url.pathname = '/checkout';

    if (productId) {
      url.searchParams.set('product', productId);
    } else {
      url.searchParams.delete('product');
    }

    window.location.href = `${url.pathname}${url.search}`;
  }, []);

  const handleBackHome = useCallback(() => {
    window.location.href = '/';
  }, []);

  let body = null;

  if (isLoading) {
    body = <div className="products-page__status">Loading products…</div>;
  } else if (error) {
    body = <div className="products-page__status products-page__status--error">Unable to load products.</div>;
  } else if (!checkout) {
    body = <div className="products-page__status">Products are not available right now.</div>;
  } else {
    body = (
      <>
        <section className="products-page__hero">
          <div className="products-page__hero-content">
            <button type="button" className="products-page__back" onClick={handleBackHome}>
              ← Back to home
            </button>
            <h1>{checkout.title || 'Choose Your Package'}</h1>
            {checkout.subtitle ? <p>{checkout.subtitle}</p> : null}
          </div>
        </section>
        <section className="products-page__grid" aria-live="polite">
          {products.map((product) => (
            <article key={product.id || product.name} className="product-card">
              {product.imageSrc ? (
                <div className="product-card__media">
                  <ResponsiveImage src={product.imageSrc} alt={product.imageAlt} loading="lazy" />
                </div>
              ) : null}
              <div className="product-card__body">
                {product.badge ? <span className="product-card__badge">{product.badge}</span> : null}
                <h2>{product.name}</h2>
                {product.description ? <p className="product-card__description">{product.description}</p> : null}
                {product.priceLabel ? <span className="product-card__price">{product.priceLabel}</span> : null}
                {product.subcopy ? <span className="product-card__subcopy">{product.subcopy}</span> : null}
                <button
                  type="button"
                  className="product-card__cta"
                  onClick={() => handleBuyNow(product.id)}
                >
                  Buy Now
                </button>
              </div>
            </article>
          ))}
        </section>
      </>
    );
  }

  return (
    <main className="products-page" data-landing-root>
      <BrandingStrip branding={content?.branding} />
      {body}
      <FooterSection footer={content?.footer} />
    </main>
  );
}

export default ProductsPage;
