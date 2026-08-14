import type sql from 'mssql';

import config from '../config';
import type { TenantDatabase } from '../interface/tenant';

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
