import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SEVER_SECRET = process.env.ACCESS_TOKEN_SEVER_SECRET;

/**
 * @description Generate an access token for the server using the provided session ID.
 * @param sessionId - The session ID to be included in the token payload.
 * @returns A signed JWT access token with the session ID and an expiration of 1 day.
 * @throws Error if the ACCESS_TOKEN_SEVER_SECRET environment variable is not set.
 */

export const generateAccessTokenServer = (sessionId: string): string => {
    if (!ACCESS_TOKEN_SEVER_SECRET) {
        throw new Error('Missing ACCESS_TOKEN_SEVER_SECRET');
    }

    return jwt.sign(
        { sessionId },
        ACCESS_TOKEN_SEVER_SECRET,
        {
            algorithm: "HS256",
            expiresIn: '1y',
            issuer: process.env.JWT_ACCESS_ISSUER,
            audience: process.env.JWT_ACCESS_AUDIENCE,
            subject: process.env.JWT_ACCESS_SUBJECT
        }
    );
}