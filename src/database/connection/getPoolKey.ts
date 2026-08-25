import { normalizeDatabaseLocation } from './normalizeDatabaseLocation';

/**
 * Returns a normalized, non-secret identifier for a tenant database location.
 * @param server Tenant SQL Server host.
 * @param base Tenant database name.
 * @returns The normalized server and database identifier.
 */
export const getPoolKey = (server: string, base: string): string => {
    const location = normalizeDatabaseLocation(server, base);
    return `${location.server}-${location.database}`;
};
