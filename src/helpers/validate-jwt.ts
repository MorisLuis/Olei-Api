import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken';

interface Req extends Request {
    serverclientes: string;
    baseclientes: string;
    IdUsuarioOLEI: string;
    id: string;
    rol: number;
    server: string;
    base: string;
}


// Middleware to validate JWT from first login.
const validateJWTDB = async (req: Req, res: Response, next: NextFunction) => {
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

            const { serverclientes, baseclientes, IdUsuarioOLEI } = decoded as { serverclientes: string; baseclientes: string, IdUsuarioOLEI: string };

            req.serverclientes = serverclientes;
            req.baseclientes = baseclientes;
            req.IdUsuarioOLEI = IdUsuarioOLEI;
            next();
        });
    } catch (error) {
        console.log({ error });
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


// Middleware to validate JWT from second login.
const validateJWT = async (req: Req, res: Response, next: NextFunction) => {

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

            const { server, base, id, rol } = decoded as { server: string; base: string, id: string, rol: number };

            req.id = id;
            req.rol = rol;
            req.server = server;
            req.base = base;
            next();
        });
    } catch (error) {
        console.log({ error });
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export { validateJWTDB, validateJWT };