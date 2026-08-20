import { beforeAll } from '@jest/globals';
import { setImmediate } from 'node:timers/promises';

import { dbConnectionMain } from '../../../src/database/connection';
import { parseDeploymentArguments } from '../../../src/database/sqlDeployment/cli';
import { runDeploymentCli } from '../../../src/database/sqlDeployment/deploy';
import { deployToTenants } from '../../../src/database/sqlDeployment/deployToTenants';
import { getTenants } from '../../../src/database/sqlDeployment/getTenants';
import {
    printDeploymentResult,
    printDeploymentStart,
    printDryRun,
    printResults,
    printTenantStart
} from '../../../src/database/sqlDeployment/output';
import { resolveSqlObjects } from '../../../src/database/sqlDeployment/resolveSqlObjects';
import type {
    DeploymentResult,
    SqlObjectDefinition,
    TenantDatabase
} from '../../../src/database/sqlDeployment/types';

jest.mock('../../../src/database/connection', () => ({
    dbConnectionMain: jest.fn(() => Promise.resolve({ close: jest.fn().mockResolvedValue(undefined) }))
}));

jest.mock('../../../src/database/sqlDeployment/cli', () => ({
    parseDeploymentArguments: jest.fn(() => ({ clientIds: [], objectNames: [], dryRun: true }))
}));

jest.mock('../../../src/database/sqlDeployment/getTenants', () => ({
    getTenants: jest.fn().mockResolvedValue([])
}));

jest.mock('../../../src/database/sqlDeployment/resolveSqlObjects', () => ({
    resolveSqlObjects: jest.fn().mockResolvedValue([])
}));

jest.mock('../../../src/database/sqlDeployment/deployToTenants', () => ({
    deployToTenants: jest.fn().mockResolvedValue([])
}));

jest.mock('../../../src/database/sqlDeployment/output', () => ({
    printDeploymentResult: jest.fn(),
    printDeploymentStart: jest.fn(),
    printDryRun: jest.fn(),
    printResults: jest.fn(),
    printTenantStart: jest.fn()
}));

const tenant: TenantDatabase = {
    clientId: 4,
    server: 'SQL04',
    database: 'TENANT_4'
};

const sqlObject: SqlObjectDefinition = {
    name: 'sp_Save',
    type: 'procedure',
    filePath: '/procedures/sp_Save.sql',
    sql: 'CREATE PROCEDURE sp_Save AS SELECT 1'
};

