import { ConnectionPool } from "mssql";
import { dbConnection } from "../database";
import { ValidationError } from "../errors/CustomError";

export const createPool = async (Serverweb: string, Baseweb: string): Promise<ConnectionPool> => {
    const pool = await dbConnection(Serverweb, Baseweb);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos.');
    }
    return pool;
};