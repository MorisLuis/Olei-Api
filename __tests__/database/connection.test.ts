const poolInstances: MockPool[] = [];
let connectImplementation = (pool: MockPool): Promise<MockPool> => Promise.resolve(pool);

class MockPool {
    public connected = false;
    public close = jest.fn(() => {
        this.connected = false;
        return Promise.resolve();
    });
    public config: Record<string, unknown>;

    constructor(config: Record<string, unknown>) {
        this.config = config;
        poolInstances.push(this);
    }

    public connect(): Promise<MockPool> {
        return connectImplementation(this);
    }
}

jest.mock('mssql', () => ({
    __esModule: true,
    default: { ConnectionPool: MockPool },
}));

jest.mock('../../src/config', () => ({
    __esModule: true,
    default: {
        dbUser: 'configured-user',
        dbPassword: 'configured-password',
        dbServer: ' main-server ',
        dbDatabase: ' main-database ',
    },
}));

import {
    closeAllDatabaseConnections,
    dbConnection,
    dbConnectionMain,
    dbConnectionWeb,
    getPoolKey,
} from '../../src/database/connection';

describe('database connections', () => {
    beforeEach(async () => {
        await closeAllDatabaseConnections();
        poolInstances.length = 0;
        connectImplementation = pool => {
            pool.connected = true;
            return Promise.resolve(pool);
        };
        jest.clearAllMocks();
    });

    it('normalizes keys and reuses a compatible pool', async () => {
        const first = await dbConnection(' tenant ', ' database ', 'app-user', 'app-password');
        const second = await dbConnection('tenant', 'database', 'app-user', 'app-password');

        expect(getPoolKey(' tenant ', ' database ')).toBe('tenant-database');
        expect(second).toBe(first);
        expect(poolInstances).toHaveLength(1);
        expect(poolInstances[0].config).toMatchObject({ server: 'tenant', database: 'database' });
    });

    it('keeps app and web credential contexts separate', async () => {
        await dbConnection('tenant', 'database', 'configured-user', 'configured-password');
        await dbConnectionWeb('tenant', 'database');

        expect(poolInstances).toHaveLength(2);
    });

    it('shares an in-flight connection between simultaneous requests', async () => {
        let finishConnection!: () => void;
        connectImplementation = pool => new Promise(resolve => {
            finishConnection = () => { pool.connected = true; resolve(pool); };
        });

        const first = dbConnectionWeb('tenant', 'database');
        const second = dbConnectionWeb('tenant', 'database');
        expect(poolInstances).toHaveLength(1);
        finishConnection();
        expect(await second).toBe(await first);
    });

    it('removes a failed connection so it can be retried', async () => {
        const failure = new Error('connection failed');
        connectImplementation = () => Promise.reject(failure);
        await expect(dbConnectionWeb('tenant', 'database')).rejects.toBe(failure);

        connectImplementation = pool => {
            pool.connected = true;
            return Promise.resolve(pool);
        };
        await expect(dbConnectionWeb('tenant', 'database')).resolves.toBe(poolInstances[1]);
        expect(poolInstances).toHaveLength(2);
    });

    it('enforces the tenant pool limit while connections are pending', async () => {
        const finishConnections: Array<() => void> = [];
        connectImplementation = pool => new Promise(resolve => {
            finishConnections.push(() => { pool.connected = true; resolve(pool); });
        });
        const connections: Array<Promise<unknown>> = [];
        for (let index = 0; index < 10; index += 1) {
            connections.push(dbConnectionWeb(`tenant-${index}`, 'database'));
        }

        await expect(dbConnectionWeb('tenant-10', 'database')).rejects.toThrow('Límite de conexiones');
        expect(poolInstances).toHaveLength(10);
        finishConnections.forEach(finish => finish());
        await Promise.all(connections);
    });

    it('replaces and closes a disconnected cached pool', async () => {
        const first = await dbConnectionWeb('tenant', 'database');
        (first as unknown as MockPool).connected = false;
        const second = await dbConnectionWeb('tenant', 'database');

        expect(second).not.toBe(first);
        expect(first.close).toHaveBeenCalledTimes(1);
    });

    it('closes tenant and main pools during cleanup', async () => {
        const tenant = await dbConnectionWeb('tenant', 'database');
        const main = await dbConnectionMain();
        await closeAllDatabaseConnections();

        expect(tenant.close).toHaveBeenCalledTimes(1);
        expect(main.close).toHaveBeenCalledTimes(1);
    });
});
