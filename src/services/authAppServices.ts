import { dbConnection, dbConnectionMain, querys } from "../database";
import { NotFoundError, UnauthorizedError, ValidationError } from "../errors/CustomError";
import { UserAuthenticateAndGetMovementInterface, ValidationResult } from "../interface/user";
import { handleGetSession } from "../utils/Redis/getSession";
import sql from "mssql";

interface authInterface {
    IdOLEI: number,
    PasswordOLEI: number,
    IdUsuarioOLEI: string,
    ServidorSQL: string,
    BaseSQL: string,
    UsuarioSQL: string,
    PasswordSQL: string,
    RazonSocial: string,
    SwImagenes: string,
    Vigencia: string
}

interface loginDBAppServiceInterface {
    IdUsuarioOLEI: string;
    PasswordOLEI: string;
}

const loginDBAppService = async ({
    IdUsuarioOLEI,
    PasswordOLEI
}: loginDBAppServiceInterface): Promise<{ result: authInterface }> => {

    // Connection to server
    const mainPool = await dbConnectionMain();
    if (!mainPool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    }

    if (IdUsuarioOLEI.trim() === "" || PasswordOLEI.trim() === "") {
        throw new ValidationError('Necesario enviar usuario y contraseña')
    }

    // Get data from DB.
    const query_DB = querys.authDatabase;
    const resp = await mainPool
        .request()
        .input('IdUsuarioOLEI', IdUsuarioOLEI)
        .query(query_DB);

    const result = resp?.recordset[0];

    if (!result) {
        throw new NotFoundError(`No se encontro el usuario: ${IdUsuarioOLEI}`)
    }

    if (result?.PasswordOLEI && result?.PasswordOLEI.trim() !== PasswordOLEI) {
        throw new UnauthorizedError(`Contraseña incorrecta ${IdUsuarioOLEI}`)
    }

    return {
        result
    }
}

interface loginAppServiceInterface {
    sessionId: string;
    Id_Usuario: string;
    password: string;
}

const loginAppService = async ({
    sessionId,
    Id_Usuario,
    password
}: loginAppServiceInterface): Promise<{ userData: UserAuthenticateAndGetMovementInterface }> => {

    const { user: userFR } = await handleGetSession({ sessionId });

    if (!userFR) {
        throw new UnauthorizedError('Sesion terminada')
    }

    const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL } = userFR;

    const pool = await dbConnection(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    }

    if (Id_Usuario.trim() === "" || password.trim() === "") {
        throw new ValidationError('Necesario escribir correo y contraseña')
    }

    const result = await pool.request()
        .input('Id_Usuario', sql.VarChar(50), Id_Usuario)
        .input('Password', sql.VarChar(50), password)
        .execute('sp_AuthenticateAndGetMovement');

    const validations = (result.recordsets as any)[0] as ValidationResult[];

    if (validations[0].Tipo === "usuario" && validations[0].Resultado !== 1) {
        throw new NotFoundError('Correo no encontrado')
    };

    if (validations[1].Tipo === "contrasena" && validations[1].Resultado !== 1) {
        throw new UnauthorizedError('Contraseña incorrecta')
    };

    const userData = (result.recordsets as any)[1][0];

    return {
        userData: {
            ...userData
        }
    }
};

export {
    loginDBAppService,
    loginAppService
}