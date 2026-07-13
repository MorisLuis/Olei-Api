import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

/**
 * @description Generates an access token for the given session ID using the configured secret and options.
 * The access token is signed with the HS256 algorithm and has a short expiration time (15 minutes).
 * @param sessionId - The unique identifier for the user session.
 * @throws {Error} Throws an error if the ACCESS_TOKEN_SECRET is not defined in the environment variables.
 * @returns {string} Returns the generated access token as a string.
 */

export const generateAccessToken = (sessionId: string): string => {
    if (!ACCESS_TOKEN_SECRET) {
        throw new Error('Missing ACCESS_TOKEN_SECRET');
    }

    return jwt.sign(
        { sessionId },
        ACCESS_TOKEN_SECRET,
        {
            algorithm: "HS256",
            expiresIn: '15min',
            issuer: process.env.JWT_ACCESS_ISSUER,
            audience: process.env.JWT_ACCESS_AUDIENCE,
            subject: process.env.JWT_ACCESS_SUBJECT
        });
};


/**
 * @description Generates a refresh token for the given session ID using the configured secret and options.
 * The refresh token is signed with the HS256 algorithm and has a longer expiration time (1 day).
 * @throws {Error} Throws an error if the REFRESH_TOKEN_SECRET is not defined in the environment variables.
 * @param sessionId - The unique identifier for the user session.
 * @returns {string} Returns the generated refresh token as a string.
 */

export const generateRefreshToken = (sessionId: string): string => {
    if (!REFRESH_TOKEN_SECRET) {
        throw new Error('Missing REFRESH_TOKEN_SECRET');
    }

    return jwt.sign({ sessionId }, REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
};
