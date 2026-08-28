import type sql from 'mssql';

import config from '../../config';
import type { TenantDatabase } from './types';

/**
 * @description Creates a SQL connection configuration for a given tenant database.
 * @example
 * const tenant: TenantDatabase = {
 *   clientId: 1,
 *   server: 'localhost',
 *   database: 'TenantDB'
 * };
 * const config = createTenantConfig(tenant);
 * console.log(config);
 * output: {
 *   user: 'dbUser',
 *   password: 'dbPassword',
 *   server: 'localhost',
 *   database: 'TenantDB',
 *   options: {
 *     encrypt: true,
 *     trustServerCertificate: true
 *   }
 * }
 * @param tenant - The tenant database configuration. 
 * @returns A SQL connection configuration object for the tenant database.
 */

export const createTenantConfig = (tenant: TenantDatabase): sql.config => ({
    user: config.dbUser,
    password: config.dbPassword,
    server: tenant.server,
    database: tenant.database,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
});
