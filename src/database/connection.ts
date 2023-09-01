import sql, { ConnectionPool } from "mssql";
import config from "../config";

let pool: sql.ConnectionPool | null = null;

export const dbConnection = async (server?: string, database?: string) => {
    //console.log({pool})
    console.log({server, database})
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
        console.log({dbSettings})

        pool = await sql.connect(dbSettings);
        console.log({pool})
        return pool;
    } catch (error) {
        console.error(error);
        console.log({config})
    }
};


/* export const dbConnection = async (server?: string, database?: string, pastPool?: sql.ConnectionPool | null): Promise<ConnectionPool> => {
    console.log({ pastPool })
    console.log({ server, database })

    try {
        let dbSettings;
        if (pastPool) {
            dbSettings = {
                user: config.dbUser,
                password: config.dbPassword,
                server: server || "",
                database: database || "",
                options: {
                    encrypt: true,
                    trustServerCertificate: true,
                },
            };
        } else {
            dbSettings = {
                user: config.dbUser,
                password: config.dbPassword,
                server: server || config.dbServer,
                database: database || config.dbDatabase,
                options: {
                    encrypt: true,
                    trustServerCertificate: true,
                },
            };
        }

        console.log({ dbSettings })

        const connectionPool = await new sql.ConnectionPool(dbSettings);
        await connectionPool.connect();

        // Registra que se ha conectado con éxito
        console.log("Connected to the database");

        return connectionPool;
    } catch (error) {
        // Maneja el error apropiadamente, por ejemplo, registrándolo o lanzando una excepción
        console.error("Error connecting to the database:", error);
        throw error; // Lanza la excepción para que el llamador pueda manejarla
    }


}; */

export const closeDbConnection = async () => {
    if (pool) {
        await pool.close();
        pool = null;
    }
};
