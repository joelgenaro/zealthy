import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useDocumentCache } from './useDocumentCache';

interface DocumentLoadOptions {
  optimizeForMobileSafari?: boolean;
  onDocumentOpen?: (path: string, url: string) => void;
  onReturnFromDocument?: (path: string) => void;
}

export const useBetterDocumentLoading = (options: DocumentLoadOptions = {}) => {
  const {
    optimizeForMobileSafari = true,
    onDocumentOpen,
    onReturnFromDocument,
  } = options;

  const [loadingDocuments, setLoadingDocuments] = useState<
    Record<string, boolean>
  >({});
  const [documentUrls, setDocumentUrls] = useState<Record<string, string>>({});
  const router = useRouter();
  const { cacheDocument, getCachedDocument, isDocumentCached } =
    useDocumentCache();

  const lastViewedRef = useRef<string | null>(null);
  const pendingLoadsRef = useRef<Set<string>>(new Set());
  const loadPromisesRef = useRef<Record<string, Promise<string | null>>>({});

  const isMobileSafari = useCallback(() => {
    if (typeof window === 'undefined') return false;
    if (!optimizeForMobileSafari) return false;

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    return isSafari && isMobile;
  }, [optimizeForMobileSafari]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const lastPath = lastViewedRef.current;
        if (lastPath) {
          try {
            onReturnFromDocument?.(lastPath);

            const currentPath = router.asPath.split('?')[0];
            router.replace(
              {
                pathname: currentPath,
                query: {
                  ...router.query,
                  lastViewed: lastPath,
                },
              },
              undefined,
              { shallow: true }
            );
          } catch (error) {
            console.error('Error handling visibility change:', error);
          } finally {
            lastViewedRef.current = null;
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [router, onReturnFromDocument]);

  useEffect(() => {
    const lastViewed = router.query.lastViewed as string;
    if (lastViewed && typeof lastViewed === 'string') {
      try {
        onReturnFromDocument?.(lastViewed);
      } catch (error) {
        console.error('Error handling return from document:', error);
      }
    }
  }, [router.query.lastViewed, onReturnFromDocument]);

  const getContentType = useCallback((path: string) => {
    const pathLower = path.toLowerCase();
    if (pathLower.endsWith('.pdf') || pathLower.includes('.pdf.')) {
      return 'application/pdf';
    } else if (pathLower.endsWith('.jpg') || pathLower.endsWith('.jpeg')) {
      return 'image/jpeg';
    } else if (pathLower.endsWith('.png')) {
      return 'image/png';
    } else if (pathLower.endsWith('.heic')) {
      return 'image/heic';
    }
    return 'application/octet-stream';
  }, []);

  const loadDocument = useCallback(
    async (path: string, fetchFunction: () => Promise<Blob | null>) => {
      if (!path) {
        return null;
      }

      if (path in loadPromisesRef.current) {
        return loadPromisesRef.current[path];
      }

      const cachedUrl = getCachedDocument(path);
      if (cachedUrl) {
        setDocumentUrls(prev => ({ ...prev, [path]: cachedUrl }));
        return cachedUrl;
      }

      pendingLoadsRef.current.add(path);
      setLoadingDocuments(prev => ({ ...prev, [path]: true }));

      const loadPromise = (async () => {
        try {
          const blob = await fetchFunction();

          if (!blob) {
            return null;
          }

          let contentType = blob.type;
          if (!contentType || contentType === 'application/octet-stream') {
            contentType = getContentType(path);
            if (contentType !== 'application/octet-stream') {
              const newBlob = new Blob([blob], {
                type: contentType,
              });
              const url = URL.createObjectURL(newBlob);
              cacheDocument(path, url, newBlob);
              setDocumentUrls(prev => ({ ...prev, [path]: url }));
              return url;
            }
          }

          const url = URL.createObjectURL(blob);
          cacheDocument(path, url, blob);
          setDocumentUrls(prev => ({ ...prev, [path]: url }));
          return url;
        } catch (error) {
          console.error(`Error loading document ${path}:`, error);
          return null;
        } finally {
          pendingLoadsRef.current.delete(path);
          setLoadingDocuments(prev => ({ ...prev, [path]: false }));
          delete loadPromisesRef.current[path];
        }
      })();

      loadPromisesRef.current[path] = loadPromise;
      return loadPromise;
    },
    [getCachedDocument, cacheDocument, getContentType]
  );

  const preloadDocument = useCallback(
    async (path: string, fetchFunction: () => Promise<Blob | null>) => {
      if (!path) {
        return;
      }

      if (
        isDocumentCached(path) ||
        loadingDocuments[path] ||
        pendingLoadsRef.current.has(path) ||
        path in loadPromisesRef.current
      ) {
        return;
      }

      pendingLoadsRef.current.add(path);

      const preloadPromise = (async () => {
        try {
          const blob = await fetchFunction();
          if (!blob) {
            return null;
          }

          let contentType = blob.type;
          if (!contentType || contentType === 'application/octet-stream') {
            contentType = getContentType(path);
            if (contentType !== 'application/octet-stream') {
              const newBlob = new Blob([blob], {
                type: contentType,
              });
              const url = URL.createObjectURL(newBlob);
              cacheDocument(path, url, newBlob);
              setDocumentUrls(prev => ({ ...prev, [path]: url }));
              return url;
            }
          }

          const url = URL.createObjectURL(blob);
          cacheDocument(path, url, blob);
          setDocumentUrls(prev => ({ ...prev, [path]: url }));
          return url;
        } catch (error) {
          console.error(`Error preloading document ${path}:`, error);
          return null;
        } finally {
          pendingLoadsRef.current.delete(path);
          delete loadPromisesRef.current[path];
        }
      })();

      loadPromisesRef.current[path] = preloadPromise;
      return preloadPromise;
    },
    [isDocumentCached, loadingDocuments, cacheDocument, getContentType]
  );

  const openDocument = useCallback(
    (path: string, url: string, e?: React.MouseEvent) => {
      if (e) e.preventDefault();
      if (!path || !url) return;

      lastViewedRef.current = path;

      try {
        onDocumentOpen?.(path, url);
      } catch (error) {
        console.error('Error in onDocumentOpen callback:', error);
      }

      try {
        if (isMobileSafari()) {
          window.open(url) || window.location.assign(url);
        } else {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      } catch (error) {
        console.error('Error opening document:', error);
        window.location.href = url;
      }
    },
    [isMobileSafari, onDocumentOpen]
  );

  const resetDocumentState = useCallback((path: string) => {
    setDocumentUrls(prev => {
      const newUrls = { ...prev };
      delete newUrls[path];
      return newUrls;
    });
    setLoadingDocuments(prev => {
      const newLoading = { ...prev };
      delete newLoading[path];
      return newLoading;
    });
    pendingLoadsRef.current.delete(path);
  }, []);

  const clearAll = useCallback(() => {
    setDocumentUrls({});
    setLoadingDocuments({});
    pendingLoadsRef.current.clear();
    loadPromisesRef.current = {};
    lastViewedRef.current = null;
  }, []);

  return {
    loadDocument,
    preloadDocument,
    openDocument,
    resetDocumentState,
    clearAll,
    isDocumentLoading: useCallback(
      (path: string) =>
        !!loadingDocuments[path] || pendingLoadsRef.current.has(path),
      [loadingDocuments]
    ),
    getDocumentUrl: useCallback(
      (path: string) => documentUrls[path] || getCachedDocument(path),
      [documentUrls, getCachedDocument]
    ),
    isDocumentCached,
  };
};
