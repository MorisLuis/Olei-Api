import { Request, Response } from 'express';
import sql from "mssql";
import { closeDbConnection, dbConnection, querys } from '../../database';
import { generateJWT, generateJWTDB } from '../../helpers/generate-jwt';
import config from '../../config';
import { MovementDetail, UserSessionInterface, ValidationResult } from '../../interface/user';
import { handleGetSession } from '../../utils/Redis/getSession';
import { handleDeleteRedisSession } from '../../utils/Redis/deleteRedis';

const loginDB = async (req: Request, res: Response) => {

    // STEP 1 - CONNECT TO OLIEDB1_CLIENTES
    const { IdUsuarioOLEI, PasswordOLEI } = req.body;

    const mainPool = await dbConnection(config.dbServer, config.dbDatabase);
    if (!mainPool) {
        return res.status(500).json({ error: 'Error connecting to the main database' });
    }

    if (IdUsuarioOLEI.trim() === "" || PasswordOLEI.trim() === "") {
        return res.status(400).json({ error: 'Necesario enviar usuario y contraseña' });
    }

    try {
        const query_DB = querys.authDatabase;
        const result = await mainPool.request().input('IdUsuarioOLEI', IdUsuarioOLEI).query(query_DB);
        const cleanResult = result?.recordset[0];

        if (!cleanResult) {
            return res.status(401).json({ error: `No se encontro el usuario: ${IdUsuarioOLEI}` });
        }

        if (cleanResult.PasswordOLEI.trim() !== PasswordOLEI) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        const user = {
            BaseSQL: cleanResult.BaseSQL,
            RazonSocial: cleanResult.RazonSocial
        };

        const tokenDB = await generateJWTDB({ IdUsuarioOLEI: cleanResult.IdUsuarioOLEI.trim() });

        const datosDelUsuario : UserSessionInterface = {
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

        return res.json({
            tokenDB,
            user
        });

    } catch (error: any) {
        console.log({ error })
        return res.status(500).send(error.message);
    }
}

const login = async (req: Request, res: Response) => {


    const sessionId = req.sessionID;
    console.log({sessionId})
    const { user: userFR } = await handleGetSession({ sessionId });

    console.log({userFR})
    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }

    const { serverclientes, baseclientes, PasswordSQL, UsuarioSQL } = userFR;

    // STEP 1 - LOGIN
    const pool = await dbConnection(serverclientes, baseclientes, UsuarioSQL, PasswordSQL);

    console.log({pool})

    if (!pool) {
        return res.status(500).json({ error: 'Error connecting to the main database' });
    }

    try {
        // Search for the user in the database using their email.
        const { Id_Usuario, password } = req.body;

        if (Id_Usuario.trim() === "" || password.trim() === "") {
            return res.status(400).json({ error: 'Necesario escribir correo y contraseña' });
        }

        const request = pool.request();
        request.input('Id_Usuario', sql.VarChar(50), Id_Usuario);
        request.input('Password', sql.VarChar(50), password);

        const resultData = await request.execute('sp_AuthenticateAndGetMovement');
        const Validations = (resultData.recordsets as any)[0] as ValidationResult[];

        if (Validations[0].Tipo === "usuario" && Validations[0].Resultado !== 1) {
            return res.status(404).json({ error: 'Correo no encontrado' });
        }

        if (Validations[1].Tipo === "contrasena" && Validations[1].Resultado !== 1) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        const User = (resultData.recordsets as any)[1][0] as MovementDetail;

        const token = await generateJWT({ id: Id_Usuario.trim() });

        (req.session as any).user = {
            ...(req.session as any).user ,
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

    } catch (error: any) {
        console.log({ error })
        return res.status(500).json({ error: error.message || 'Unexpected error' });
    }
};

const renewDB = async (req: Request, res: Response) => {

    // Get session from REDIS.
    const sessionId = req.sessionID;
    const { user: userFR } = await handleGetSession({ sessionId });

    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }

    const { baseclientes, IdUsuarioOLEI, RazonSocial, userId, userRol } = userFR;

    try {
        const token = await generateJWTDB({ IdUsuarioOLEI });

        if (!token) {
            return res.status(401).json({ message: 'Failed to generate token' });
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
            return res.status(401).json({ message: 'User data is neccesary' });
        };

        (req.session as any).user = userRedis

        res.json({
            token,
            user
        });

    } catch (error: any) {
        res.status(500).send(error.message);
        console.log({ error })
    }
}

const renewLogin = async (req: Request, res: Response) => {

    const sessionId = req.sessionID;
    const { user: userFR } = await handleGetSession({ sessionId });

    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }

    const { serverclientes, baseclientes, userId, userRol } = userFR;

    try {

        if (!userId && !userRol) {
            return res.status(401).json({ message: 'User not authenticated' });
        };

        if (!serverclientes && !baseclientes) {
            return res.status(401).json({ message: 'Server and base data is neccessary' });
        };

        const token = await generateJWT({ id: userId as string });

        if (!token) {
            return res.status(401).json({ message: 'Failed to generate token' });
        };

        const user = {
            Id_Usuario: userId
        };

        res.json({
            user,
            token
        });

    } catch (error: any) {
        console.log({ error })
        res.status(500).send(error.message);
    }
}

const logoutUser = async (req: Request, res: Response) => {
    const sessionId = req.sessionID;

    const { user: userFR } = await handleGetSession({ sessionId });

    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
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

    } catch (error: any) {
        console.log({ error })
        res.status(500).send(error.message);
    }
}

const logoutDB = async (req: Request, res: Response) => {

    const sessionId = req.sessionID;
    if (!sessionId) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }

    try {

        await handleDeleteRedisSession({ sessionId });
        await closeDbConnection()
        res.json({ ok: true })

    } catch (error: any) {
        console.log({ error })
        res.status(500).send(error.message);
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