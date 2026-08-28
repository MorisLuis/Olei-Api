import type sql from 'mssql';
import config from '../../config';
import { getOrCreatePool } from './getOrCreatePool';

/**
 * Gets a mobile-app tenant pool, falling back to configured credentials for empty values.
 * @param server Tenant SQL Server host.
 * @param base Tenant database name.
 * @param user Tenant username.
 * @param pass Tenant password.
 * @returns A connected pool compatible with the supplied app credentials.
 * @throws The connection error or an error when all 10 tenant slots are reserved.
 */

export const dbConnection = async (
    server: string,
    base: string,
    user: string,
    pass: string,
): Promise<sql.ConnectionPool> => getOrCreatePool(server, base, {
    authenticationContext: 'app',
    user: user || config.dbUser,
    password: pass || config.dbPassword,
});
