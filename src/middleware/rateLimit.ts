import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/CustomError';
import redisClient from '../config/redisClient';

const LOGIN_WINDOW_SECONDS = 15 * 60;
const LOGIN_MAX_ATTEMPTS = 10;

const getRequestIp = (req: Request): string => {
    const forwardedFor = req.headers['x-forwarded-for'];

    if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
        return forwardedFor.split(',')[0].trim();
    }

    return req.ip || 'unknown';
};

export const loginAppRateLimit = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
        const ip = getRequestIp(req);
        const user = typeof req.body?.Id_Usuario === 'string'
            ? req.body.Id_Usuario.trim().toLowerCase()
            : 'anonymous';

        const key = `ratelimit:auth:login:${ip}:${user}`;
        const attempts = await redisClient.incr(key);

        if (attempts === 1) {
            await redisClient.expire(key, LOGIN_WINDOW_SECONDS);
        }

        if (attempts > LOGIN_MAX_ATTEMPTS) {
            return next(new AppError('Too many login attempts. Please try again later.', 429));
        }

        return next();
    } catch (error) {
        console.warn(`[RATE_LIMIT] Unable to evaluate login limit: ${error instanceof Error ? error.name : 'unknown_error'}`);
        return next();
    }
};
