import type { UserSessionInterface } from '../../../interface/user';

/**
 * @description Sanitizes the user session object by returning only the necessary properties.
 * This is useful for sending user information in responses without exposing sensitive data.
 * @param session - The user session object to be sanitized.
 * @returns A partial user session object containing only the necessary properties.
 * @example
 * const sanitizedUser = sanitizeServerSessionUser(session);
 * res.json({ user: sanitizedUser });
 */

export const sanitizeServerSessionUser = (session: Partial<UserSessionInterface>): Partial<UserSessionInterface> => ({
    IdUsuarioOLEI: session.IdUsuarioOLEI,
    RazonSocial: session.RazonSocial,
    SwImagenes: session.SwImagenes,
    Vigencia: session.Vigencia,
    Id_ListPre: session.Id_ListPre,
    from: session.from,
    userConected: session.userConected,
    serverConected: session.serverConected,
    Id_UsuarioOLEI: session.Id_UsuarioOLEI,
    userRol: session.userRol,
    TodosAlmacenes: session.TodosAlmacenes,
    SalidaSinExistencias: session.SalidaSinExistencias,
    Id_Almacen: session.Id_Almacen,
    AlmacenNombre: session.AlmacenNombre,
});
