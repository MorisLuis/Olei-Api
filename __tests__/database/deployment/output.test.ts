import type { DeploymentResult, SqlObjectDefinition, TenantDatabase } from '../../../src/database/sqlDeployment/types';
import {
    printDeploymentResult,
    printDeploymentStart,
    printDryRun,
    printResults,
    printTenantStart
} from '../../../src/database/sqlDeployment/output';

const tenant: TenantDatabase = {
    clientId: 5,
    server: 'SERVER02',
    database: 'DATABASE_5'
};

const sqlObject: SqlObjectDefinition = {
    name: 'fn_GetPrice',
    type: 'function',
    filePath: '/objects/functions/fn_GetPrice.sql',
    sql: 'CREATE OR ALTER FUNCTION...'
};

describe('deployment output', () => {
    const log = jest.spyOn(console, 'log').mockImplementation();

    it('prints dry-run selection counts and the safety message', () => {
        printDryRun([tenant], [sqlObject]);

        expect(log).toHaveBeenCalledWith('DRY RUN\n');
        expect(log).toHaveBeenCalledWith('Selected tenants: 1\n');
        expect(log).toHaveBeenCalledWith('Selected SQL objects: 1\n');
        expect(log).toHaveBeenCalledWith('\nNo tenant databases were modified.');
    });

    it('prints deployment progress', () => {
        const result: DeploymentResult = { tenant, object: sqlObject, status: 'success' };

        printDeploymentStart([tenant], [sqlObject]);
        printTenantStart(tenant);
        printDeploymentResult(result);

        expect(log).toHaveBeenCalledWith('Starting deployment\n');
        expect(log).toHaveBeenCalledWith('Deploying to Client 5 (DATABASE_5)\n');
        expect(log).toHaveBeenCalledWith('-> fn_GetPrice  ✅');
    });

    it('prints totals and grouped failure details', () => {
        const results: DeploymentResult[] = [
            { tenant, object: sqlObject, status: 'success' },
            {
                tenant,
                object: { ...sqlObject, name: 'sp_GetProducts', type: 'procedure' },
                status: 'failed',
                error: "Invalid column name 'PrecioNuevo'"
            }
        ];

        printResults(results);

        expect(log).toHaveBeenCalledWith('Successful: 1');
        expect(log).toHaveBeenCalledWith('Failed: 1');
        expect(log).toHaveBeenCalledWith('Total: 2');
        expect(log).toHaveBeenCalledWith('Client 5 / DATABASE_5');
        expect(log).toHaveBeenCalledWith('  sp_GetProducts');
        expect(log).toHaveBeenCalledWith("  Invalid column name 'PrecioNuevo'");
    });
});
