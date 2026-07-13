import type { NextFunction, Request, Response } from 'express';
import { handleDeleteRedisSession } from '../../../helpers/generate-redis';
import { successResponse } from '../../../helpers/response';

export const logoutServer = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const sessionId = req.sessionId;
        await handleDeleteRedisSession(sessionId)
        successResponse(req, res, { ok: true }, "Logout successful", 200);
    } catch (error) {
        next(error);
    };
};
