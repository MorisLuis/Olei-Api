import type sql from 'mssql';
import { clearMainPool, getMainPool, getMainPoolConnection } from './dbConnectionMain';
import { clearTenantPoolEntries, getTenantPoolEntries } from './getOrCreatePool';
import { logger } from '../../helpers/logger';

/**
 * Closes and removes all tenant pools and the central-database pool.
 * @returns A promise settled after every available pool has finished closing.
 */
export const closeAllDatabaseConnections = async (): Promise<void> => {

    const entries = Array.from(getTenantPoolEntries().values()).flat();
    const pendingPools = entries.map(entry => entry.connecting).filter(
        (connection): connection is Promise<sql.ConnectionPool> => connection !== undefined,
    );

    const mainPoolConnection = getMainPoolConnection();
    if (mainPoolConnection) pendingPools.push(mainPoolConnection);

    const connectedPendingPools = (await Promise.allSettled(pendingPools))
        .filter((result): result is PromiseFulfilledResult<sql.ConnectionPool> => result.status === 'fulfilled')
        .map(result => result.value);

    const pools = entries.map(entry => entry.pool)
        .filter((pool): pool is sql.ConnectionPool => pool !== undefined);

    const mainPool = getMainPool();
    if (mainPool) pools.push(mainPool);

    clearTenantPoolEntries();
    clearMainPool();

    const closeResults = await Promise.allSettled(
        [...new Set([...pools, ...connectedPendingPools])].map(pool => pool.close()),
    );

    if (closeResults.some(result => result.status === 'rejected')) {
        logger.error('database.pool_cleanup_failed');
        throw new Error('Database connection cleanup failed');
    }
};
