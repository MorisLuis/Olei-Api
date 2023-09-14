import sql from "mssql";
import { sharedData } from "../app";
import config from "../config";


let pool: sql.ConnectionPool | null = null;

export const dbConnection = async (server?: string, database?: string) => {
    const currenUserConnection = sharedData?.userConnection?.connection;

    const dbConfig = {
        user: config.dbUser,
        password: config.dbPassword,
        server: server || currenUserConnection?.server || config.dbServer,
        database: database || currenUserConnection?.database || config.dbDatabase,
        options: {
            encrypt: true,
            trustServerCertificate: true,
        },
    };


    try {
        const pool = new sql.ConnectionPool(dbConfig);
        await pool.connect();
        return pool;
    } catch (error: any) {
        console.error('Error al conectar a la base de datos:', error.message);
        throw error;
    }
};

export const closeDbConnection = async () => {
    if (pool) {
        sharedData.userConnection = {
            connection: {
                user: config.dbUser,
                password: config.dbPassword,
                server: config.dbServer,
                database: config.dbDatabase
            }
        };

        await pool.close();
        pool = null;
    }
};


/* 
export const dbConnection = async (server?: string, database?: string) => {

    try {
        const dbSettings = {
            user: config.dbUser,
            password: config.dbPassword,
            server: server || config.dbServer,
            database: database || config.dbDatabase,
            options: {
                encrypt: true,
                trustServerCertificate: true,
            },
        };

        pool = await sql.connect(dbSettings);
        return pool;
    } catch (error) {
        console.error(error);
    }
};
*/