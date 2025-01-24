import { ConnectionPool } from "mssql";
import { dbConnection } from "../database";
import BadRequestError from "../errors/BadRequestError";

export const createPool = async (Serverweb: string, Baseweb: string): Promise<ConnectionPool> => {
    const pool = await dbConnection(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError({ code: 500, message: `Error de conexión con la base de datos.`, logging: true });
    }
    return pool;
};