import sql from "mssql";

import { dbConnection } from "../../../database";
import { usersQuery } from "../../../database/querys/users";
import { ValidationError } from "../../../errors/CustomError";
import { handleDeleteRedisSession } from "../../../helpers/generate-redis"
import type { logoutServerParams } from "./types";


export const logoutServerService = async (params: logoutServerParams): Promise<void> => {
    const { sessionId, session } = params;

    if (!sessionId || !session) {
        throw new Error('Session ID or session data is missing');
    }

    const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL } = session;
    const pool = await dbConnection(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    }

    const query = usersQuery.updateUserSession
    await pool.request()
        .input('Id_Usuario', sql.VarChar(50), session.Id_UsuarioOLEI)
        .query(query);


    await handleDeleteRedisSession(sessionId)

}