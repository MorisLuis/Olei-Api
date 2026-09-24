jest.mock('../../../src/config', () => ({
    __esModule: true,
    default: {
        dbUser: 'configured-user',
        dbPassword: 'configured-password',
        dbEncrypt: true,
        dbTrustServerCertificate: false,
    },
}));

import { createTenantConfig } from '../../../src/database/sqlDeployment/createTenantConfig';

describe('createTenantConfig', () => {
    it('uses the configured encrypted, certificate-verified SQL transport', () => {
        expect(createTenantConfig({
            clientId: 7,
            server: 'tenant-server',
            database: 'tenant-database',
        })).toEqual({
            user: 'configured-user',
            password: 'configured-password',
            server: 'tenant-server',
            database: 'tenant-database',
            options: {
                encrypt: true,
                trustServerCertificate: false,
            },
        });
    });
});
