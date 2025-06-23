import type { ConnectionPool } from "mssql";
import { dbConnectionMain, querys } from "../database";
import moment from "moment";
import { NotFoundError, UnauthorizedError, ValidationError } from "../errors/CustomError";
import type { UserWebSessionInterface } from "../interface/user";

const loginWebService = async (email: string, password: string): Promise<UserWebSessionInterface> => {
    if (email === "" || password === "") {
        throw new ValidationError('Necesario escribir correo y contraseña');
    }

    const mainPool = await dbConnectionMain();
    if (!mainPool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    }

    const user = await getUserByEmailWeb(mainPool, email);

    if (!user) {
        throw new NotFoundError(`No se encontro el usuario: ${email}`);
    }

    if (user.PasswordOOL.trim() !== password) {
        throw new UnauthorizedError(`Contraseña incorrecta`);
    }

    const isExpired = await isSubscriptionExpired(user.Vigencia);

    if (isExpired) {
        throw new UnauthorizedError(`Cuenta de usuario vencida`);
    };

    return user;
};

// Utils
const getUserByEmailWeb = async (mainPool: ConnectionPool, email: string): Promise<UserWebSessionInterface> => {
    const query = querys.authWeb;
    const result = await mainPool.request().input('email', email).query(query);
    const user = result?.recordset[0]

    if (!user) {
        throw new NotFoundError(`No se encontro el usuario`)
    }

    return user
};

const isSubscriptionExpired = (dueDate: string): boolean => {
    const today = moment().startOf('day');
    const isExpired = moment(dueDate).startOf('day').isBefore(today);
    return isExpired;
};

export {
    loginWebService
}