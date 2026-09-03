import type { NextFunction, Request, Response } from 'express';
import { successResponse } from '../../../helpers/response';
import { logoutServerService } from '../../../services/auth/database/logoutServer.service';

/**
 * @description Ends the App server session and performs tenant logout cleanup.
 * @client App
 * @router GET /api/auth/logoutServer
 * @session Requires the App server session and session ID from client authentication middleware.
 * @response Standard success response containing `{ ok: true }`; failures are forwarded to `next`.
 */
export const logoutServer = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const sessionId = req.sessionId;
        const session = req.session;
        await logoutServerService({ sessionId, session });
        successResponse(req, res, { ok: true }, "Logout successful", 200);
    } catch (error) {
        next(error);
    };
};
