import { clearInterval, setInterval } from 'node:timers';
import { getTenantPoolEntries, removeTenantPoolEntry } from './getOrCreatePool';

/**
 * Cleans up disconnected SQL Server pools from the tenant pool cache.
 * This function is called periodically to ensure that disconnected pools are removed and closed.
 */

const cleanupDisconnectedPools = (): void => {

    for (const [cacheKey, entries] of getTenantPoolEntries().entries()) {
        for (const entry of entries) {
            if (entry.pool && !entry.pool.connected) {
                removeTenantPoolEntry(cacheKey, entry);

                void entry.pool.close().catch(() => {
                    console.error('Error closing a disconnected SQL Server pool');
                });
            }
        }
    }

};

let disconnectedPoolCleanupInterval: ReturnType<typeof setInterval> | null = setInterval(
    cleanupDisconnectedPools,
    300_000,
);

disconnectedPoolCleanupInterval.unref();

export const stopDisconnectedPoolCleanup = (): void => {
    if (!disconnectedPoolCleanupInterval) return;
    clearInterval(disconnectedPoolCleanupInterval);
    disconnectedPoolCleanupInterval = null;
};
