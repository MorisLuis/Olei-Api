import type { NextFunction, Request, Response } from 'express';
import type { UserSessionInterface } from '../../interface/user';
import { loginAppService, loginDBAppService } from '../../services/authAppServices';
import { UnauthorizedError } from '../../errors/CustomError';
import { v4 } from 'uuid';
import { generateAccessToken, generateAccessTokenServer, generateRefreshToken } from '../../helpers/generate-jwt';
import { generateRedisSession, handleDeleteRedisSession, updateSession } from '../../helpers/generate-redis';

const loginServer = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { IdUsuarioOLEI, PasswordOLEI } = req.body;

        const { result } = await loginDBAppService({
            IdUsuarioOLEI,
            PasswordOLEI
        });

        // Session redis
        const datosDelUsuario: UserSessionInterface = {
            ServidorSQL: result.ServidorSQL.trim(),
            BaseSQL: result.BaseSQL.trim(),
            UsuarioSQL: result.UsuarioSQL.trim(),
            PasswordSQL: result.PasswordSQL.trim(),

            IdUsuarioOLEI: result.IdUsuarioOLEI.trim(),
            PasswordOLEI: result.PasswordOLEI,

            RazonSocial: result.RazonSocial.trim(),
            SwImagenes: result.SwImagenes,
            Vigencia: result.Vigencia,
            from: 'mobil',
            userConected: false,
            serverConected: true
        };

        // Generar un ID de sesión único
        const sessionId = v4();

        console.log({sessionId})
        // Guardar la sesión en Redis con expiración (1 hora)
        await generateRedisSession(sessionId, datosDelUsuario)

        // Generar el token JWT que incluye el sessionId
        const tokenServer = generateAccessTokenServer(sessionId);

        return res.json({
            user: datosDelUsuario,
            tokenServer
        })

    } catch (error) {
        next(error);
    }
};

const login = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const session = req.session;
        const sessionId = req.sessionId;

        const { Id_Usuario, password } = req.body;
        const { userData } = await loginAppService({
            Id_Usuario,
            password,
            session
        });

        const datosDelUsuario: UserSessionInterface = {
            ...session,
            userId: Id_Usuario.trim(),
            userRol: userData.Id_Perfil,
            TodosAlmacenes: userData.TodosAlmacenes,
            SalidaSinExistencias: userData.SalidaSinExistencias,
            Id_Almacen: userData.Id_Almacen,
            Id_ListPre: userData.Id_ListPre,
            AlmacenNombre: userData.AlmacenNombre,
            serverConected: session.serverConected,
            userConected: true,
        };

        await updateSession(sessionId, datosDelUsuario);

        // Generar el token JWT que incluye el sessionId
        const token = generateAccessToken(sessionId)
        const refreshToken = generateRefreshToken(sessionId);

        return res.json({
            token,
            refreshToken,
            user: datosDelUsuario,
        });

    } catch (error) {
        next(error);
    }
};

const logoutServer = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const sessionId = req.sessionId;
        if (!sessionId) throw new UnauthorizedError('Sesion terminada')
        await handleDeleteRedisSession(sessionId)
        res.json({ ok: true })
    } catch (error) {
        next(error);
    };
};

const logoutUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const sessionUser = req.session;
        const sessionId = req.sessionId;

        if (!sessionUser) {
            throw new UnauthorizedError('Sesion terminada')
        }

        const datosDelUsuario: UserSessionInterface = {
            ...sessionUser,
            userId: '',
            userRol: '',
            TodosAlmacenes: 0,
            SalidaSinExistencias: 0,
            Id_Almacen: 0,
            Id_ListPre: 0,
            AlmacenNombre: '',
            userConected: false
        };

        await updateSession(sessionId, datosDelUsuario);

        return res.json({
            user: datosDelUsuario
        });

    } catch (error) {
        next(error);
    }
};

const refreshServer = (req: Request, res: Response, next: NextFunction): void => {

    try {
        const session = req.session;

        res.json({
            user: session
        });

    } catch (error) {
        next(error);
    }
};

const refresh =  (req: Request, res: Response, next: NextFunction): Response | void => {

    try {
        const session = req.session;
        const sessionId = req.sessionId;

        const refreshToken = req.body.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: "No hay refresh token" });
        }

        const newToken = generateAccessToken(sessionId)
        const newRefreshToken = generateRefreshToken(sessionId);

        res.json({
            token: newToken,
            user: session,
            refreshToken: newRefreshToken
        });

    } catch (error) {
        next(error);
    }
};

export {
    loginServer,
    login,
    logoutUser,
    logoutServer,
    refreshServer,
    refresh
}