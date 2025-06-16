import type { NextFunction, Request, Response } from 'express'
import type { JwtPayload } from 'jsonwebtoken';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AppError, UnauthorizedError } from '../errors/CustomError';
import redisClient from '../config/redisClient';
import type { UserWebSessionInterface } from '../interface/user';



const validateJWTWeb = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return next(new UnauthorizedError('TOKEN_EXPIRADO', 'Session is invalid or expired'));
    }

    try {
        const decoded = jwt.verify(token, 'access_secret') as JwtPayload;
        const sessionId = decoded.sessionId;

        req.sessionId = sessionId;

        const sessionDataRaw = await redisClient.get(`session:${sessionId}`);
        const sessionData = sessionDataRaw ?? null;

        if (!sessionData) return next(new UnauthorizedError('SESSION_EXPIRADA', 'Session is invalid or expired'));

        try {
            const session: UserWebSessionInterface = JSON.parse(sessionData);
            req.sessionWeb = session;
            return next();
        } catch (error) {
            return next(new AppError(`Error parsing session data: ${error}`));
        }

    } catch (error) {
        switch (true) {
            case error instanceof TokenExpiredError:
                return next(new UnauthorizedError('El token ha expirado, por favor, inicia sesión nuevamente', `JWT verification failed: ${error instanceof Error ? error.message : String(error)}`));

            case error instanceof JsonWebTokenError:
                return next(new UnauthorizedError('Token inválido, por favor verifica tus credenciales', `JWT verification failed: ${error instanceof Error ? error.message : String(error)}`));

            case error instanceof Error:
                return next(new UnauthorizedError(`Fallo al autenticar el token: ${error.message}`, `JWT verification failed: ${error instanceof Error ? error.message : String(error)}`));

            default:
                return next(new UnauthorizedError('Fallo desconocido al autenticar el token', `JWT verification failed: ${error instanceof Error ? error.message : String(error)}`));
        }
    }
};

export {
    validateJWTWeb
}