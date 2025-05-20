import { useState, useEffect, useCallback, useRef } from 'react';

interface CachedDocument {
  url: string;
  timestamp: number;
  data?: Blob;
  mimeType?: string;
}

// Extended cache time for better user experience - 30 mins
const CACHE_EXPIRATION = 0.5 * 60 * 60 * 1000;
// Maximum number of documents to keep in cache to prevent memory issues
const MAX_CACHE_ITEMS = 10;

export const useDocumentCache = () => {
  const [cache, setCache] = useState<Record<string, CachedDocument>>({});
  const storageAvailable = useRef<boolean>(true);

  useEffect(() => {
    try {
      const testKey = '__storage_test__';
      sessionStorage.setItem(testKey, testKey);
      sessionStorage.removeItem(testKey);
      storageAvailable.current = true;
    } catch (e) {
      storageAvailable.current = false;
      console.warn(
        'Session storage is not available, document caching will use in-memory only'
      );
    }
  }, []);

  useEffect(() => {
    if (!storageAvailable.current) return;

    try {
      const storedCache = sessionStorage.getItem('documentCache');
      if (!storedCache) return;

      const parsedCache = JSON.parse(storedCache);
      if (!parsedCache || typeof parsedCache !== 'object') return;

      const restoredCache: Record<string, CachedDocument> = {};

      const sortedEntries = Object.entries(parsedCache)
        .filter(([_, item]: [string, any]) => item && item.timestamp)
        .sort(
          ([_, a]: [string, any], [__, b]: [string, any]) =>
            b.timestamp - a.timestamp
        )
        .slice(0, MAX_CACHE_ITEMS);

      for (const [key, item] of sortedEntries) {
        try {
          const cachedItem = item as CachedDocument;

          if (Date.now() - cachedItem.timestamp > CACHE_EXPIRATION) continue;

          restoredCache[key] = {
            url: cachedItem.url,
            timestamp: cachedItem.timestamp,
          };
        } catch (itemError) {
          console.error('Error restoring cached item:', itemError);
        }
      }

      if (Object.keys(restoredCache).length > 0) {
        setCache(restoredCache);
      }
    } catch (error) {
      console.error('Error restoring document cache:', error);
    }
  }, []);

  useEffect(() => {
    if (!storageAvailable.current || Object.keys(cache).length === 0) return;

    try {
      const entries = Object.entries(cache)
        .filter(([_, value]) => value && value.timestamp)
        .sort(([_, a], [__, b]) => b.timestamp - a.timestamp)
        .slice(0, MAX_CACHE_ITEMS);

      const storableCache = entries.reduce((acc, [key, value]) => {
        return {
          ...acc,
          [key]: {
            url: value.url,
            timestamp: value.timestamp,
          },
        };
      }, {});

      if (Object.keys(storableCache).length > 0) {
        try {
          sessionStorage.setItem(
            'documentCache',
            JSON.stringify(storableCache)
          );
        } catch (error) {
          const storageError = error as Error;
          if (storageError.name === 'QuotaExceededError') {
            console.warn('Storage quota exceeded, trimming cache');

            let currentCount = Math.floor(entries.length / 2);
            while (currentCount >= 5) {
              const trimmedCache = entries.slice(0, currentCount).reduce(
                (acc, [key, value]) => ({
                  ...acc,
                  [key]: {
                    url: value.url,
                    timestamp: value.timestamp,
                  },
                }),
                {}
              );

              try {
                sessionStorage.setItem(
                  'documentCache',
                  JSON.stringify(trimmedCache)
                );
                break;
              } catch (e) {
                currentCount = Math.floor(currentCount / 2);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error persisting document cache:', error);
    }
  }, [cache]);

  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();

      const cacheSize = Object.keys(cache).length;
      if (cacheSize > MAX_CACHE_ITEMS) {
        setCache(prevCache => {
          const sorted = Object.entries(prevCache)
            .sort(([_, a], [__, b]) => b.timestamp - a.timestamp)
            .slice(0, MAX_CACHE_ITEMS);

          const newCache = sorted.reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {} as Record<string, CachedDocument>);

          Object.entries(prevCache).forEach(([key, value]) => {
            if (!(key in newCache) && value?.url) {
              try {
                URL.revokeObjectURL(value.url);
              } catch (e) {
                console.error('Error revoking URL:', e);
              }
            }
          });

          return newCache;
        });
      }

      setCache(prevCache => {
        const newCache = { ...prevCache };
        let hasChanges = false;

        Object.entries(newCache).forEach(([key, value]) => {
          if (
            !value ||
            !value.timestamp ||
            now - value.timestamp > CACHE_EXPIRATION
          ) {
            if (value?.url) {
              try {
                URL.revokeObjectURL(value.url);
              } catch (e) {
                console.error('Error revoking URL:', e);
              }
            }
            delete newCache[key];
            hasChanges = true;
          }
        });

        return hasChanges ? newCache : prevCache;
      });
    };

    cleanup();

    const interval = setInterval(cleanup, 10 * 60 * 1000);

    return () => {
      clearInterval(interval);
      Object.values(cache).forEach(item => {
        if (item?.url) {
          try {
            URL.revokeObjectURL(item.url);
          } catch (e) {
            console.error('Error revoking URL:', e);
          }
        }
      });
    };
  }, [cache]);

  const cacheDocument = useCallback((key: string, url: string, data?: Blob) => {
    if (!key || !url) return;

    setCache(prev => {
      if (prev[key] && prev[key].url === url) return prev;

      let mimeType = undefined;
      if (
        key.toLowerCase().endsWith('.pdf') ||
        key.toLowerCase().includes('.pdf.')
      ) {
        mimeType = 'application/pdf';
      } else if (
        key.toLowerCase().endsWith('.jpg') ||
        key.toLowerCase().endsWith('.jpeg')
      ) {
        mimeType = 'image/jpeg';
      } else if (key.toLowerCase().endsWith('.png')) {
        mimeType = 'image/png';
      }

      let blobUrl = url;
      if (data && mimeType && !url.startsWith('blob:')) {
        try {
          const newBlob = new Blob([data], { type: mimeType });
          blobUrl = URL.createObjectURL(newBlob);
        } catch (e) {
          console.error('Error creating blob with mime type:', e);
        }
      }

      const newCache = {
        ...prev,
        [key]: {
          url: blobUrl,
          timestamp: Date.now(),
          data,
          mimeType,
        },
      };

      return newCache;
    });
  }, []);

  const getCachedDocument = useCallback(
    (key: string): string | null => {
      if (!key) return null;

      const item = cache[key];
      if (item?.url && Date.now() - item.timestamp < CACHE_EXPIRATION) {
        if (
          key.toLowerCase().endsWith('.pdf') ||
          key.toLowerCase().includes('.pdf.')
        ) {
          try {
            return item.url;
          } catch (e) {
            console.error('Error validating cached PDF URL:', e);
            return null;
          }
        }
        return item.url;
      }
      return null;
    },
    [cache]
  );

  const isDocumentCached = useCallback(
    (key: string): boolean => {
      return !!getCachedDocument(key);
    },
    [getCachedDocument]
  );

  const removeCachedDocument = useCallback((key: string) => {
    if (!key) return;

    setCache(prev => {
      if (!prev[key]) return prev;

      const newCache = { ...prev };
      if (newCache[key]?.url) {
        try {
          URL.revokeObjectURL(newCache[key].url);
        } catch (e) {
          console.error('Error revoking URL:', e);
        }
      }
      delete newCache[key];
      return newCache;
    });
  }, []);

  const clearCache = useCallback(() => {
    Object.values(cache).forEach(item => {
      if (item?.url) {
        try {
          URL.revokeObjectURL(item.url);
        } catch (e) {
          console.error('Error revoking URL:', e);
        }
      }
    });
    setCache({});

    if (storageAvailable.current) {
      try {
        sessionStorage.removeItem('documentCache');
      } catch (e) {
        console.error('Error clearing session storage:', e);
      }
    }
  }, [cache]);

  return {
    cacheDocument,
    getCachedDocument,
    isDocumentCached,
    removeCachedDocument,
    clearCache,
  };
};
