import { NextFunction, Request, Response } from 'express';
import { closeDbConnection, dbConnectionMain, querys } from '../../database';
import { generateWebJWT } from '../../helpers/generate-jwt';
import moment from 'moment';
import { UserWebSessionInterface } from '../../interface/user';
import { handleGetWebSession } from '../../utils/Redis/getSession';
import { handleDeleteRedisSession } from '../../utils/Redis/deleteRedis';
import BadRequestError from '../../errors/BadRequestError';

const loginWeb = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (email === "" || password === "") {
        throw new BadRequestError({ code: 401, message: "Necesario escribir correo y contraseña", logging: true });
    }

    try {
        const mainPool = await dbConnectionMain()

        if (!mainPool) {
            throw new BadRequestError({ code: 500, message: "Error connecting to the main database", logging: true });
        }

        const { SwsinPrecio, TipoDocOO, ServidorSQL, BaseSQL, Vigencia, Id_ListPre, UsuarioSQL, ...user } = await getUserByEmailWeb(mainPool, email);

        if (!user) {
            throw new BadRequestError({ code: 401, message: "Correo no encontrado", logging: true });
        }

        if (user.PasswordOOL.trim() !== password) {
            throw new BadRequestError({ code: 401, message: "Contraseña incorrecta", logging: true });
        }

        const isExpired = await isSubscriptionExpired(Vigencia);
        if (isExpired) {
            throw new BadRequestError({ code: 401, message: "Cuenta de usuario vencida", logging: true });
        }

        const datosDelUsuario: UserWebSessionInterface = {
            Id: user.Id_UsuarioOOL.trim(),
            Nombre: user.Nombre.trim(),
            Serverweb: ServidorSQL.trim(),
            Baseweb: BaseSQL.trim(),
            Id_Cliente: user.Id_Cliente || 0,
            Id_ListPre,
            Vigencia: Vigencia,
            SwImagenes: user.SwImagenes,
            SwSinStock: user.SwSinStock,
            SwsinPrecio,
            TipoDocOO,
            TipoUsuario: user.TipoUsuario,
            Id_Almacen: user.Id_Almacen,
            Id_Usuario: UsuarioSQL,
            PrecioIncIVA: 0,
            from: 'web'
        };

        (req.session as any).userWeb = datosDelUsuario;

        // Generar token JWT
        const token = await generateWebJWT({ Id: user.Id_UsuarioOOL.trim(), sessionRedis: req.sessionID });

        return res.json({
            user: {
                ...datosDelUsuario,
                Id_ListPre
            },
            token
        });

    } catch (error) {
        next(error)
    }
};

const renewWeb = async (req: Request, res: Response, next: NextFunction) => {

    // Get session from REDIS.
    const sessionId = req.sessionRedis;
    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { Id, TipoUsuario, Serverweb, Baseweb } = userFR;

    try {

        if (!Id && !TipoUsuario) {
            return res.status(401).json({ message: 'Id and rol are neccessary' });
        };

        if (!Serverweb && !Baseweb) {
            return res.status(401).json({ message: 'Server and base data is neccessary' });
        };

        let token
        token = await generateWebJWT({ Id, sessionRedis: req.sessionID });

        if (!token) {
            return res.status(401).json({ message: 'Failed to generate token' });
        };

        res.json({
            user: userFR,
            token
        });
    } catch (error) {
        next(error)
    }
}

const logout = async (req: Request, res: Response, next: NextFunction) => {
    const sessionId = req.sessionRedis;

    if (!sessionId) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    try {
        await closeDbConnection()
        await handleDeleteRedisSession({ sessionId });
        res.json({ ok: true })

    } catch (error) {
        next(error)
    }
}


//Utils
const getUserByEmailWeb = async (mainPool: any, email: string) => {
    const query_DB = querys.authWeb;
    const result = await mainPool.request().input('email', email).query(query_DB);
    const user = result?.recordset[0]

    if(!user) {
        throw new BadRequestError({ code: 401, message: "Usuario no encontrado", logging: true });
    }

    return user
};

const isSubscriptionExpired = (dueDate: string) => {
    const today = moment().startOf('day');
    const isExpired = moment(dueDate).startOf('day').isBefore(today);
    return isExpired;
};

export {
    loginWeb,
    renewWeb,
    logout
}