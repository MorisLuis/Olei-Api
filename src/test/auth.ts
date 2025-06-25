import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const auth = (req: Request, res: Response, next: NextFunction): void | Response => {

    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1]; // Token 2

    // 1️⃣ Validar que venga el token 1 (server token)
    if (!token) {
        return res.status(401).json({ error: 'No token' });
    };

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        req.user = decoded;
        return next();
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
