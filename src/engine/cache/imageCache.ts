const IMAGE_CACHE_NAME = 'obsin-images-v1';
const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Fetches an image with Cache Storage API support.
 * First checks the cache, then fetches from network and caches the response.
 */
export async function fetchCachedImage(
  url: string,
  token?: string
): Promise<string> {
  // Check if Cache API is available
  if (!('caches' in window)) {
    return fetchImageAsDataUrl(url, token);
  }

  try {
    const cache = await caches.open(IMAGE_CACHE_NAME);
    const cachedResponse = await cache.match(url);

    if (cachedResponse) {
      // Check if cache entry is still fresh
      const cachedAtHeader = cachedResponse.headers.get('x-cached-at');
      if (cachedAtHeader) {
        const cachedAt = parseInt(cachedAtHeader, 10);
        if (Date.now() - cachedAt < CACHE_MAX_AGE_MS) {
          return cachedResponse.clone().text();
        }
      }
      // Cache expired or no timestamp — re-fetch
    }

    // Fetch from network
    const response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const blob = await response.blob();
    const dataUrl = await blobToDataUrl(blob);

    // Cache the data URL response
    const cacheHeaders = new Headers({
      'Content-Type': blob.type || 'image/png',
      'x-cached-at': Date.now().toString(),
    });

    const cacheResponse = new Response(dataUrl, {
      headers: cacheHeaders,
    });

    await cache.put(url, cacheResponse);

    return dataUrl;
  } catch (err) {
    console.warn('Cache fetch failed, falling back to direct fetch:', err);
    return fetchImageAsDataUrl(url, token);
  }
}

/**
 * Fetches an image and converts it to a data URL (fallback when Cache API unavailable).
 */
async function fetchImageAsDataUrl(url: string, token?: string): Promise<string> {
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }

  const blob = await response.blob();
  return blobToDataUrl(blob);
}

/**
 * Converts a Blob to a data URL.
 */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Clears all cached images.
 */
export async function clearImageCache(): Promise<void> {
  if (!('caches' in window)) return;

  try {
    await caches.delete(IMAGE_CACHE_NAME);
  } catch (err) {
    console.warn('Failed to clear image cache:', err);
  }
}

/**
 * Gets the size of the image cache in bytes (approximate).
 */
export async function getImageCacheSize(): Promise<number> {
  if (!('caches' in window)) return 0;

  try {
    const cache = await caches.open(IMAGE_CACHE_NAME);
    const keys = await cache.keys();
    let totalSize = 0;

    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const text = await response.text();
        totalSize += text.length;
      }
    }

    return totalSize;
  } catch {
    return 0;
  }
}
