import type { NextFunction, Request, Response } from 'express';
import { ForbiddenError } from '../../../errors/CustomError';
import { refreshAppBodySchema } from '../../../validations/authDatabaseValidations';
import { successResponse } from '../../../helpers/response';
import { refreshAppService } from '../../../services/auth/client/refreshApp.service';


/**
 * @description Refreshes the access token and refresh token for the authenticated user.
 * Return the new access token, refresh token, and sanitized user information in the response.
 * The sanitized user is the session stored in login database and login app.
 * 
 * @route POST /auth/refresh
 * @access Public
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