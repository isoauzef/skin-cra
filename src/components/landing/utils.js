export function resolveAssetPath(src) {
  if (!src) {
    return '';
  }

  if (/^(?:https?:)?\/\//i.test(src) || src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }

  return src.startsWith('/') ? src : `/${src}`;
}

export function isExternalUrl(url) {
  if (!url) {
    return false;
  }

  return /^(?:https?:)?\/\//i.test(url);
}

export function updateFavicon(src) {
  if (typeof document === 'undefined') {
    return;
  }

  if (!src) {
    return;
  }

  const resolvedHref = resolveAssetPath(src);

  if (!resolvedHref) {
    return;
  }

  let link = document.querySelector("link[rel*='icon']");

  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }

  let absoluteHref = resolvedHref;

  if (typeof window !== 'undefined' && window.location) {
    try {
      absoluteHref = new URL(resolvedHref, window.location.origin).href;
    } catch (_error) {
      // Ignore malformed URLs.
    }
  }

  if (link.href !== absoluteHref) {
    link.href = resolvedHref;
  }
}

export function getImageLoadingProps({ aboveFold = false } = {}) {
  if (aboveFold) {
    return { loading: 'eager', decoding: 'auto' };
  }

  return { loading: 'lazy', decoding: 'async' };
}
