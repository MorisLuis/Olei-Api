import { NextFunction, Request, Response } from 'express';
import sql from "mssql";
import { closeDbConnection, dbConnection, dbConnectionMain, querys } from '../../database';
import { generateJWT, generateJWTDB } from '../../helpers/generate-jwt';
import { MovementDetail, UserSessionInterface, ValidationResult } from '../../interface/user';
import { handleGetSession } from '../../utils/Redis/getSession';
import { handleDeleteRedisSession } from '../../utils/Redis/deleteRedis';

import BadRequestError from '../../errors/BadRequestError';

const loginDB = async (req: Request, res: Response, next: NextFunction) => {

    // STEP 1 - CONNECT TO OLIEDB1_CLIENTES
    const { IdUsuarioOLEI, PasswordOLEI } = req.body;

    const mainPool = await dbConnectionMain();
    if (!mainPool) {
        throw new BadRequestError({ code: 400, message: "Error connecting to the main database!", logging: true });
    }

    if (IdUsuarioOLEI.trim() === "" || PasswordOLEI.trim() === "") {
        throw new BadRequestError({ code: 401, message: "Necesario enviar usuario y contraseña!", logging: true });
    }

    try {
        const query_DB = querys.authDatabase;
        const result = await mainPool.request().input('IdUsuarioOLEI', IdUsuarioOLEI).query(query_DB);
        const cleanResult = result?.recordset[0];

        if (!cleanResult) {
            throw new BadRequestError({ code: 401, message: `No se encontro el usuario: ${IdUsuarioOLEI}`, logging: true });
        }

        if (cleanResult.PasswordOLEI.trim() !== PasswordOLEI) {
            throw new BadRequestError({ code: 401, message: `Contraseña incorrecta`, logging: true });
        }

        const user = {
            BaseSQL: cleanResult.BaseSQL,
            RazonSocial: cleanResult.RazonSocial
        };

        const tokenDB = await generateJWTDB({ IdUsuarioOLEI: cleanResult.IdUsuarioOLEI.trim() });

        const datosDelUsuario: UserSessionInterface = {
            serverclientes: cleanResult.ServidorSQL.trim(),
            baseclientes: cleanResult.BaseSQL.trim(),
            PasswordSQL: cleanResult.PasswordSQL.trim(),
            UsuarioSQL: cleanResult.UsuarioSQL.trim(),
            IdUsuarioOLEI: cleanResult.IdUsuarioOLEI.trim(),
            RazonSocial: cleanResult.RazonSocial.trim(),
            SwImagenes: cleanResult.SwImagenes,
            Vigencia: cleanResult.Vigencia,
            userId: undefined,
            userRol: undefined,
            from: 'mobil'
        };

        (req.session as any).user = datosDelUsuario;

        console.log({session: req.sessionID})

        return res.json({
            tokenDB,
            user
        });

    } catch (error) {
        next(error);
    }
}

const login = async (req: Request, res: Response, next: NextFunction) => {

    const sessionId = req.sessionID;
    const { user: userFR } = await handleGetSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { serverclientes, baseclientes, PasswordSQL, UsuarioSQL } = userFR;

    // STEP 1 - LOGIN
    const pool = await dbConnection(serverclientes, baseclientes, UsuarioSQL, PasswordSQL);

    if (!pool) {
        throw new BadRequestError({ code: 500, message: "Error connecting to the main database", logging: true });
    }

    try {
        // Search for the user in the database using their email.
        const { Id_Usuario, password } = req.body;

        if (Id_Usuario.trim() === "" || password.trim() === "") {
            throw new BadRequestError({ code: 404, message: "Necesario escribir correo y contraseña", logging: true });
        }

        const request = pool.request();
        request.input('Id_Usuario', sql.VarChar(50), Id_Usuario);
        request.input('Password', sql.VarChar(50), password);

        const resultData = await request.execute('sp_AuthenticateAndGetMovement');
        const Validations = (resultData.recordsets as any)[0] as ValidationResult[];

        if (Validations[0].Tipo === "usuario" && Validations[0].Resultado !== 1) {
            throw new BadRequestError({ code: 404, message: "Correo no encontrada", logging: true });
        }

        if (Validations[1].Tipo === "contrasena" && Validations[1].Resultado !== 1) {
            throw new BadRequestError({ code: 404, message: "Contraseña incorrecta", logging: true });
        }

        const User = (resultData.recordsets as any)[1][0] as MovementDetail;

        const token = await generateJWT({ id: Id_Usuario.trim() });

        (req.session as any).user = {
            ...(req.session as any).user,
            userId: Id_Usuario.trim(),
            userRol: User.Id_Perfil
        }

        const userStorage = {
            Id_Usuario,
            Id_TipoMovInv: {
                Id_TipoMovInv: User.Id_TipoMovInv,
                Accion: User.Accion,
                Descripcion: User.Descripcion,
                Id_AlmDest: User.Id_AlmDest
            }
        }

        return res.json({
            userStorage,
            token
        });

    } catch (error) {
        next(error);
    }
};

const renewDB = async (req: Request, res: Response, next: NextFunction) => {

    // Get session from REDIS.
    const sessionId = req.sessionID;
    const { user: userFR } = await handleGetSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { baseclientes, IdUsuarioOLEI, RazonSocial, userId, userRol } = userFR;

    try {
        const token = await generateJWTDB({ IdUsuarioOLEI });

        if (!token) {
            throw new BadRequestError({ code: 401, message: "Failed to generate token", logging: true });
        };

        // User to Redis.
        const userRedis: UserSessionInterface = {
            ...userFR,
            userId: userId ? userId : undefined,
            userRol: userRol ? userRol : undefined
        };

        // User to Frontend.
        const user = {
            BaseSQL: baseclientes,
            RazonSocial: RazonSocial
        };

        if (!userFR) {
            throw new BadRequestError({ code: 401, message: "User data is neccesary", logging: true });
        };

        (req.session as any).user = userRedis

        res.json({
            token,
            user
        });

    } catch (error) {
        next(error);
    }
}

const renewLogin = async (req: Request, res: Response, next: NextFunction) => {

    const sessionId = req.sessionID;
    const { user: userFR } = await handleGetSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { serverclientes, baseclientes, userId, userRol } = userFR;

    try {

        if (!userId && !userRol) {
            throw new BadRequestError({ code: 401, message: "User not authenticated", logging: true });
        };

        if (!serverclientes && !baseclientes) {
            throw new BadRequestError({ code: 401, message: "Server and base data is neccessary", logging: true });
        };

        const token = await generateJWT({ id: userId as string });

        if (!token) {
            throw new BadRequestError({ code: 401, message: "Failed to generate token", logging: true });
        };

        const user = {
            Id_Usuario: userId
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
    const sessionId = req.sessionID;

    const { user: userFR } = await handleGetSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    try {

        (req.session as any).user = {
            ...(req.session as any).user,
            userId: undefined,
            userRol: undefined
        };


        res.json({
            user: userFR
        })

    } catch (error) {
        next(error);
    }
}

const logoutDB = async (req: Request, res: Response, next: NextFunction) => {

    const sessionId = req.sessionID;
    if (!sessionId) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    try {
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