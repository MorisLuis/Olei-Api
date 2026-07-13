import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';

import { AppError, ForbiddenError, UnauthorizedError } from '../../errors/CustomError';
import redisClient from '../../config/redisClient';
import type { UserSessionInterface } from '../../interface/user';
import { buildVerifyOptions, extractBearerToken } from './utils';


export const validateJWTDatabase = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const tokenServer = extractBearerToken(req.headers['x-server-token']); // Token 1

    if (!tokenServer) {
        return next(new UnauthorizedError('SESSION_EXPIRADA', 'Session is invalid or expired'));
    };

    if (!process.env.ACCESS_TOKEN_SEVER_SECRET) {
        return next(new AppError('Config error: falta ACCESS_TOKEN_SEVER_SECRET'));
    };

    let sessionId: string;

    try {
        const serverVerifyOptions = buildVerifyOptions(
            process.env.JWT_SERVER_ISSUER,
            process.env.JWT_SERVER_AUDIENCE,
            process.env.JWT_SERVER_SUBJECT
        );

        const decoded = jwt.verify(tokenServer, process.env.ACCESS_TOKEN_SEVER_SECRET, serverVerifyOptions) as JwtPayload;
        sessionId = decoded.sessionId;

        if (!sessionId) return next(new UnauthorizedError('SESSION_EXPIRADA', 'Session is invalid or expired'));

        const sessionDataRaw = await redisClient.get(`session:${sessionId}`);
        if (!sessionDataRaw) return next(new UnauthorizedError('SESSION_EXPIRADA', 'Session is invalid or expired'));


        let session: UserSessionInterface;
        try {
            session = JSON.parse(sessionDataRaw) as UserSessionInterface;
        } catch {
            return next(new UnauthorizedError('SESSION_EXPIRADA', 'Session is invalid or expired'));
        }

        if (!session.serverConected) {
            return next(new ForbiddenError('Server connection required'));
        }

        req.sessionId = sessionId;
        req.session = session;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return next(new UnauthorizedError(
                'TOKEN_EXPIRADO',
                'Session is invalid or expired'
            ));
        }

        return next(new UnauthorizedError(
            'TOKEN_EXPIRADO',
            `JWT verification failed: ${error instanceof Error ? error.name : 'unknown_error'}`
        ));
    };

    return next();
};
