import sql from "mssql";
import config from "../config";

let mainPool: sql.ConnectionPool | null = null;
let pool: sql.ConnectionPool | null = null;


export const dbConnection = async (server?: string, base?: string, user?: string, pass?: string) => {
    if (!pool) {
        const dbConfig = {
            user: user || config.dbUser,
            password: pass || config.dbPassword,
            server: server as string,
            database: base as string,
            options: {
                encrypt: true,
                trustServerCertificate: true
            },
        };

        try {
            pool = new sql.ConnectionPool(dbConfig);
            await pool.connect();
        } catch (error: any) {
            console.error('Error al conectar a Servidor 2:', error.message);
            throw error;
        }
    }
    return pool;
};

export const dbConnectionMain = async () => {
    if (!mainPool) {
        const dbConfig = {
            user: config.dbUser,
            password: config.dbPassword,
            server: config.dbServer,
            database: config.dbDatabase,
            options: {
                encrypt: true,
                trustServerCertificate: true
            },
        };

        try {
            mainPool = await sql.connect(dbConfig);
        } catch (error: any) {
            console.error('Error al conectar a Servidor 1:', error.message);
            throw error;
        }
    }
    return mainPool;
};


export const closeDbConnection = async () => {
    if (mainPool) {
        await mainPool.close();
        mainPool = null;
    }

    if (pool) {
        await pool.close();
        pool = null;
    }
};