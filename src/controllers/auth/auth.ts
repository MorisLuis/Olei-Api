import { NextFunction, Request, Response } from 'express';
import { generateJWT, generateJWTDB } from '../../helpers/generate-jwt';
import { UserSessionInterface } from '../../interface/user';
import { handleGetSession } from '../../utils/Redis/getSession';
import { handleDeleteRedisSession } from '../../utils/Redis/deleteRedis';
import { loginAppService, loginDBAppService } from '../../services/authAppServices';
import { UnauthorizedError, ValidationError } from '../../errors/CustomError';

// login global server
const loginDB = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { IdUsuarioOLEI, PasswordOLEI } = req.body;

        const { result } = await loginDBAppService({
            IdUsuarioOLEI,
            PasswordOLEI
        })

        const tokenDB = await generateJWTDB({
            IdUsuarioOLEI: result.IdUsuarioOLEI.trim()
        });

        // Session redis
        const datosDelUsuario: UserSessionInterface = {
            ServidorSQL: result.ServidorSQL.trim(),
            BaseSQL: result.BaseSQL.trim(),
            PasswordSQL: result.PasswordSQL.trim(),
            UsuarioSQL: result.UsuarioSQL.trim(),

            IdUsuarioOLEI: result.IdUsuarioOLEI.trim(),

            RazonSocial: result.RazonSocial.trim(),
            SwImagenes: result.SwImagenes,
            Vigencia: result.Vigencia,
            userId: undefined,
            userRol: undefined,
            from: 'mobil'
        };

        req.session.user = datosDelUsuario;

        // User to Frontend.
        const user = {
            BaseSQL: result.BaseSQL,
            RazonSocial: result.RazonSocial
        };

        return res.json({
            tokenDB,
            user
        });

    } catch (error) {
        next(error);
    }
};

const renewDB = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        // Get session from REDIS.
        const sessionId = req.sessionID;
        const { user: userFR } = await handleGetSession({ sessionId });

        if (!userFR) {
            throw new UnauthorizedError('Sesion terminada')
        }

        const { BaseSQL, IdUsuarioOLEI, RazonSocial, userId, userRol } = userFR;

        const token = await generateJWTDB({ IdUsuarioOLEI });

        if (!token) {
            throw new UnauthorizedError('Error al generar token')
        };

        // User to Redis.
        const userRedis: UserSessionInterface = {
            ...userFR,
            userId: userId ? userId : undefined,
            userRol: userRol ? userRol : undefined
        };

        // User to Frontend.
        const user = {
            BaseSQL: BaseSQL,
            RazonSocial: RazonSocial
        };

        if (!userFR) {
            throw new ValidationError('Información del usuario es necesaria')
        };

        req.session.user = userRedis

        res.json({
            token,
            user
        });

    } catch (error) {
        next(error);
    }
};

const logoutDB = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const sessionId = req.sessionID;
        if (!sessionId) {
            throw new UnauthorizedError('Sesion terminada')
        }
        await handleDeleteRedisSession({ sessionId });
        res.json({ ok: true })
    } catch (error) {
        next(error);
    }
}


// login
const login = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { Id_Usuario, password } = req.body;
        const sessionId = req.sessionID;

        const { userData } = await loginAppService({
            Id_Usuario,
            password,
            sessionId
        })

        const token = await generateJWT({ Id_mobile: Id_Usuario.trim() });

        if (!req.session.user) {
            throw new UnauthorizedError('User session is not defined');
        }

        const datosDelUsuario: UserSessionInterface = {
            ...(req.session).user,
            userId: Id_Usuario.trim(),
            userRol: userData.Id_Perfil,
            TodosAlmacenes: userData.TodosAlmacenes,
            Id_Almacen: userData.Id_Almacen,
            AlmacenNombre: userData.AlmacenNombre,
            Id_ListPre: userData.Id_ListPre,

            ServidorSQL: req.session.user.ServidorSQL ?? '',
            BaseSQL: req.session.user.BaseSQL ?? '',
            UsuarioSQL: req.session.user.UsuarioSQL ?? '',
            PasswordSQL: req.session.user.PasswordSQL ?? '',
            IdUsuarioOLEI: req.session.user.IdUsuarioOLEI ?? '',
            RazonSocial: req.session.user.RazonSocial ?? '',
            SwImagenes: req.session.user.SwImagenes ?? '',
            Vigencia: req.session.user.Vigencia ?? '',
            from: req.session.user.from ?? 'mobil'
        };

        // Session redis
        req.session.user = datosDelUsuario;

        const userStorage = {
            Id_Usuario,
            TodosAlmacenes: userData.TodosAlmacenes,
            Id_Almacen: userData.Id_Almacen,
            AlmacenNombre: userData.AlmacenNombre,
            Id_TipoMovInv: {
                Id_TipoMovInv: userData.Id_TipoMovInv,
                Accion: userData.Accion,
                Descripcion: userData.Descripcion,
                Id_AlmDest: userData.Id_AlmDest
            }
        };

        return res.json({
            userStorage,
            token
        });

    } catch (error) {
        next(error);
    }
};

const renewLogin = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const sessionId = req.sessionID;
        const { user: userFR } = await handleGetSession({ sessionId });

        if (!userFR) {
            throw new UnauthorizedError('Sesion terminada')
        }

        const { ServidorSQL, BaseSQL, userId, userRol, TodosAlmacenes } = userFR;

        if (!userId || !userRol) {
            throw new ValidationError('userId y userRol son necesarios')
        };

        if (!ServidorSQL || !BaseSQL) {
            throw new ValidationError('ServidorSQL y BaseSQL son necesarios')
        };

        const token = await generateJWT({ Id_mobile: userId });

        if (!token) {
            throw new UnauthorizedError('Error al generar token')
        };

        const user = {
            Id_Usuario: userId,
            TodosAlmacenes,
            Id_Almacen: userFR.Id_Almacen,
            AlmacenNombre: userFR.AlmacenNombre,
            Id_ListPre: userFR.Id_ListPre
        };

        res.json({
            user,
            token
        });

    } catch (error) {
        next(error);
    }
}

const logoutUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const sessionId = req.sessionID;

        const { user: userFR } = await handleGetSession({ sessionId });

        if (!userFR) {
            throw new UnauthorizedError('Sesion terminada')
        }

        if (!req.session.user) {
            throw new UnauthorizedError('User session is not defined');
        }

        const datosDelUsuario: UserSessionInterface = {
            ...req.session.user,
            userId: undefined,
            userRol: undefined,
            TodosAlmacenes: undefined,
            Id_Almacen: undefined,
            AlmacenNombre: undefined,
            SalidaSinExistencias: 0,
            Id_ListPre: undefined,

            ServidorSQL: req.session.user.ServidorSQL ?? '',
            BaseSQL: req.session.user.BaseSQL ?? '',
            UsuarioSQL: req.session.user.UsuarioSQL ?? '',
            PasswordSQL: req.session.user.PasswordSQL ?? '',
            IdUsuarioOLEI: req.session.user.IdUsuarioOLEI ?? '',
            RazonSocial: req.session.user.RazonSocial ?? '',
            SwImagenes: req.session.user.SwImagenes ?? '',
            Vigencia: req.session.user.Vigencia ?? '',
            from: req.session.user.from ?? 'mobil'
        };

        req.session.user = datosDelUsuario;

        return res.json({
            user: datosDelUsuario
        })

    } catch (error) {
        next(error);
    }
}

export {
    loginDB,
    login,
    renewDB,
    renewLogin,
    logoutUser,
    logoutDB
}