describe('runDeploymentCli', () => {
    const parseDeploymentArgumentsMock = parseDeploymentArguments as jest.MockedFunction<
        typeof parseDeploymentArguments
    >;
    const dbConnectionMainMock = dbConnectionMain as jest.MockedFunction<typeof dbConnectionMain>;
    const getTenantsMock = getTenants as jest.MockedFunction<typeof getTenants>;
    const resolveSqlObjectsMock = resolveSqlObjects as jest.MockedFunction<typeof resolveSqlObjects>;
    const deployToTenantsMock = deployToTenants as jest.MockedFunction<typeof deployToTenants>;
    const originalExitCode = process.exitCode;

    beforeAll(async () => {
        // deploy.ts is also the executable entrypoint, so let its import-time invocation settle.
        await setImmediate();
        jest.clearAllMocks();
    });

    beforeEach(() => {
        parseDeploymentArgumentsMock.mockReturnValue({
            clientIds: [tenant.clientId],
            objectNames: [sqlObject.name],
            dryRun: false
        });
        getTenantsMock.mockResolvedValue([tenant]);
        resolveSqlObjectsMock.mockResolvedValue([sqlObject]);
        deployToTenantsMock.mockResolvedValue([]);
    });

    afterEach(() => {
        process.exitCode = originalExitCode;
    });

    it('closes discovery resources and prints a dry run without deploying', async () => {
        const close = jest.fn<Promise<void>, []>().mockResolvedValue(undefined);
        dbConnectionMainMock.mockResolvedValue({ close } as unknown as Awaited<
            ReturnType<typeof dbConnectionMain>
        >);
        parseDeploymentArgumentsMock.mockReturnValue({
            clientIds: [tenant.clientId],
            objectNames: [sqlObject.name],
            dryRun: true
        });

        await runDeploymentCli(['--clients', '4', '--objects', 'sp_Save', '--dry-run']);

        expect(parseDeploymentArgumentsMock).toHaveBeenCalledWith([
            '--clients', '4', '--objects', 'sp_Save', '--dry-run'
        ]);
        expect(getTenantsMock).toHaveBeenCalledWith([tenant.clientId]);
        expect(close).toHaveBeenCalledTimes(1);
        expect(resolveSqlObjectsMock).toHaveBeenCalledWith([sqlObject.name]);
        expect(printDryRun).toHaveBeenCalledWith([tenant], [sqlObject]);
        expect(deployToTenantsMock).not.toHaveBeenCalled();
        expect(process.exitCode).toBe(0);
    });

    it('deploys with progress callbacks, prints results, and sets a failure exit code', async () => {
        const close = jest.fn<Promise<void>, []>().mockResolvedValue(undefined);
        dbConnectionMainMock.mockResolvedValue({ close } as unknown as Awaited<
            ReturnType<typeof dbConnectionMain>
        >);
        const results: DeploymentResult[] = [{
            tenant,
            object: sqlObject,
            status: 'failed',
            error: 'invalid SQL'
        }];
        deployToTenantsMock.mockResolvedValue(results);

        await runDeploymentCli(['--clients', '4', '--objects', 'sp_Save']);

        expect(printDeploymentStart).toHaveBeenCalledWith([tenant], [sqlObject]);
        expect(deployToTenantsMock).toHaveBeenCalledWith([tenant], [sqlObject], {
            onTenantStart: printTenantStart,
            onResult: printDeploymentResult
        });
        expect(printResults).toHaveBeenCalledWith(results);
        expect(process.exitCode).toBe(1);
    });

    it('sets a successful exit code when every deployment succeeds', async () => {
        dbConnectionMainMock.mockResolvedValue({
            close: jest.fn().mockResolvedValue(undefined)
        } as unknown as Awaited<ReturnType<typeof dbConnectionMain>>);
        deployToTenantsMock.mockResolvedValue([{
            tenant,
            object: sqlObject,
            status: 'success'
        }]);

        await runDeploymentCli([]);

        expect(process.exitCode).toBe(0);
    });

    it('wraps and redacts a main connection failure before tenant discovery', async () => {
        dbConnectionMainMock.mockRejectedValue(new Error('user=admin;password=secret'));

        await expect(runDeploymentCli([])).rejects.toThrow(
            'Main database connection failed: user=<redacted>;password=<redacted>'
        );
        expect(getTenantsMock).not.toHaveBeenCalled();
        expect(resolveSqlObjectsMock).not.toHaveBeenCalled();
    });

    it('preserves a tenant discovery failure even when pool cleanup also fails', async () => {
        const discoveryFailure = new Error('tenant lookup failed');
        dbConnectionMainMock.mockResolvedValue({
            close: jest.fn().mockRejectedValue(new Error('password=secret'))
        } as unknown as Awaited<ReturnType<typeof dbConnectionMain>>);
        getTenantsMock.mockRejectedValue(discoveryFailure);

        await expect(runDeploymentCli([])).rejects.toBe(discoveryFailure);
        expect(resolveSqlObjectsMock).not.toHaveBeenCalled();
    });

    it('reports a redacted cleanup failure and stops before resolving SQL objects', async () => {
        dbConnectionMainMock.mockResolvedValue({
            close: jest.fn().mockRejectedValue(new Error('user=admin'))
        } as unknown as Awaited<ReturnType<typeof dbConnectionMain>>);

        await expect(runDeploymentCli([])).rejects.toThrow(
            'Main database cleanup failed: user=<redacted>'
        );
        expect(resolveSqlObjectsMock).not.toHaveBeenCalled();
        expect(deployToTenantsMock).not.toHaveBeenCalled();
    });
});
