import { NextFunction, Request, Response } from 'express';
import { closeDbConnection } from '../../database';
import { generateJWT, generateJWTDB } from '../../helpers/generate-jwt';
import { UserSessionInterface } from '../../interface/user';
import { handleGetSession } from '../../utils/Redis/getSession';
import { handleDeleteRedisSession } from '../../utils/Redis/deleteRedis';
import BadRequestError from '../../errors/BadRequestError';
import { loginAppService, loginDBAppService } from '../../services/authAppServices';

const loginDB = async (req: Request, res: Response, next: NextFunction) => {

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

        (req.session as any).user = datosDelUsuario;

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
        console.log({error})
        next(error);
    }
};

const login = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { Id_Usuario, password } = req.body;
        const sessionId = req.sessionID;

        const { userData } = await loginAppService({
            Id_Usuario,
            password,
            sessionId
        });

        const token = await generateJWT({ id: Id_Usuario.trim() });

        const datosDelUsuario: UserSessionInterface = {
            ...(req.session as any).user,
            userId: Id_Usuario.trim(),
            userRol: userData.Id_Perfil,
            TodosAlmacenes: userData.TodosAlmacenes,
            Id_Almacen: userData.Id_Almacen,
            AlmacenNombre: userData.AlmacenNombre,
            SalidaSinExistencias: userData.SalidaSinExistencias
        };

        // Session redis
        (req.session as any).user = datosDelUsuario;

        const userStorage = {
            Id_Usuario,
            TodosAlmacenes: userData.TodosAlmacenes,
            Id_Almacen: userData.Id_Almacen,
            AlmacenNombre: userData.AlmacenNombre,
            SalidaSinExistencias: userData.SalidaSinExistencias,
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

const renewDB = async (req: Request, res: Response, next: NextFunction) => {

    try {
        // Get session from REDIS.
        const sessionId = req.sessionID;
        const { user: userFR } = await handleGetSession({ sessionId });

        if (!userFR) {
            throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
        }

        const { BaseSQL, IdUsuarioOLEI, RazonSocial } = userFR;

        const token = await generateJWTDB({ IdUsuarioOLEI });

        if (!token) {
            throw new BadRequestError({ code: 401, message: "Failed to generate token", logging: true });
        };

        // User to Frontend.
        const user = {
            BaseSQL: BaseSQL,
            RazonSocial: RazonSocial
        };

        if (!userFR) {
            throw new BadRequestError({ code: 401, message: "User data is neccesary", logging: true });
        };

        res.json({
            token,
            user
        });

    } catch (error) {
        next(error);
    }
}

const renewLogin = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const sessionId = req.sessionID;
        const { user: userFR } = await handleGetSession({ sessionId });

        if (!userFR) {
            throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
        }

        const { ServidorSQL, BaseSQL, userId, userRol, TodosAlmacenes } = userFR;

        if (!userId && !userRol) {
            throw new BadRequestError({ code: 401, message: "User not authenticated", logging: true });
        };

        if (!ServidorSQL && !BaseSQL) {
            throw new BadRequestError({ code: 401, message: "Server and base data is neccessary", logging: true });
        };

        const token = await generateJWT({ id: userId as string });

        if (!token) {
            throw new BadRequestError({ code: 401, message: "Failed to generate token", logging: true });
        };

        const user = {
            Id_Usuario: userId,
            TodosAlmacenes,
            Id_Almacen: userFR.Id_Almacen,
            AlmacenNombre: userFR.AlmacenNombre,
            SalidaSinExistencias: userFR.SalidaSinExistencias,
        };

        res.json({
            user,
            token
        });

    } catch (error) {
        next(error);
    }
}

const logoutUser = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const sessionId = req.sessionID;

        const { user: userFR } = await handleGetSession({ sessionId });

        if (!userFR) {
            throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
        }

        const datosDelUsuario: UserSessionInterface = {
            ...(req.session as any).user,
            userId: undefined,
            userRol: undefined,
            TodosAlmacenes: undefined,
            Id_Almacen: undefined,
            AlmacenNombre: undefined,
            SalidaSinExistencias: undefined
        };

        // Session redis
        (req.session as any).user = datosDelUsuario;


        res.json({
            user: userFR
        })

    } catch (error) {
        next(error);
    }
}

const logoutDB = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const sessionId = req.sessionID;
        if (!sessionId) {
            throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
        }
        await handleDeleteRedisSession({ sessionId });
        await closeDbConnection()
        res.json({ ok: true })
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