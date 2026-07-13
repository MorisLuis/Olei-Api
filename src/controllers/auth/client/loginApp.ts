import type { NextFunction, Request, Response } from 'express';
import { loginAppBodySchema } from '../../../validations/authDatabaseValidations';
import { loginAppService } from '../../../services/auth/client/loginApp.service';
import { successResponse } from '../../../helpers/response';


export const loginApp = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const session = req.session;
        const sessionId = req.sessionId;
        const { Id_Usuario, password } = loginAppBodySchema.parse(req.body);
        const { user, token, refreshToken } = await loginAppService({
            Id_Usuario,
            password,
            session,
            sessionId
        });

        successResponse(req, res, { user, token, refreshToken }, "Login successful", 200);

    } catch (error) {
        next(error);
    }
};