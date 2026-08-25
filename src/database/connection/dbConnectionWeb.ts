import type sql from 'mssql';
import config from '../../config';
import { getOrCreatePool } from './getOrCreatePool';

/**
 * Gets a web tenant pool using the credentials from application configuration.
 * @param server Tenant SQL Server host.
 * @param base Tenant database name.
 * @returns A connected pool for the web authentication context.
 * @throws The connection error or an error when all 10 tenant slots are reserved.
 */

export const dbConnectionWeb = async (server: string, base: string): Promise<sql.ConnectionPool> =>
    getOrCreatePool(server, base, {
        authenticationContext: 'web',
        user: config.dbUser,
        password: config.dbPassword,
    });
