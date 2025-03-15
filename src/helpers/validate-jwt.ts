import { NextFunction, Request, Response } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken';
import { UnauthorizedError } from '../errors/CustomError';


// Middleware to validate JWT from first login. (App)
const validateJWTDB = (req: Request, _res: Response, next: NextFunction): void => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return next(new UnauthorizedError('Acceso denegado. Falto token o es invalido'));
    }

    try {
        jwt.verify(token, process.env.SECRETORPRIVATEKEY || '', (err, decoded) => {
            if (err) {
                return next(new UnauthorizedError('Fallo la autenticación del token'));
            }
            
            const { IdUsuarioOLEI } = decoded as { IdUsuarioOLEI: string };
            req.IdUsuarioOLEI = IdUsuarioOLEI;
            return next();
        });
    } catch (error) {
        return next(new UnauthorizedError(`Fallo la autenticación del token: ${error}`));
    }
};



// Middleware to validate JWT from second login. (App)
const validateJWT = (req: Request, _res: Response, next: NextFunction): void => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return next(new UnauthorizedError('Acceso denegado. Falto token o es invalido'));
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRETORPRIVATEKEY || '') as { Id_mobile: string };
        req.Id_mobile = decoded.Id_mobile;
        next();
    } catch (error) {
        return next(new UnauthorizedError(`Fallo la autenticación del token: ${error}`));
    }
};


/* web */
const validateJWTWeb = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({
            ok: false,
            message: 'Access denied. Token missing or invalid.',
        });
        return; // Retorna undefined
    }

    try {
        const decoded = (await jwt.verify(token, process.env.SECRETORPRIVATEKEY || '')) as JwtPayload;
        const { Id, sessionRedis } = decoded;
        req.Id_web = Id;
        req.sessionRedis = sessionRedis;
        next();
    } catch (error) {
        return next(new UnauthorizedError(`Fallo la autenticación del token: ${error}`));
    }
};




export { validateJWTDB, validateJWT, validateJWTWeb };