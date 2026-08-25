import sql from 'mssql';

import { NotFoundError, ValidationError } from '../../errors/CustomError';
import { dbConnectionMain } from '../connection';
import { getTenantsQuery } from '../querys/tenants';
import type { TenantDatabase, TenantDatabaseRow } from './types';

const MAX_SQL_INT = 2_147_483_647;

/**
 * @description Retrieves tenant database information for the specified client IDs.
 * @example
 * const clientIds = [1, 2, 3];
 * const tenants = await getTenants(clientIds);
 * output: [
 *   { clientId: 1, server: 'server1', database: 'db1' },
 *   { clientId: 2, server: 'server2', database: 'db2' },
 *   { clientId: 3, server: 'server3', database: 'db3' }
 * ]
 * @throws {ValidationError} If any client ID is not a positive SQL Server integer.
 * @throws {NotFoundError} If any client ID cannot be resolved to a tenant database.
 * @throws {ValidationError} If any tenant database has missing server or database configuration.
 * @returns {Promise<TenantDatabase[]>} An array of tenant database information.
 */

export const getTenants = async (clientIds: number[]): Promise<TenantDatabase[]> => {

    if (!Array.isArray(clientIds) || clientIds.some(id =>
        !Number.isSafeInteger(id) || id <= 0 || id > MAX_SQL_INT
    )) {
        throw new ValidationError('Client IDs must be positive SQL Server integers');
    }

    const selectedClientIds = [...new Set(clientIds)];

    if (selectedClientIds.length === 0) {
        return [];
    }

    const parameterNames = selectedClientIds.map((_, index) => `clientId${index}`);
    const request = (await dbConnectionMain()).request();

    selectedClientIds.forEach((clientId, index) => {
        request.input(parameterNames[index], sql.Int, clientId);
    });

    const result = await request.query<TenantDatabaseRow>(getTenantsQuery(parameterNames));
    const rowsByClientId = new Map(result.recordset.map(row => [row.Id_Cliente, row]));
    const missingClientIds = selectedClientIds.filter(clientId => !rowsByClientId.has(clientId));

    if (missingClientIds.length > 0) {
        throw new NotFoundError(`Could not resolve client IDs: ${missingClientIds.join(', ')}`);
    }

    const incompleteClientIds = selectedClientIds.filter(clientId => {
        const row = rowsByClientId.get(clientId);
        return !row?.ServidorSQL?.trim() || !row.BaseSQL?.trim();
    });

    if (incompleteClientIds.length > 0) {
        throw new ValidationError(
            `Missing server or database configuration for client IDs: ${incompleteClientIds.join(', ')}`
        );
    }

    return selectedClientIds.map(clientId => {
        const row = rowsByClientId.get(clientId);

        if (!row || !row.ServidorSQL || !row.BaseSQL) {
            throw new ValidationError(`Could not resolve client ID: ${clientId}`);
        }

        return {
            clientId: row.Id_Cliente,
            server: row.ServidorSQL.trim(),
            database: row.BaseSQL.trim()
        };
    });
};
