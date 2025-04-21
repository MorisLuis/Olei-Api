import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SEVER_SECRET = process.env.ACCESS_TOKEN_SEVER_SECRET || 'access_server_secret';
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';

/* MOBILE */
export const generateAccessTokenServer = (sessionId: string): string => {
    return jwt.sign({ sessionId }, ACCESS_TOKEN_SEVER_SECRET, { expiresIn: '1y' });
};

export const generateAccessToken = (sessionId: string): string => {
    return jwt.sign({ sessionId }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (sessionId: string): string => {
    return jwt.sign({ sessionId }, REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
};



/* WEB */
export const generateAccessTokenWeb = (sessionId: string): string => {
    return jwt.sign({ sessionId }, 'access_secret', { expiresIn: '1d' });
};

export const generateRefreshTokenWeb = (sessionId: string): string => {
    return jwt.sign({ sessionId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};
