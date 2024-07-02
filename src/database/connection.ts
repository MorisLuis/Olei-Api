import sql from "mssql";
import config from "../config";


let pool: sql.ConnectionPool | null = null;

export const dbConnection = async (server?: string, database?: string) => {

    const dbConfig = {
        user: config.dbUser,
        password: config.dbPassword,
        server: server  || config.dbServer,
        database: database || config.dbDatabase,
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


        await pool.close();
        pool = null;
    }
};