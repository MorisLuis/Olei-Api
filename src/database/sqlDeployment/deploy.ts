import type { ConnectionPool } from 'mssql';

import { dbConnectionMain } from '../connection';
import { deployToTenants } from './deployToTenants';
import { getTenants } from './getTenants';
import { resolveSqlObjects } from './resolveSqlObjects';
import { parseDeploymentArguments } from './cli';
import { getDeploymentErrorMessage } from './errors';
import {
    printDeploymentResult,
    printDeploymentStart,
    printDryRun,
    printResults,
    printTenantStart
} from './output';
import type { TenantDatabase } from './types';


/**
 * @description Runs the deployment CLI with the provided arguments.
 * @example
 * await runDeploymentCli(['--clientIds', '1,2,3', '--objectNames', 'Object1,Object2', '--dryRun']);
 * output: 
 * Starting deployment
 * Tenants: 3
 * SQL objects: 2
 *
 * Deploying to Client 1 (Database1)
 *   Object1  ✅
 *   Object2  ❌
 *
 * Deploying to Client 2 (Database2)
 *   Object1  ✅
 *   Object2  ✅
 *
 * Deploying to Client 3 (Database3)
 *   Object1  ❌
 *   Object2  ✅
 *
 * Deployment completed
 *
 * Successful: 4
 * Failed: 2
 * Total: 6
 * 
 * @throws {Error} If the main database connection fails.
 * @throws {Error} If tenant discovery fails.
 * @throws {Error} If cleanup of the main database connection fails.
 * @throws {Error} If deployment to any tenant fails.
 * @param {string[]} args - The command-line arguments for the deployment CLI.
 * @returns {Promise<void>} A promise that resolves when the deployment process is complete.
 */

export const runDeploymentCli = async (args: string[]): Promise<void> => {

    const options = parseDeploymentArguments(args);
    let mainPool: ConnectionPool | null = null;
    let tenants: TenantDatabase[] = [];
    let discoveryError: unknown;
    let discoveryFailed = false;
    let cleanupError: Error | undefined;

    try {

        try {
            mainPool = await dbConnectionMain();
        } catch (error) {
            throw new Error(`Main database connection failed: ${getDeploymentErrorMessage(error)}`);
        }

        tenants = await getTenants(options.clientIds);
    } catch (error) {
        discoveryFailed = true;
        discoveryError = error;
    } finally {
        if (mainPool) {
            try {
                await mainPool.close();
            } catch (error) {
                cleanupError = new Error(
                    `Main database cleanup failed: ${getDeploymentErrorMessage(error)}`
                );
            }
        }
    }

    if (discoveryFailed) {
        throw discoveryError;
    }

    if (cleanupError) {
        throw cleanupError;
    }

    const sqlObjects = await resolveSqlObjects(options.objectNames);


    if (options.dryRun) {
        printDryRun(tenants, sqlObjects);
        process.exitCode = 0;
        return;
    }


    printDeploymentStart(tenants, sqlObjects);
    const results = await deployToTenants(tenants, sqlObjects, {
        onTenantStart: printTenantStart,
        onResult: printDeploymentResult
    });
    printResults(results);
    process.exitCode = results.some(result => result.status === 'failed') ? 1 : 0;
};
