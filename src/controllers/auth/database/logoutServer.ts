import type { NextFunction, Request, Response } from 'express';
import { successResponse } from '../../../helpers/response';
import { logoutServerService } from '../../../services/auth/database/logoutServer.service';

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
