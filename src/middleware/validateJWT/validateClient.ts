import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';

import { AppError, ForbiddenError, UnauthorizedError } from '../../errors/CustomError';
import { verifyTokenAndExtractSessionId, buildVerifyOptions, extractBearerToken} from './token.helpers';
import { getSessionOrUnauthorized} from './session.helpers';
import { getRedisSession } from '../../services/auth/database/session.service';
import { logoutServerService } from '../../services/auth/database/logoutServer.service';

/**
 * @description Middleware function to validate JWT tokens for client requests. It checks for the presence of two tokens: a server token and a user token. 
 * The server token is required for all requests, while the user token is optional. The middleware verifies both tokens against their respective secrets 
 * and options, ensuring that the session ID in the user token matches the session ID in the server token. If any validation fails, it responds with 
 * appropriate error messages.
 * 
 * @param req - The Express request object.
 * @param _res - The Express response object (not used in this middleware).
 * @param next - The next middleware function in the Express pipeline.
 * @returns A promise that resolves when the middleware has completed its validation.
 */

export const validateJWTClient = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const tokenServer = extractBearerToken(req.headers['x-server-token']);
    const token = extractBearerToken(req.headers['authorization']);

    if (!tokenServer) {
        return next(new UnauthorizedError('SESSION_EXPIRADA', 'Session is invalid or expired / Token server is missing'));
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
            'SESSION_EXPIRADA',
            'Session is invalid or expired / sessionId is missing'
        );

        const session = await getSessionOrUnauthorized(
            sessionId,
            'SESSION_EXPIRADA',
            'Session is invalid or expired / session data not found'
        );

        if (!session.serverConected) {
            return next(new ForbiddenError('Server connection required / server not connected'));
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
                'TOKEN_EXPIRADO',
                'Session is invalid or expired / Token server has expired'
            ));
        }

        return next(new UnauthorizedError(
            'TOKEN_INVALIDO',
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

            const tokenSessionId = verifyTokenAndExtractSessionId(
                token,
                process.env.ACCESS_TOKEN_SECRET,
                userVerifyOptions,
                'TOKEN_2_INVALIDO',
                'Session is invalid or expired / sessionId mismatch'
            );

            if (!tokenSessionId || tokenSessionId !== sessionId) {
                return next(new UnauthorizedError(
                    'TOKEN_2_INVALIDO',
                    'Session is invalid or expired / sessionId mismatch'
                ));
            }
        } catch (error) {

            if (error instanceof UnauthorizedError) {
                return next(error);
            }

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
