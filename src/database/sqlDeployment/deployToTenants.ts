import sql from 'mssql';

import { createTenantConfig } from './createTenantConfig';
import { getDeploymentErrorMessage } from './errors';
import type { SqlObjectDefinition, TenantDatabase, DeploymentProgressCallbacks, DeploymentResult } from './types';

/**
 * @description Deploys SQL objects to multiple tenant databases.
 * @example
 * const result = await deployToTenants(tenants, sqlObjects, {
 *   onTenantStart: (tenant) => console.log(`Starting deployment for tenant: ${tenant.name}`),
 *   onResult: (result) => console.log(`Deployment result for ${result.tenant.name}: ${result.status}`)
 * });
 * console.log(result);
 * output: [
 *   { tenant: { name: 'Tenant1' }, object: { name: 'Object1' }, status: 'success' },
 *   { tenant: { name: 'Tenant1' }, object: { name: 'Object2' }, status: 'failed', error: 'Error message' },
 *   ...
 * ]
 * @param tenants - An array of tenant database configurations.
 * @param sqlObjects - An array of SQL object definitions to be deployed.
 * @param progress - Optional callbacks for tracking deployment progress.
 * @returns A promise that resolves to an array of deployment results.
 */

export const deployToTenants = async (
    tenants: TenantDatabase[],
    sqlObjects: SqlObjectDefinition[],
    progress: DeploymentProgressCallbacks = {}
): Promise<DeploymentResult[]> => {
    const results: DeploymentResult[] = [];

    for (const tenant of tenants) {
        let pool: sql.ConnectionPool | null = null;
        progress.onTenantStart?.(tenant);

        try {
            pool = new sql.ConnectionPool(createTenantConfig(tenant));
            await pool.connect();

            for (const object of sqlObjects) {
                try {
                    await pool.request().batch(object.sql);
                    const result: DeploymentResult = { tenant, object, status: 'success' };
                    results.push(result);
                    progress.onResult?.(result);
                } catch (error) {
                    const result: DeploymentResult = {
                        tenant,
                        object,
                        status: 'failed',
                        error: getDeploymentErrorMessage(error)
                    };
                    results.push(result);
                    progress.onResult?.(result);
                }
            }
        } catch (error) {
            const connectionError = `Tenant connection failed: ${getDeploymentErrorMessage(error)}`;

            for (const object of sqlObjects) {
                const result: DeploymentResult = {
                    tenant,
                    object,
                    status: 'failed',
                    error: connectionError
                };
                results.push(result);
                progress.onResult?.(result);
            }
        } finally {
            if (pool) {
                try {
                    await pool.close();
                } catch {
                    // A close failure must not replace deployment errors or stop later tenants.
                }
            }
        }
    }

    return results;
};
