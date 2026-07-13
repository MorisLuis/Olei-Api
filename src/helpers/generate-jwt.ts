import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;


/* WEB */
export const generateAccessTokenWeb = (sessionId: string): string => {
    if (!ACCESS_TOKEN_SECRET) {
        throw new Error('Missing ACCESS_TOKEN_SECRET');
    }

    return jwt.sign({ sessionId }, ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
};

export const generateRefreshTokenWeb = (sessionId: string): string => {
    if (!REFRESH_TOKEN_SECRET) {
        throw new Error('Missing REFRESH_TOKEN_SECRET');
    }

    return jwt.sign({ sessionId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};
