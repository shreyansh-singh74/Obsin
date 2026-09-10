import { db } from '@/db';

const OBSIN_CACHE_PREFIX = 'obsin-';

/** Delete only CacheStorage entries owned by Obsin. */
export async function purgeObsinCaches(): Promise<void> {
  if (typeof caches === 'undefined') return;

  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter((name) => name.startsWith(OBSIN_CACHE_PREFIX))
      .map((name) => caches.delete(name)),
  );
}

/** Remove all local vault data and app-owned caches from this browser. */
export async function eraseObsinLocalData(): Promise<void> {
  await Promise.all([db.delete(), purgeObsinCaches()]);
}
