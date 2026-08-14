import sql from 'mssql';

import { NotFoundError, ValidationError } from '../errors/CustomError';
import type { TenantDatabase } from '../interface/tenant';
import { dbConnectionMain } from './connection';
import { getTenantsQuery } from './querys/tenants';

interface TenantDatabaseRow {
    Id_Cliente: number;
    ServidorSQL: string | null;
    BaseSQL: string | null;
}

const MAX_SQL_INT = 2_147_483_647;

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
