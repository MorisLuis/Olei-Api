import type { NextFunction, Request, Response } from 'express';

import { sanitizeServerSessionUser } from './../utils/sessionResponse';
import { successResponse } from '../../../helpers/response';
import { logoutAppService } from '../../../services/auth/client/logoutApp.service';


export const logoutApp = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const sessionUser = req.session;
        const sessionId = req.sessionId;

        const { user } = await logoutAppService({
            sessionId,
            session: sessionUser
        });

        successResponse(req, res, { user: sanitizeServerSessionUser(user) }, "Logout successful", 200);

    } catch (error) {
        next(error);
    }
};
