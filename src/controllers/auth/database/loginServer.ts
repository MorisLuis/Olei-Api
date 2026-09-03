import type { NextFunction, Request, Response } from 'express';

import { loginDB } from '../../../services/auth/database';
import { loginServerBodySchema } from '../../../validations/authDatabaseValidations';
import { successResponse } from '../../../helpers/response';

/**
 * @description Authenticates the App against the central tenant database and establishes the server session.
 * @client App
 * @router POST /api/auth/loginServer
 * @request Validated body fields `IdUsuarioOLEI` and `PasswordOLEI`.
 * @response Standard success response containing `user` and `tokenServer`; validation and authentication failures are forwarded to `next`.
 */
export const loginServer = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { IdUsuarioOLEI, PasswordOLEI } = loginServerBodySchema.parse(req.body);

        const { user, tokenServer } = await loginDB({
            IdUsuarioOLEI,
            PasswordOLEI
        });

        successResponse(req, res, { user, tokenServer }, "Login successful", 200);
    } catch (error) {
        next(error);
    }
};
