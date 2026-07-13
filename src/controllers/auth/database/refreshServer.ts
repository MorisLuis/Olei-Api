import type { NextFunction, Request, Response } from 'express';
import { generateAccessTokenServer } from '../../../services/auth/database';
import { sanitizeServerSessionUser } from '../utils/sessionResponse';
import { successResponse } from '../../../helpers/response';


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