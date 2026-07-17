import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';

import { AppError, UnauthorizedError } from '../../errors/CustomError';
import { logoutAppService } from '../../services/auth/client/logoutApp.service';
import { getRedisSession } from '../../services/auth/database/session.service';
import { verifyTokenAndExtractSessionId, buildVerifyOptions } from './token.helpers';
import { getSessionOrUnauthorized} from './session.helpers';

export const validateRefreshToken = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {

    const refreshToken = req.body?.refreshToken;

    if (typeof refreshToken !== 'string' || !refreshToken.trim()) {
        // REFRESH_TOKEN_EXPIRADO
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

        const sessionId = verifyTokenAndExtractSessionId(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            refreshVerifyOptions,
            'SESSION_EXPIRADA',
            'Session is invalid or expired'
        );

        const session = await getSessionOrUnauthorized(
            sessionId,
            'SESSION_EXPIRADA',
            'Session is invalid or expired'
        );

        if (!session.serverConected || !session.userConected) {
            // REFRESH_TOKEN_EXPIRADO
            return next(new UnauthorizedError('REFRESH_TOKEN_EXPIRADO', 'Session is invalid or expired'));
        };

        req.sessionId = sessionId;
        req.session = session;
        return next();

    } catch (error) {

        if (error instanceof UnauthorizedError) {
            return next(error);
        }

        if (error instanceof jwt.TokenExpiredError) {

            const decoded = jwt.decode(refreshToken) as JwtPayload;
            if (decoded?.sessionId) {
                const session = await getRedisSession(decoded.sessionId);
                if (session) {
                    await logoutAppService({ sessionId: decoded.sessionId, session });
                }
            }

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