import type { NextFunction, Request, Response } from 'express';
import { loginAppBodySchema } from '../../../validations/authDatabaseValidations';
import { loginAppService } from '../../../services/auth/client/loginApp.service';
import { successResponse } from '../../../helpers/response';
import { RequestError } from 'mssql';
import { UnauthorizedError } from '../../../errors/CustomError';
import { AUTH_ERROR_CODES } from '../../../middleware/constants';

const USER_ALREADY_LOGGED_IN_SQL_ERROR = 50002;


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

        if ( error instanceof RequestError && error.number === USER_ALREADY_LOGGED_IN_SQL_ERROR ) {
            return next(new UnauthorizedError(
                "This account is already logged in on another device.",
                error.message,
                AUTH_ERROR_CODES.USER_ALREADY_LOGGED_IN
            ));
        }

        next(error);
    }
};