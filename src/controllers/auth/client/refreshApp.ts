import type { NextFunction, Request, Response } from 'express';
import { ForbiddenError } from '../../../errors/CustomError';
import { refreshAppBodySchema } from '../../../validations/authDatabaseValidations';
import { successResponse } from '../../../helpers/response';
import { refreshAppService } from '../../../services/auth/client/refreshApp.service';


/**
 * @description Refreshes App access and refresh tokens using the session established by refresh-token middleware.
 * @client App
 * @router POST /api/auth/refresh
 * @request Validated body field `refreshToken`.
 * @session Requires the App session and session ID resolved from the refresh token.
 * @response Standard success response containing the sanitized `user`, `token`, and new `refreshToken`; missing-token and token-generation failures are forwarded to `next`.
 */
export const refreshApp = (req: Request, res: Response, next: NextFunction): Response | void => {
    try {
        const session = req.session;
        const sessionId = req.sessionId;
        const { refreshToken } = refreshAppBodySchema.parse(req.body);

        if (!refreshToken) {
            throw new ForbiddenError('No hay refresh token');
        }

        const { user, token, refreshToken: newRefreshToken } = refreshAppService({
            sessionId,
            session
        });

        successResponse(
            req,
            res,
            { user, token, refreshToken: newRefreshToken },
            "Token refreshed successfully",
            200
        );

    } catch (error) {
        next(error);
    }
};
