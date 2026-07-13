import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';

import { AppError, ForbiddenError, UnauthorizedError } from '../../errors/CustomError';
import redisClient from '../../config/redisClient';
import type { UserSessionInterface } from '../../interface/user';
import { buildVerifyOptions, extractBearerToken } from './utils';

export const validateJWTClient = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const tokenServer = extractBearerToken(req.headers['x-server-token']);
    const token = extractBearerToken(req.headers['authorization']); 

    if (!tokenServer) {
        return next(new UnauthorizedError('SESSION_EXPIRADA', 'Session is invalid or expired / Token 1 is missing'));
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

        if (!sessionId) return next(new UnauthorizedError('SESSION_EXPIRADA', 'Session is invalid or expired / sessionId is missing'));

        const sessionDataRaw = await redisClient.get(`session:${sessionId}`);
        if (!sessionDataRaw) return next(new UnauthorizedError('SESSION_EXPIRADA', 'Session is invalid or expired / session data not found'));

        let session: UserSessionInterface;
        try {
            session = JSON.parse(sessionDataRaw) as UserSessionInterface;
        } catch {
            return next(new UnauthorizedError('SESSION_EXPIRADA', 'Session is invalid or expired / session data is corrupted'));
        }

        if (!session.serverConected) {
            return next(new ForbiddenError('Server connection required / server not connected'));
        }

        req.sessionId = sessionId;
        req.session = session;
    } catch (error) {
        console.log('JWT verification error:', error);
        if (error instanceof jwt.TokenExpiredError) {
            return next(new UnauthorizedError(
                'TOKEN_EXPIRADO',
                'Session is invalid or expired / Token 1 has expired'
            ));
        }

        return next(new UnauthorizedError(
            'TOKEN_EXPIRADO',
            `JWT verification failed: ${error instanceof Error ? error.name : 'unknown_error'}`
        ));
    }

    if (token) {
        try {
            if (!process.env.ACCESS_TOKEN_SECRET) return next(new AppError('Config error: ACCESS_TOKEN_SECRET is missing'));
            const userVerifyOptions = buildVerifyOptions(
                process.env.JWT_ACCESS_ISSUER,
                process.env.JWT_ACCESS_AUDIENCE,
                process.env.JWT_ACCESS_SUBJECT
            );

            const decodedUser = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, userVerifyOptions) as JwtPayload;
            const tokenSessionId = decodedUser.sessionId;

            if (!tokenSessionId || tokenSessionId !== sessionId) {
                return next(new UnauthorizedError(
                    'TOKEN_2_INVALIDO',
                    'Session is invalid or expired / sessionId mismatch'
                ));
            }
        } catch (error) {
            console.log('JWT verification error for user token:', error);
            if (error instanceof jwt.TokenExpiredError) {
                return next(new UnauthorizedError(
                    'TOKEN_2_EXPIRADO',
                    'Session is invalid or expired / Token 2 has expired'
                ));
            };

            return next(new UnauthorizedError(
                'TOKEN_2_INVALIDO',
                'Session is invalid or expired / Token 2 verification failed'
            ));
        }
    }

    return next();
};
