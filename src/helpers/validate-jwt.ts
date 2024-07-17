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

    serverweb: string;
    baseweb: string;
}


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


// Middleware to validate JWT from second login. (App)
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

// (Web)
const validateJWTWeb = async (req: Req, res: Response, next: NextFunction) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log({token})

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

            const { serverweb, baseweb, id, rol, clientid } = decoded as { serverweb: string; baseweb: string, id: string, rol: number, clientid: number };
            req.id = id;
            req.rol = rol;
            req.serverweb = serverweb;
            req.baseweb = baseweb;
            req.clientid = clientid;
            next();
        });
    } catch (error) {
        console.log({ error });
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export { validateJWTDB, validateJWT, validateJWTWeb };