import { updateSession } from "../database/session.service";
import type { logoutAppParams, logoutAppResponse } from "./types";

/**
 * @description Logs out the user by clearing the session data and updating the session in the database.
 * @param params - An object containing the session ID and the user session object.
 * @throws {Error} Throws an error if the session ID or session object is not provided.
 * @returns An object containing the sanitized user information after logout.
 * @example
 * const { user } = await logoutAppService({ sessionId, session });
 * res.json({ user });
 */

export const logoutAppService = async (params: logoutAppParams): Promise<logoutAppResponse> => {
    const { sessionId, session } = params;

    if (!sessionId || !session) {
        throw new Error('Session ID or session data is missing');
    }

    const updatedSession = {
        ...session,
        Id_UsuarioOLEI: '',
        userRol: 0,
        TodosAlmacenes: 0,
        SalidaSinExistencias: 0,
        Id_Almacen: 0,
        AlmacenNombre: '',
        userConected: false
    };

    await updateSession(sessionId, updatedSession);

    return { user: updatedSession };
}