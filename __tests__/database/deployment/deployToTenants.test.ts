import sql from 'mssql';

import { createTenantConfig } from '../../../src/database/sqlDeployment/createTenantConfig';
import { deployToTenants } from '../../../src/database/sqlDeployment/deployToTenants';
import type { SqlObjectDefinition, TenantDatabase } from '../../../src/database/sqlDeployment/types';

jest.mock('mssql', () => ({
    __esModule: true,
    default: {
        ConnectionPool: jest.fn()
    }
}));

jest.mock('../../../src/database/sqlDeployment/createTenantConfig', () => ({
    createTenantConfig: jest.fn()
}));

interface PoolDouble {
    connect: jest.Mock<Promise<void>, []>;
    request: jest.Mock<{ batch: jest.Mock<Promise<void>, [string]> }, []>;
    batch: jest.Mock<Promise<void>, [string]>;
    close: jest.Mock<Promise<void>, []>;
}

const tenants: TenantDatabase[] = [
    { clientId: 1, server: 'SQL01', database: 'TENANT_1' },
    { clientId: 2, server: 'SQL02', database: 'TENANT_2' }
];

const sqlObjects: SqlObjectDefinition[] = [
    {
        name: 'sp_UpdateProducts',
        type: 'procedure',
        filePath: '/procedures/sp_UpdateProducts.sql',
        sql: 'CREATE OR ALTER PROCEDURE sp_UpdateProducts AS SELECT 1'
    },
    {
        name: 'fn_GetPrice',
        type: 'function',
        filePath: '/functions/fn_GetPrice.sql',
        sql: 'CREATE OR ALTER FUNCTION fn_GetPrice() RETURNS INT AS BEGIN RETURN 1 END'
    }
];

const createPool = (): PoolDouble => {
    const batch = jest.fn<Promise<void>, [string]>().mockResolvedValue(undefined);

    return {
        connect: jest.fn<Promise<void>, []>().mockResolvedValue(undefined),
        request: jest.fn(() => ({ batch })),
        batch,
        close: jest.fn<Promise<void>, []>().mockResolvedValue(undefined)
    };
};

describe('deployToTenants', () => {
    const ConnectionPool = sql.ConnectionPool as unknown as jest.Mock;
    const createTenantConfigMock = createTenantConfig as jest.MockedFunction<typeof createTenantConfig>;

    beforeEach(() => {
        createTenantConfigMock.mockImplementation((tenant) => ({
            server: tenant.server,
            database: tenant.database
        }));
    });

    it('deploys every object to each tenant and reports successful results in order', async () => {
        const pools = tenants.map(() => createPool());
        ConnectionPool.mockImplementationOnce(() => pools[0]).mockImplementationOnce(() => pools[1]);
        const onTenantStart = jest.fn();
        const onResult = jest.fn();

        const results = await deployToTenants(tenants, sqlObjects, { onTenantStart, onResult });

        expect(createTenantConfigMock.mock.calls).toEqual([[tenants[0]], [tenants[1]]]);
        expect(pools[0].batch.mock.calls).toEqual(sqlObjects.map(({ sql: statement }) => [statement]));
        expect(pools[1].batch.mock.calls).toEqual(sqlObjects.map(({ sql: statement }) => [statement]));
        expect(results).toEqual([
            { tenant: tenants[0], object: sqlObjects[0], status: 'success' },
            { tenant: tenants[0], object: sqlObjects[1], status: 'success' },
            { tenant: tenants[1], object: sqlObjects[0], status: 'success' },
            { tenant: tenants[1], object: sqlObjects[1], status: 'success' }
        ]);
        expect(onTenantStart.mock.calls).toEqual([[tenants[0]], [tenants[1]]]);
        expect(onResult.mock.calls).toEqual(results.map((result) => [result]));
        expect(pools[0].close).toHaveBeenCalledTimes(1);
        expect(pools[1].close).toHaveBeenCalledTimes(1);
    });

    it('records an object failure and continues deploying later objects', async () => {
        const pool = createPool();
        const firstBatch = jest.fn<Promise<void>, [string]>()
            .mockRejectedValue(new Error('password=secret; invalid SQL'));
        const secondBatch = jest.fn<Promise<void>, [string]>().mockResolvedValue(undefined);
        pool.request
            .mockImplementationOnce(() => ({ batch: firstBatch }))
            .mockImplementationOnce(() => ({ batch: secondBatch }));
        ConnectionPool.mockImplementation(() => pool);

        const results = await deployToTenants([tenants[0]], sqlObjects);

        expect(results).toEqual([
            {
                tenant: tenants[0],
                object: sqlObjects[0],
                status: 'failed',
                error: 'password=<redacted>; invalid SQL'
            },
            { tenant: tenants[0], object: sqlObjects[1], status: 'success' }
        ]);
        expect(secondBatch).toHaveBeenCalledWith(sqlObjects[1].sql);
        expect(pool.close).toHaveBeenCalledTimes(1);
    });

    it('marks every object failed when a tenant connection fails and then tries to close the pool', async () => {
        const pool = createPool();
        pool.connect.mockRejectedValue(new Error('Login failed for user=admin'));
        ConnectionPool.mockImplementation(() => pool);
        const onResult = jest.fn();

        const results = await deployToTenants([tenants[0]], sqlObjects, { onResult });

        expect(pool.request).not.toHaveBeenCalled();
        expect(results).toEqual(sqlObjects.map((object) => ({
            tenant: tenants[0],
            object,
            status: 'failed',
            error: 'Tenant connection failed: Login failed for user=<redacted>'
        })));
        expect(onResult.mock.calls).toEqual(results.map((result) => [result]));
        expect(pool.close).toHaveBeenCalledTimes(1);
    });

    it('ignores a pool close failure and continues with the next tenant', async () => {
        const firstPool = createPool();
        const secondPool = createPool();
        firstPool.close.mockRejectedValue(new Error('close failed'));
        ConnectionPool
            .mockImplementationOnce(() => firstPool)
            .mockImplementationOnce(() => secondPool);

        const results = await deployToTenants(tenants, [sqlObjects[0]]);

        expect(results).toEqual([
            { tenant: tenants[0], object: sqlObjects[0], status: 'success' },
            { tenant: tenants[1], object: sqlObjects[0], status: 'success' }
        ]);
        expect(secondPool.connect).toHaveBeenCalledTimes(1);
        expect(secondPool.close).toHaveBeenCalledTimes(1);
    });
});
