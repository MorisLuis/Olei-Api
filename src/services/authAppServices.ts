import { dbConnection, dbConnectionMain, querys } from "../database";
import BadRequestError from "../errors/BadRequestError";
import { ValidationResult } from "../interface/user";
import { handleGetSession } from "../utils/Redis/getSession";
import sql from "mssql";

interface loginDBAppServiceInterface {
    IdUsuarioOLEI: string;
    PasswordOLEI: string;
}

const loginDBAppService = async ({
    IdUsuarioOLEI,
    PasswordOLEI
}: loginDBAppServiceInterface) => {

    // Connection to server
    const mainPool = await dbConnectionMain();
    if (!mainPool) {
        throw new BadRequestError({ code: 400, message: "Error connecting to the main database!", logging: true });
    }

    if (IdUsuarioOLEI.trim() === "" || PasswordOLEI.trim() === "") {
        throw new BadRequestError({ code: 401, message: "Necesario enviar usuario y contraseña!", logging: true });
    }

    // Get data from DB.
    const query_DB = querys.authDatabase;
    const resp = await mainPool
        .request()
        .input('IdUsuarioOLEI', IdUsuarioOLEI)
        .query(query_DB);

    const result = resp?.recordset[0];

    if (!result) {
        throw new BadRequestError({ code: 404, message: `No se encontro el usuario: ${IdUsuarioOLEI}`, logging: true });
    }

    if (result?.PasswordOLEI && result?.PasswordOLEI.trim() !== PasswordOLEI) {
        throw new BadRequestError({ code: 404, message: `Contraseña incorrecta`, logging: true });
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
}: loginAppServiceInterface) => {

    const { user: userFR } = await handleGetSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL, Id_Almacen } = userFR;

    const pool = await dbConnection(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);

    if (!pool) {
        throw new BadRequestError({ code: 500, message: "Error connecting to the main database", logging: true });
    }

    if (Id_Usuario.trim() === "" || password.trim() === "") {
        throw new BadRequestError({ code: 404, message: "Necesario escribir correo y contraseña", logging: true });
    }

    const request = pool.request();
    request.input('Id_Usuario', sql.VarChar(50), Id_Usuario);
    request.input('Password', sql.VarChar(50), password);

    const result = await request.execute('sp_AuthenticateAndGetMovement');
    const validations = (result.recordsets as any)[0] as ValidationResult[];


    if (validations[0].Tipo === "usuario" && validations[0].Resultado !== 1) {
        throw new BadRequestError({ code: 404, message: "Correo no encontrado", logging: true });
    };

    if (validations[1].Tipo === "contrasena" && validations[1].Resultado !== 1) {
        throw new BadRequestError({ code: 404, message: "Contraseña incorrecta", logging: true });
    };

    const userData = (result.recordsets as any)[1][0]

    return {
        userData: {
            ...userData,
            Id_Almacen
        }
    }
};


export {
    loginDBAppService,
    loginAppService
}