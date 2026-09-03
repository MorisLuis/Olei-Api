import type { NextFunction, Request, Response } from 'express';
import { generateAccessTokenServer } from '../../../services/auth/database';
import { sanitizeServerSessionUser } from '../utils/sessionResponse';
import { successResponse } from '../../../helpers/response';


/**
 * @description Issues a new App server access token for the current authenticated session.
 * @client App
 * @router POST /api/auth/refreshServer
 * @session Requires the App session and session ID from client authentication middleware.
 * @response Standard success response containing sanitized `user` data and `tokenServer`; token failures are forwarded to `next`.
 */
export const refreshServer = (req: Request, res: Response, next: NextFunction): void => {

    try {
        const session = req.session;
        const sessionId = req.sessionId;
        const tokenServer = generateAccessTokenServer(sessionId);
        successResponse(req, res, { user: sanitizeServerSessionUser(session), tokenServer }, "Token refreshed successfully", 200);
    } catch (error) {
        next(error);
    }
};
