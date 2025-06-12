import type { NextFunction, Request, Response } from 'express'
import type { JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import { AppError, ForbiddenError, UnauthorizedError } from '../errors/CustomError';
import redisClient from '../config/redisClient';
import type { UserSessionInterface } from '../interface/user';



const validateJWT = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authHeaderServer = req.headers['x-server-token'] as string;
    const tokenServer = authHeaderServer?.split(' ')[1]; // Token 1

    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1]; // Token 2

    // 1️⃣ Validar que venga el token 1 (server token)
    if (!tokenServer) {
        return next(new UnauthorizedError('SESSION_EXPIRADA', 'Session is invalid or expired'));
    };

    if (!process.env.ACCESS_TOKEN_SEVER_SECRET) {
        return next(new AppError('Config error: falta ACCESS_TOKEN_SEVER_SECRET'));
    };

    let sessionId: string;

    try {

        const decoded = jwt.verify(tokenServer, process.env.ACCESS_TOKEN_SEVER_SECRET) as JwtPayload;
        sessionId = decoded.sessionId;

        if (!sessionId) return next(new UnauthorizedError('SESSION_EXPIRADA', 'Session is invalid or expired'));

        const sessionDataRaw = await redisClient.get(`session:${sessionId}`);
        if (!sessionDataRaw) return next(new UnauthorizedError('SESSION_EXPIRADA', 'Session is invalid or expired'));


        const session: UserSessionInterface = JSON.parse(sessionDataRaw);

        if (!session.serverConected) {
            return next(new ForbiddenError('Server connection required'));
        }

        req.sessionId = sessionId;
        req.session = session;
    } catch (error) {
        return next(new UnauthorizedError(
            'TOKEN_EXPIRADO',
            `JWT verification failed: ${error instanceof Error ? error.message : String(error)}`
        ));

    }

    // 2️⃣ Validar token 2 si viene.
    if (token) {
        try {
            if (!process.env.ACCESS_TOKEN_SECRET) return next(new AppError('Config error: falta ACCESS_TOKEN_SECRET'));
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) as JwtPayload;
            // No hacemos nada con esto por ahora, solo validamos que sea válido.
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                return next(new UnauthorizedError(
                    'TOKEN_2_EXPIRADO',
                    `JWT verification failed: ${error instanceof Error ? error.message : String(error)}`
                ));
            };

            return next(new UnauthorizedError(
                'TOKEN_2_INVALIDO',
                `JWT verification failed: ${error instanceof Error ? error.message : String(error)}`
            ));
        }
    };

    // ✅ Todo fine, pasar al siguiente middleware
    return next();
};


const validateJWTokenServer = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authHeaderServer = req.headers['x-server-token'] as string;
    const tokenServer = authHeaderServer?.split(' ')[1]; // Token 1

    // 1️⃣ Validar que venga el token 1 (server token)
    if (!tokenServer) {
        return next(new UnauthorizedError('SESSION_EXPIRADA', 'Session is invalid or expired'));
    };

    if (!process.env.ACCESS_TOKEN_SEVER_SECRET) {
        return next(new AppError('Config error: falta ACCESS_TOKEN_SEVER_SECRET'));
    };

    let sessionId: string;

    try {

        const decoded = jwt.verify(tokenServer, process.env.ACCESS_TOKEN_SEVER_SECRET) as JwtPayload;
        sessionId = decoded.sessionId;

        if (!sessionId) return next(new UnauthorizedError('SESSION_EXPIRADA', 'Session is invalid or expired'));

        const sessionDataRaw = await redisClient.get(`session:${sessionId}`);
        if (!sessionDataRaw) return next(new UnauthorizedError('SESSION_EXPIRADA', 'Session is invalid or expired'));


        const session: UserSessionInterface = JSON.parse(sessionDataRaw);

        if (!session.serverConected) {
            return next(new ForbiddenError('Server connection required'));
        }

        req.sessionId = sessionId;
        req.session = session;
    } catch (error) {
        return next(new UnauthorizedError(
            'TOKEN_EXPIRADO',
            `JWT verification failed: ${error instanceof Error ? error.message : String(error)}`
        ));
    };

    // ✅ Todo fine, pasar al siguiente middleware
    return next();
};


const validateRefreshToken = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {

    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
        return next(new UnauthorizedError('REFRESH_TOKEN_EXPIRADO', 'Session is invalid or expired'));
    };

    if (!process.env.REFRESH_TOKEN_SECRET) {
        return next(new AppError('Falta la clave secreta del refresh token'));
    };

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET) as JwtPayload;
        const sessionId = decoded.sessionId;

        if (!sessionId) return next(new UnauthorizedError('SESSION_EXPIRADA', 'Session is invalid or expired'));

        const sessionDataRaw = await redisClient.get(`session:${sessionId}`);
        if (!sessionDataRaw) return next(new UnauthorizedError('SESSION_EXPIRADA', 'Session is invalid or expired'));

        const session: UserSessionInterface = JSON.parse(sessionDataRaw);

        if (!session.serverConected || !session.userConected) {
            return next(new UnauthorizedError('REFRESH_TOKEN_EXPIRADO', 'Session is invalid or expired'));
        };

        req.sessionId = sessionId;
        req.session = session;

        next();


    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return next(new UnauthorizedError(
                'REFRESH_TOKEN_EXPIRADO',
                `JWT verification failed: ${error instanceof Error ? error.message : String(error)}`
            ));
        }
        return next(new AppError('Error al validar el refresh token'));
    }

};



export {
    validateJWT,
    validateJWTokenServer,
    validateRefreshToken
};
