import { useEffect, useState } from 'react';
import { updateFavicon } from '../components/landing/utils';

const PRIMARY_ENDPOINT = process.env.REACT_APP_CONTENT_ENDPOINT || '/api/content';
const FALLBACK_ENDPOINT = '/landing-content.json';

const fetchContent = async (url) => {
  const response = await fetch(url, { cache: 'no-cache' });

  if (!response.ok) {
    const error = new Error(`Failed to load landing content: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
};

export function useLandingContent() {
  const [content, setContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadContent() {
      setIsLoading(true);
      setError(null);

      try {
        let payload;

        try {
          payload = await fetchContent(PRIMARY_ENDPOINT);
        } catch (primaryError) {
          if (PRIMARY_ENDPOINT !== FALLBACK_ENDPOINT) {
            try {
              payload = await fetchContent(FALLBACK_ENDPOINT);
            } catch (fallbackError) {
              throw fallbackError;
            }
          } else {
            throw primaryError;
          }
        }

        if (isMounted) {
          setContent(payload ?? null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error loading landing content'));
          setContent(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadContent();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    updateFavicon(content?.branding?.favicon?.src || '');
  }, [content]);

  return { content, isLoading, error };
}

export default useLandingContent;
