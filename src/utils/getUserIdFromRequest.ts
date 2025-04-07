
import type { Request } from "express";
import redisClient from "../config/redisClient";
import type { JwtPayload } from "jsonwebtoken";

import jwt from 'jsonwebtoken';

export const getUserIdFromRequest = async (req: Request): Promise<string | null> => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader?.split(' ')[1];
        if (!token) return null;

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload;
        const sessionId = decoded.sessionId;

        const sessionDataRaw = await redisClient.get(`session:${sessionId}`);
        const session = sessionDataRaw ? JSON.parse(sessionDataRaw) : null;

        const user = session?.userId
            ? `${session?.IdUsuarioOLEI?.toString()}-${session?.userId?.toString()}`
            : session?.IdUsuarioOLEI
                ? `${session?.IdUsuarioOLEI?.toString()}`
                : null;

        return user;
    } catch (_err) {
        return null;
    }
};
