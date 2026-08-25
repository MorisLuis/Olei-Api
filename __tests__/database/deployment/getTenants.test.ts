import sql from 'mssql';

import { dbConnectionMain } from '../../../src/database/connection';
import { getTenants } from '../../../src/database/sqlDeployment/getTenants';

jest.mock('mssql', () => ({
    __esModule: true,
    default: { Int: Symbol('Int') }
}));

jest.mock('../../../src/database/connection', () => ({
    dbConnectionMain: jest.fn()
}));

describe('getTenants', () => {
    const dbConnectionMainMock = dbConnectionMain as jest.MockedFunction<typeof dbConnectionMain>;
    const input = jest.fn().mockReturnThis();
    const query = jest.fn();
    const request = { input, query };

    beforeEach(() => {
        dbConnectionMainMock.mockResolvedValue({
            request: jest.fn(() => request)
        } as unknown as Awaited<ReturnType<typeof dbConnectionMain>>);
    });

    it('deduplicates IDs, binds SQL Int parameters, trims configuration, and preserves requested order', async () => {
        query.mockResolvedValue({
            recordset: [
                { Id_Cliente: 8, ServidorSQL: ' SQL08 ', BaseSQL: ' TENANT_8 ' },
                { Id_Cliente: 3, ServidorSQL: 'SQL03', BaseSQL: 'TENANT_3' }
            ]
        });

        const tenants = await getTenants([3, 8, 3]);

        expect(input.mock.calls).toEqual([
            ['clientId0', sql.Int, 3],
            ['clientId1', sql.Int, 8]
        ]);
        expect(query).toHaveBeenCalledWith(expect.stringContaining(
            'WHERE Id_Cliente IN (@clientId0, @clientId1)'
        ));
        expect(tenants).toEqual([
            { clientId: 3, server: 'SQL03', database: 'TENANT_3' },
            { clientId: 8, server: 'SQL08', database: 'TENANT_8' }
        ]);
    });

    it('returns immediately for an empty selection', async () => {
        await expect(getTenants([])).resolves.toEqual([]);

        expect(dbConnectionMainMock).not.toHaveBeenCalled();
    });

    it.each([0, -1, 1.5, Number.NaN, 2_147_483_648])(
        'rejects invalid client ID %s before connecting',
        async (clientId) => {
            await expect(getTenants([clientId]))
                .rejects.toThrow('Client IDs must be positive SQL Server integers');
            expect(dbConnectionMainMock).not.toHaveBeenCalled();
        }
    );

    it('reports all requested client IDs missing from the query result', async () => {
        query.mockResolvedValue({
            recordset: [{ Id_Cliente: 3, ServidorSQL: 'SQL03', BaseSQL: 'TENANT_3' }]
        });

        await expect(getTenants([3, 8, 9]))
            .rejects.toThrow('Could not resolve client IDs: 8, 9');
    });

    it('reports tenant rows with blank or absent connection configuration', async () => {
        query.mockResolvedValue({
            recordset: [
                { Id_Cliente: 3, ServidorSQL: '   ', BaseSQL: 'TENANT_3' },
                { Id_Cliente: 8, ServidorSQL: 'SQL08', BaseSQL: null }
            ]
        });

        await expect(getTenants([3, 8]))
            .rejects.toThrow('Missing server or database configuration for client IDs: 3, 8');
    });

    it('propagates database query failures', async () => {
        const failure = new Error('query unavailable');
        query.mockRejectedValue(failure);

        await expect(getTenants([3])).rejects.toBe(failure);
    });
});
