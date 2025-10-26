import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { resolveAssetPath } from './utils';

const imagePreferenceCache = new Map();

const loadCandidate = (url) => {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('Invalid image URL'));
      return;
    }

    const testImage = new Image();
    testImage.decoding = 'async';
    testImage.onload = () => resolve(url);
    testImage.onerror = () => reject(new Error(`Failed to load ${url}`));
    testImage.src = url;
  });
};

const createVariantPath = (path, extension) => {
  if (!path) {
    return null;
  }

  const queryIndex = path.indexOf('?');
  const hasQuery = queryIndex >= 0;
  const basePath = hasQuery ? path.slice(0, queryIndex) : path;
  const query = hasQuery ? path.slice(queryIndex) : '';
  const lastDotIndex = basePath.lastIndexOf('.');

  if (lastDotIndex <= basePath.lastIndexOf('/')) {
    return null;
  }

  const baseWithoutExtension = basePath.slice(0, lastDotIndex);
  return `${baseWithoutExtension}.${extension}${query}`;
};

function ResponsiveImage({ src, fallbackSrc, alt, className, decoding, loading, ...rest }) {
  const normalizedSrc = useMemo(() => {
    const primary = resolveAssetPath(src || fallbackSrc || '');
    return primary;
  }, [src, fallbackSrc]);

  const cacheKey = src || fallbackSrc || normalizedSrc;

  const candidates = useMemo(() => {
    if (!normalizedSrc) {
      return [];
    }

    const list = [];
    const isRelativePath = normalizedSrc.startsWith('/') && !normalizedSrc.startsWith('//');

    if (isRelativePath) {
      const avifPath = createVariantPath(normalizedSrc, 'avif');
      const webpPath = createVariantPath(normalizedSrc, 'webp');

      if (avifPath && avifPath !== normalizedSrc) {
        list.push(avifPath);
      }

      if (webpPath && webpPath !== normalizedSrc && (!avifPath || webpPath !== avifPath)) {
        list.push(webpPath);
      }
    }

    list.push(normalizedSrc);

    return list.filter(Boolean);
  }, [normalizedSrc]);

  const [currentSrc, setCurrentSrc] = useState(() => {
    if (cacheKey && imagePreferenceCache.has(cacheKey)) {
      return imagePreferenceCache.get(cacheKey);
    }

    if (normalizedSrc && imagePreferenceCache.has(normalizedSrc)) {
      return imagePreferenceCache.get(normalizedSrc);
    }

    return normalizedSrc;
  });

  useEffect(() => {
    if (!normalizedSrc) {
      setCurrentSrc('');
      return;
    }

    if (cacheKey && imagePreferenceCache.has(cacheKey)) {
      const cached = imagePreferenceCache.get(cacheKey);
      if (cached && cached !== currentSrc) {
        setCurrentSrc(cached);
      }
      return;
    }

    let isActive = true;

    const resolvePreferredSource = async () => {
      for (const candidate of candidates) {
        if (!candidate) {
          continue;
        }

        if (candidate === normalizedSrc) {
          if (cacheKey) {
            imagePreferenceCache.set(cacheKey, normalizedSrc);
          }
          if (isActive && currentSrc !== normalizedSrc) {
            setCurrentSrc(normalizedSrc);
          }
          return;
        }

        try {
          await loadCandidate(candidate);
          if (!isActive) {
            return;
          }

          if (cacheKey) {
            imagePreferenceCache.set(cacheKey, candidate);
          }
          setCurrentSrc(candidate);
          return;
        } catch (_error) {
          // Ignore candidate failures; fall through to next option.
        }
      }

      if (isActive) {
        if (cacheKey) {
          imagePreferenceCache.set(cacheKey, normalizedSrc);
        }
        setCurrentSrc(normalizedSrc);
      }
    };

    resolvePreferredSource();

    return () => {
      isActive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, candidates, normalizedSrc]);

  if (!currentSrc) {
    return null;
  }

  return (
    <img
      src={currentSrc}
      alt={alt || ''}
      className={className}
      decoding={decoding}
      loading={loading}
      {...rest}
    />
  );
}

ResponsiveImage.propTypes = {
  src: PropTypes.string,
  fallbackSrc: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
  decoding: PropTypes.oneOf(['async', 'auto', 'sync']),
  loading: PropTypes.oneOf(['eager', 'lazy']),
};

ResponsiveImage.defaultProps = {
  src: '',
  fallbackSrc: '',
  alt: '',
  className: undefined,
  decoding: undefined,
  loading: undefined,
};

export default ResponsiveImage;
