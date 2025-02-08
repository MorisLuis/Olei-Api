import { ConnectionPool } from "mssql";
import { dbConnectionMain, querys } from "../database";
import BadRequestError from "../errors/BadRequestError";
import moment from "moment";

const loginWebService = async (email: string, password: string) => {

    if (email === "" || password === "") {
        throw new BadRequestError({ code: 401, message: "Necesario escribir correo y contraseña", logging: true });
    };

    const mainPool = await dbConnectionMain()
    if (!mainPool) {
        throw new BadRequestError({ code: 500, message: "Error connecting to the main database", logging: true });
    }

    const { SwsinPrecio, TipoDocOO, ServidorSQL, BaseSQL, Vigencia, Id_ListPre, UsuarioSQL, ...user } = await getUserByEmailWeb(mainPool, email);

    if (!user) {
        throw new BadRequestError({ code: 404, message: "Correo no encontrado", logging: true });
    }

    if (user.PasswordOOL.trim() !== password) {
        throw new BadRequestError({ code: 404, message: "Contraseña incorrecta", logging: true });
    }

    const isExpired = await isSubscriptionExpired(Vigencia);
    if (isExpired) {
        throw new BadRequestError({ code: 404, message: "Cuenta de usuario vencida", logging: true });
    }

    return {
        SwsinPrecio,
        TipoDocOO,
        ServidorSQL,
        BaseSQL,
        Vigencia,
        Id_ListPre,
        UsuarioSQL,
        ...user
    }
};

// Utils
const getUserByEmailWeb = async (mainPool: ConnectionPool, email: string) => {
    const query_DB = querys.authWeb;
    const result = await mainPool.request().input('email', email).query(query_DB);
    const user = result?.recordset[0]

    if (!user) {
        throw new BadRequestError({ code: 404, message: "Usuario no encontrado", logging: true });
    }

    return user
};

const isSubscriptionExpired = (dueDate: string) => {
    const today = moment().startOf('day');
    const isExpired = moment(dueDate).startOf('day').isBefore(today);
    return isExpired;
};

export {
    loginWebService
}