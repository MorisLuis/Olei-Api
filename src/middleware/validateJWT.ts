import type { NextFunction, Request, Response } from 'express'
import type { JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import { AppError, ForbiddenError, UnauthorizedError } from '../errors/CustomError';
import redisClient from '../config/redisClient';
import type { UserSessionInterface, UserWebSessionInterface } from '../interface/user';

const validateJWTServer = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {

    const authHeader = req.headers['x-server-token'] as string;
    const tokenServer = authHeader?.split(' ')[1];

    if (!tokenServer) {
        next(new UnauthorizedError('validateJWTServer - Acceso denegado. Falta token o es invalido'));
        return
    };

    try {
        const decoded = jwt.verify(tokenServer, process.env.ACCESS_TOKEN_SEVER_SECRET as string) as JwtPayload;
        const sessionId = decoded.sessionId;

        if (!sessionId) {
            next(new UnauthorizedError('validateJWTServer - Acceso denegado. Falta token o es invalido'))
            return
        }


        const sessionDataRaw = await redisClient.get(`session:${sessionId}`);
        const sessionData = sessionDataRaw ?? null;

        if (!sessionData) {
            next(new UnauthorizedError('validateJWTServer - Sesión no válida'));
            return
        }

        try {
            const session: UserSessionInterface = JSON.parse(sessionData);

            // Verificar si las conexiones requeridas están activas
            if (!session.serverConected) {
                next(new ForbiddenError('Server connection required'));
                return
            }

            req.sessionId = sessionId;
            req.session = session;
            return next();
        } catch (error) {
            next(new AppError(`Error parsing session data: ${error}`));
            return
        }

    } catch (error) {
        next(new ForbiddenError(`Token expirado o inválido: ${error}`));

    }
};

const validateJWTRefresh = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {

    // Obtener el refreshToken del body
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
        return next(new ForbiddenError('Token inválido o expirado'));
    }

    try {
        // Verificar el refreshToken usando la clave secreta específica para el refreshToken
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as JwtPayload;
        const sessionId = decoded.sessionId;


        // Buscar la sesión en Redis usando el sessionId
        const sessionDataRaw = await redisClient.get(`session:${sessionId}`);
        const sessionData = sessionDataRaw ?? null;

        if (!sessionData) {
            return next(new ForbiddenError('Sesion terminada'));
        }

        try {
            // Parsear los datos de la sesión obtenida de Redis
            const session: UserSessionInterface = JSON.parse(sessionData);

            // Verificar si las conexiones requeridas están activas
            if (!session.serverConected || !session.userConected) {
                return next(new ForbiddenError('Server and user connection required'));
            }

            // Guardar la sesión en la solicitud para el uso posterior
            req.sessionId = sessionId;
            req.session = session;

            // Pasar al siguiente middleware
            return next();
        } catch (error) {
            return next(new AppError(`Error parsing session data: ${error}`));
        }

    } catch (error) {
        // Si el refreshToken es inválido o ha expirado
        next(new ForbiddenError(`Token expirado o inválido: ${error}`));
    }
};


/* mobile */
const validateJWT = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {

    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    if (!token) {
        return next(new UnauthorizedError('validateJWT - Acceso denegado. Falta token o es invalido'));
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload;
        const sessionId = decoded.sessionId;


        const sessionDataRaw = await redisClient.get(`session:${sessionId}`);
        const sessionData = sessionDataRaw ?? null;

        if (!sessionData) {
            return next(new UnauthorizedError('validateJWT - Sesión no válida'));
        }

        try {
            const session: UserSessionInterface = JSON.parse(sessionData);

            // Verificar si las conexiones requeridas están activas
            if (!session.serverConected || !session.userConected) {
                return next(new ForbiddenError('Server and user connection required'));
            }

            req.sessionId = sessionId;
            req.session = session;
            return next();
        } catch (error) {
            return next(new AppError(`Error parsing session data ${error}`));
        }

    } catch (error) {
        next(new ForbiddenError(`Token expirado o inválido: ${error}`));
    }
};

/* web */
const validateJWTWeb = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return next(new UnauthorizedError('Acceso denegado. Falta token o es invalido'));
    }

    try {
        const decoded = jwt.verify(token, 'access_secret') as JwtPayload;
        const sessionId = decoded.sessionId;

        req.sessionId = sessionId;

        const sessionDataRaw = await redisClient.get(`session:${sessionId}`);
        const sessionData = sessionDataRaw ?? null;

        if (!sessionData) {
            return next(new UnauthorizedError('Sesión no válida'));
        }

        try {
            const session: UserWebSessionInterface = JSON.parse(sessionData);
            req.sessionWeb = session;
            return next();
        } catch (error) {
            return next(new AppError(`Error parsing session data: ${error}`));
        }

    } catch (error) {
        next(new ForbiddenError(`Token expirado o inválido: ${error}`));
    }
};

export {
    validateJWTServer,
    validateJWT,
    validateJWTRefresh,
    validateJWTWeb
};
