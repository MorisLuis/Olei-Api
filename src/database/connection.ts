import sql from "mssql";
import config from "../config";



let pool: sql.ConnectionPool | null = null;

export const dbConnection = async (server?: string, database?: string, password?: string, user?: string) => {
    if (!pool) {
        const dbConfig = {
            user: user || config.dbUser,
            password:  password || config.dbPassword,
            server: server || config.dbServer,
            database: database || config.dbDatabase,
            options: {
                encrypt: true,
                trustServerCertificate: true,
            },
        };

        try {
            pool = await sql.connect(dbConfig);
        } catch (error: any) {
            console.error('Error al conectar a la base de datos:', error.message);
            throw error;
        }
    }
    return pool;
};


export const closeDbConnection = async () => {
    if (pool) {

        await pool.close();
        pool = null;
    }
};