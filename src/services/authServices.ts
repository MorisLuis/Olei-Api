import { ConnectionPool } from "mssql";
import { dbConnectionMain, querys } from "../database";
import moment from "moment";
import { NotFoundError, UnauthorizedError, ValidationError } from "../errors/CustomError";

interface UserResponseInterface {
    SwsinPrecio: boolean;
    TipoDocOO: number;
    ServidorSQL: string;
    BaseSQL: string;
    Vigencia: string; // Suponiendo que Vigencia es una cadena
    Id_ListPre: number;
    UsuarioSQL: string;
    PasswordOOL: string; // Esta es la propiedad que estás validando en la función

    Id_UsuarioOOL: string, 
    Nombre: string,
    Id_Cliente: number,
    SwImagenes: boolean,
    SwSinStock: boolean,
    TipoUsuario: string,
    Id_Almacen: number
}


const loginWebService = async (email: string, password: string): Promise<UserResponseInterface> => {
    if (email === "" || password === "") {
        throw new ValidationError('Necesario escribir correo y contraseña');
    }

    const mainPool = await dbConnectionMain();
    if (!mainPool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    }

    const { SwsinPrecio, TipoDocOO, ServidorSQL, BaseSQL, Vigencia, Id_ListPre, UsuarioSQL, ...user } = await getUserByEmailWeb(mainPool, email);

    if (!user) {
        throw new NotFoundError(`No se encontro el usuario: ${email}`);
    }

    if (user.PasswordOOL.trim() !== password) {
        throw new UnauthorizedError(`Contraseña incorrecta`);
    }

    const isExpired = await isSubscriptionExpired(Vigencia);

    if (isExpired) {
        throw new UnauthorizedError(`Cuenta de usuario vencida`);
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
    };
};

// Utils
const getUserByEmailWeb = async (mainPool: ConnectionPool, email: string): Promise<UserResponseInterface> => {
    const query_DB = querys.authWeb;
    const result = await mainPool.request().input('email', email).query(query_DB);
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