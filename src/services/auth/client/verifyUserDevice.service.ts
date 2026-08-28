import sql from 'mssql';
import { dbConnection } from '../../../database';
import type { UserSessionInterface } from '../../../interface/user';

/**
 * Verifies that the user exists in the DB, is active, and the device matches the session's device.
 * Returns true when the user/device is valid, false otherwise.
 */
export const verifyUserDevice = async (
    session: UserSessionInterface,
): Promise<boolean> => {
    const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL } = session;
    const pool = await dbConnection(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);

    const userResult = await pool.request()
        .input('Id_Usuario', sql.VarChar(50), session.Id_UsuarioOLEI)
        .query('SELECT IdEquipo, SwActivo FROM USUARIOS WHERE Id_Usuario = @Id_Usuario');

    const dbUser = Array.isArray(userResult.recordset) ? userResult.recordset[0] : undefined;
    if (!dbUser) return false;

    const dbDevice = dbUser?.IdEquipo ? String(dbUser.IdEquipo).toUpperCase() : null;
    const isActive = Boolean(dbUser?.SwActivo === true || dbUser?.SwActivo === 1 || dbUser?.SwActivo === '1');
    const sessionDevice = session.Id_Equipo ? String(session.Id_Equipo).toUpperCase() : null;

    // Business rule: normalized device must match session.Id_Equipo, and DB device must match that value too
    if (!isActive) return false;
    if (!sessionDevice) return false;
    if (!dbDevice) return false;
    if (dbDevice !== sessionDevice) return false;

    return true;
};
