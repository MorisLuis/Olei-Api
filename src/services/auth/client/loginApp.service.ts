import sql from "mssql";

import { dbConnection } from "../../../database";
import { UnauthorizedError, ValidationError } from "../../../errors/CustomError";
import type { LoginAppParams, LoginAppResponse, LoginAppSessionFields } from "./types";
import type { UserSessionInterface } from "../../../interface/user";
import { sanitizeServerSessionUser } from "../../../controllers/auth/utils/sessionResponse";
import { updateSession } from "../database/session.service";
import { generateAccessToken, generateRefreshToken } from "./token.service";
import { normalizeDeviceId } from "./utils";

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
    password,
    idEquipo
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

    const Id_equipoNormalized = idEquipo ? normalizeDeviceId(idEquipo) : null;
    const request = pool.request()
        .input('Id_Usuario', sql.VarChar(50), Id_Usuario)
        .input('Password', sql.VarChar(50), password);

    if (Id_equipoNormalized) {
        request.input('idEquipo', sql.VarChar(100), Id_equipoNormalized);
    }

    let result;
    try {
        result = await request.execute('sp_AuthenticateAndGetMovement');
    } catch (err) {
        if (Id_equipoNormalized) {
            // Some versions of the stored procedure may not expect `idEquipo`.
            // Retry without the optional parameter when we receive an error.
            const fallbackRequest = pool.request()
                .input('Id_Usuario', sql.VarChar(50), Id_Usuario)
                .input('Password', sql.VarChar(50), password);

            result = await fallbackRequest.execute('sp_AuthenticateAndGetMovement');
        } else {
            throw err;
        }
    }

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
        Id_Equipo: Id_equipoNormalized || undefined
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