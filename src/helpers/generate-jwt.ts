import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';

/** Genera un Access Token con expiración corta (ej. 15min) */
export const generateAccessToken = (sessionId: string): string => {
    return jwt.sign({ sessionId }, ACCESS_TOKEN_SECRET, { expiresIn: '30s' });
};

/** Genera un Refresh Token con expiración larga (ej. 30 días) */
export const generateRefreshToken = (sessionId: string): string => {
    return jwt.sign({ sessionId }, REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
};


/** Genera un Access Token con expiración corta (ej. 15min) */
export const generateAccessTokenWeb = (sessionId: string): string => {
    return jwt.sign({ sessionId }, 'access_secret', { expiresIn: '15m' });
};

/** Genera un Refresh Token con expiración larga (ej. 30 días) */
export const generateRefreshTokenWeb = (sessionId: string): string => {
    return jwt.sign({ sessionId }, REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
};
