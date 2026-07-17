import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';

import { AppError, ForbiddenError, UnauthorizedError } from '../../errors/CustomError';
import { verifyTokenAndExtractSessionId, buildVerifyOptions, extractBearerToken} from './token.helpers';
import { getSessionOrUnauthorized} from './session.helpers';
import { getRedisSession } from '../../services/auth/database/session.service';
import { logoutServerService } from '../../services/auth/database/logoutServer.service';
import { AUTH_ERROR_CODES } from '../constants';


export const validateJWTDatabase = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const tokenServer = extractBearerToken(req.headers['x-server-token']); // Token 1

    if (!tokenServer) {
        return next(new UnauthorizedError('Session is invalid or expired', '', AUTH_ERROR_CODES.SESSION_EXPIRADA));
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

        sessionId = verifyTokenAndExtractSessionId(
            tokenServer,
            process.env.ACCESS_TOKEN_SEVER_SECRET,
            serverVerifyOptions,
            AUTH_ERROR_CODES.SESSION_EXPIRADA,
            'Session is invalid or expired'
        );

        const session = await getSessionOrUnauthorized(
            sessionId,
            AUTH_ERROR_CODES.SESSION_EXPIRADA,
            'Session is invalid or expired'
        );

        if (!session.serverConected) {
            return next(new ForbiddenError('Server connection required'));
        }

        req.sessionId = sessionId;
        req.session = session;
    } catch (error) {

        if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
            return next(error);
        }

        if (error instanceof jwt.TokenExpiredError) {

            const decoded = jwt.decode(tokenServer) as JwtPayload;
            if (decoded?.sessionId) {
                const session = await getRedisSession(decoded.sessionId);
                if (session) {
                    await logoutServerService({ sessionId: decoded.sessionId, session });
                }
            }

            return next(new UnauthorizedError(
                'Session is invalid or expired',
                error.message,
                AUTH_ERROR_CODES.TOKEN_EXPIRADO,
            ));
        }

        return next(new UnauthorizedError(
            `JWT verification failed: ${error instanceof Error ? error.name : 'unknown_error'}`,
            error instanceof Error ? error.message : 'unknown_error',
            AUTH_ERROR_CODES.TOKEN_INVALIDO,
        ));

    };

    return next();
};
