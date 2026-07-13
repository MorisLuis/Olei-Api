import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';

import { AppError, UnauthorizedError } from '../../errors/CustomError';
import redisClient from '../../config/redisClient';
import type { UserSessionInterface } from '../../interface/user';
import { buildVerifyOptions } from './utils';

export const validateRefreshToken = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {

    const refreshToken = req.body?.refreshToken;

    if (typeof refreshToken !== 'string' || !refreshToken.trim()) {
        return next(new UnauthorizedError('REFRESH_TOKEN_EXPIRADO', 'Session is invalid or expired'));
    };

    if (!process.env.REFRESH_TOKEN_SECRET) {
        return next(new AppError('Falta la clave secreta del refresh token'));
    };

    try {
        const refreshVerifyOptions = buildVerifyOptions(
            process.env.JWT_REFRESH_ISSUER,
            process.env.JWT_REFRESH_AUDIENCE,
            process.env.JWT_REFRESH_SUBJECT
        );

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, refreshVerifyOptions) as JwtPayload;
        const sessionId = decoded.sessionId;

        if (!sessionId) return next(new UnauthorizedError('SESSION_EXPIRADA', 'Session is invalid or expired'));

        const sessionDataRaw = await redisClient.get(`session:${sessionId}`);
        if (!sessionDataRaw) return next(new UnauthorizedError('SESSION_EXPIRADA', 'Session is invalid or expired'));

        let session: UserSessionInterface;
        try {
            session = JSON.parse(sessionDataRaw) as UserSessionInterface;
        } catch {
            return next(new UnauthorizedError('SESSION_EXPIRADA', 'Session is invalid or expired'));
        }

        if (!session.serverConected || !session.userConected) {
            return next(new UnauthorizedError('REFRESH_TOKEN_EXPIRADO', 'Session is invalid or expired'));
        };

        req.sessionId = sessionId;
        req.session = session;
        return next();

    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return next(new UnauthorizedError(
                'REFRESH_TOKEN_EXPIRADO',
                'Session is invalid or expired'
            ));
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new UnauthorizedError('REFRESH_TOKEN_INVALIDO', 'Session is invalid or expired'));
        }
        return next(new AppError('Error al validar el refresh token'));
    }

};