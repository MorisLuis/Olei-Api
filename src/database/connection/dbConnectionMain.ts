import sql from 'mssql';
import config from '../../config';
import { normalizeDatabaseLocation } from './normalizeDatabaseLocation';

let mainPool: sql.ConnectionPool | null = null;
let mainPoolConnection: Promise<sql.ConnectionPool> | null = null;

export const getMainPool = (): sql.ConnectionPool | null => mainPool;
export const getMainPoolConnection = (): Promise<sql.ConnectionPool> | null => mainPoolConnection;
export const clearMainPool = (): void => {
    mainPool = null;
    mainPoolConnection = null;
};

/**
 * Gets the reusable central-database pool using application configuration.
 * @returns The connected central-database pool.
 * @throws The original SQL Server connection error.
 */

export const dbConnectionMain = async (): Promise<sql.ConnectionPool> => {

    if (mainPool?.connected) return mainPool;
    if (mainPoolConnection) return mainPoolConnection;

    mainPool = null;

    const { server, database } = normalizeDatabaseLocation(config.dbServer, config.dbDatabase);
    
    const pool = new sql.ConnectionPool({
        user: config.dbUser,
        password: config.dbPassword,
        server,
        database,
        options: { encrypt: true, trustServerCertificate: true },
    });

    mainPoolConnection = pool.connect().then(connectedPool => {
        mainPool = connectedPool;
        mainPoolConnection = null;
        return connectedPool;
    }).catch(error => {
        mainPoolConnection = null;
        throw error;
    });

    return mainPoolConnection;
};
