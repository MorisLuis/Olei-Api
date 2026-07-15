import sql from "mssql";

import { dbConnection } from "../../../database";
import { UnauthorizedError, ValidationError } from "../../../errors/CustomError";
import type { LoginAppParams, LoginAppResponse, LoginAppSessionFields } from "./types";
import type { UserSessionInterface } from "../../../interface/user";
import { sanitizeServerSessionUser } from "../../../controllers/auth/utils/sessionResponse";
import { updateSession } from "../database/session.service";
import { generateAccessToken, generateRefreshToken } from "./token.service";

/**
 * @description Handles the login process for the application:
 * 1. Validates user credentials against the database.
 * 2. Updates the session in Redis with the authenticated user data.
 * 3. Generates access and refresh tokens for the authenticated session.
 * 4. Returns the sanitized user data along with the generated tokens.
 * 
 * @function loginAppService
 * @param {LoginAppParams} params - The parameters required for the login process, including session ID, session data, user ID, and password.
 * @throws {ValidationError} Throws a ValidationError if the user ID or password is missing or invalid.
 * @throws {UnauthorizedError} Throws an UnauthorizedError if the user credentials are invalid or if there is an issue with the database connection.
 * @returns {Promise<LoginAppResponse>} Returns a promise that resolves to an object containing the sanitized user data, access token, and refresh token.
 */

export const loginAppService = async ({
    sessionId,
    session,
    Id_Usuario,
    password
}: LoginAppParams): Promise<LoginAppResponse> => {

    const normalizedUserId = Id_Usuario.trim();
    if (!normalizedUserId || !password.trim()) {
        throw new ValidationError(
            "Necesario escribir usuario y contraseña"
        );
    }

    const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL } = session;
    const pool = await dbConnection(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    }

    const result = await pool.request()
        .input('Id_Usuario', sql.VarChar(50), Id_Usuario)
        .input('Password', sql.VarChar(50), password)
        .execute('sp_AuthenticateAndGetMovement');

    const recordsets = (Array.isArray(result.recordset) ? result.recordset : [] ) as LoginAppSessionFields[];
    const userData = recordsets[0];

    if ( !userData ) {
        throw new UnauthorizedError( "Respuesta inválida del autenticador");
    }

    const datosDelUsuario: UserSessionInterface = {
        ...session,
        Id_UsuarioOLEI: Id_Usuario.trim(),
        userRol: userData.Id_Perfil,
        TodosAlmacenes: userData.TodosAlmacenes,
        SalidaSinExistencias: userData.SalidaSinExistencias,
        Id_Almacen: userData.Id_Almacen,
        AlmacenNombre: userData.AlmacenNombre,
        serverConected: session.serverConected,
        userConected: true,
    };

    await updateSession(sessionId, datosDelUsuario);
    const token = generateAccessToken(sessionId)
    const refreshToken = generateRefreshToken(sessionId);
    const responseUser = sanitizeServerSessionUser(datosDelUsuario);

    return {
        user: responseUser,
        token,
        refreshToken
    }
};