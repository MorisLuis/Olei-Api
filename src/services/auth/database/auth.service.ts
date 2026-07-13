import { v4 } from 'uuid';
import sql from "mssql";

import { dbConnectionMain, querys } from "../../../database";
import { UnauthorizedError, ValidationError } from "../../../errors/CustomError";
import type { LoginDbParams, LoginDbResponse } from "./types";
import { sanitizeServerSessionUser } from '../../../controllers/auth/utils/sessionResponse';
import type { UserSessionInterface } from '../../../interface/user';
import { generateRedisSession } from './session.service';
import { generateAccessTokenServer } from './token.service';

/**
 * @description Function to login to the database and return the user data:
 * 1. Validates the user credentials against the main database.
 * 2. If valid, retrieves the user data and sanitizes it.
 * 3. Generates a new session ID and stores the user data in Redis.
 * 4. Generates an access token for the server session.
 * 5. Returns the sanitized user data along with the generated server token.
 * 
 * @param {LoginDbParams} params - The parameters to login to the database
 * @param {string} params.IdUsuarioOLEI - The user id to login to the database
 * @param {string} params.PasswordOLEI - The password to login to the database
 * @returns {Promise<LoginDbResponse>} - The user data from the database
 * @throws {ValidationError} - If the parameters are invalid or if there is an error connecting to the database
 * @throws {NotFoundError} - If the user is not found or if the password is incorrect
 */

export const loginDB = async ({
    IdUsuarioOLEI,
    PasswordOLEI
}: LoginDbParams): Promise<LoginDbResponse> => {

    if (!IdUsuarioOLEI?.trim() || !PasswordOLEI?.trim()) {
        throw new ValidationError('Necesario enviar usuario y contraseña')
    }

    const mainPool = await dbConnectionMain();
    if (!mainPool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    }

    const query_DB = querys.authDatabase;
    const resp = await mainPool
        .request()
        .input('IdUsuarioOLEI', sql.VarChar(50), IdUsuarioOLEI)
        .query(query_DB);

    const result = resp?.recordset[0];

    if (!result) {
        throw new UnauthorizedError('Credenciales inválidas')
    }

    if (result?.PasswordOLEI && result?.PasswordOLEI.trim() !== PasswordOLEI) {
        throw new UnauthorizedError('Credenciales inválidas')
    }

    const datosDelUsuario: UserSessionInterface = {
        ServidorSQL: result.ServidorSQL.trim(),
        BaseSQL: result.BaseSQL.trim(),
        UsuarioSQL: result.UsuarioSQL.trim(),
        PasswordSQL: result.PasswordSQL.trim(),
        IdUsuarioOLEI: result.IdUsuarioOLEI.trim(),
        RazonSocial: result.RazonSocial.trim(),
        SwImagenes: result.SwImagenes,
        Vigencia: result.Vigencia,
        Id_ListPre: result.Id_ListPre,

        from: 'mobil',
        userConected: false,
        serverConected: true
    };

    const responseUser = sanitizeServerSessionUser(datosDelUsuario);
    const sessionId = v4();
    await generateRedisSession(sessionId, datosDelUsuario)
    const tokenServer = generateAccessTokenServer(sessionId);

    return {
        user: responseUser,
        tokenServer
    }
}
