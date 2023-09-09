import sql, { ConnectionPool } from "mssql";
import config from "../config";

let pool: sql.ConnectionPool | null = null;

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


export const closeDbConnection = async () => {
    if (pool) {
        await pool.close();
        pool = null;
    }
};
