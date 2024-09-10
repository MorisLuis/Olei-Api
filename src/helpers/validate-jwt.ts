import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken';


// Middleware to validate JWT from first login. (App)
const validateJWTDB = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            ok: false,
            message: 'Access denied. Token missing or invalid.',
        });
    }

    try {
        jwt.verify(token, process.env.SECRETORPRIVATEKEY || '', (err, decoded) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Failed to authenticate token' });
            }

            const { IdUsuarioOLEI } = decoded as { IdUsuarioOLEI: string };

            req.IdUsuarioOLEI = IdUsuarioOLEI;
            next();
        });
    } catch (error) {
        console.log({ error });
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


// Middleware to validate JWT from second login. (App)
const validateJWT = async (req: Request, res: Response, next: NextFunction) => {

    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            ok: false,
            message: 'Access denied. Token missing or invalid.',
        });
    }

    try {
        jwt.verify(token, process.env.SECRETORPRIVATEKEY || '', (err, decoded) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Failed to authenticate token' });
            }

            const { id } = decoded as { id: string };

            req.id = id;
            next();
        });
    } catch (error) {
        console.log({ error });
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// (Web)
const validateJWTWeb = async (req: Request, res: Response, next: NextFunction) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            ok: false,
            message: 'Access denied. Token missing or invalid.',
        });
    }

    try {
        jwt.verify(token, process.env.SECRETORPRIVATEKEY || '', (err, decoded) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Failed to authenticate token' });
            }

            const {  Id  } = decoded as {  Id: string };
            req.Id = Id;
            next();
        });
    } catch (error) {
        console.log({ error });
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export { validateJWTDB, validateJWT, validateJWTWeb };