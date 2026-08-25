import { getTenantPoolEntries, removeTenantPoolEntry } from './getOrCreatePool';

/** Closes and removes tenant pools that SQL Server has marked as disconnected. */
export const cleanupDisconnectedPools = (): void => {
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

const disconnectedPoolCleanupInterval = setInterval(cleanupDisconnectedPools, 300_000);
disconnectedPoolCleanupInterval.unref();
