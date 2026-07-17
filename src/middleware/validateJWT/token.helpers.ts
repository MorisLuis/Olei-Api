import jwt from 'jsonwebtoken';
import type { JwtPayload, VerifyOptions } from 'jsonwebtoken';

import { UnauthorizedError } from '../../errors/CustomError';


/**
 * @description Extracts the Bearer token from the provided header value.
 * @param headerValue The value of the header from which to extract the token.
 * @returns The extracted token if valid, otherwise null.
 * @example
 * const token = extractBearerToken(req.headers['authorization']);
 * or
 * const token = extractBearerToken(req.headers['x-server-token']);
 */
export const extractBearerToken = (headerValue: string | string[] | undefined): string | null => {
    if (typeof headerValue !== 'string') return null;
    const [scheme, token, ...rest] = headerValue.trim().split(/\s+/);
    if (rest.length > 0) return null;
    if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) return null;
    return token;
};

/**
 * @description Builds the options object for verifying a JWT token.
 * @param issuer The expected issuer of the token.
 * @param audience The expected audience of the token.
 * @param subject The expected subject of the token.
 * @returns An object containing the verification options for jwt.verify().
 * @example
 * const options = buildVerifyOptions('my-issuer', 'my-audience', 'my-subject');
 * const decoded = jwt.verify(token, secret, options);
 */
export const buildVerifyOptions = (issuer?: string, audience?: string, subject?: string): VerifyOptions => {
    const options: VerifyOptions = { algorithms: ['HS256'] };
    if (issuer) options.issuer = issuer;
    if (audience) options.audience = audience;
    if (subject) options.subject = subject;
    return options;
};


/**
 * @description Verifies a JWT token and extracts the sessionId from its payload. 
 * If the token is invalid or the sessionId is missing, it throws an UnauthorizedError.
 * @param token The JWT token to verify.
 * @param secret The secret key used to verify the token.
 * @param verifyOptions The options for verifying the token.
 * @param errorCode The error code to use if the token is invalid or the sessionId is missing.
 * @param errorMessage The error message to use if the token is invalid or the sessionId is missing.
 * @returns The sessionId extracted from the token's payload.
 * @throws {UnauthorizedError} If the token is invalid or the sessionId is missing.
 * @example
 * const sessionId = verifyTokenAndExtractSessionId(token, secret, options, 'SESSION_EXPIRADA', 'Session is invalid or expired');
 */
export const verifyTokenAndExtractSessionId = (
    token: string,
    secret: string,
    verifyOptions: VerifyOptions,
    errorCode = 'SESSION_EXPIRADA',
    errorMessage = 'Session is invalid or expired'
): string => {
    const decoded = jwt.verify(token, secret, verifyOptions) as JwtPayload;
    const sessionId = decoded.sessionId;

    if (!sessionId) {
        throw new UnauthorizedError(errorCode, errorMessage);
    }

    return sessionId;
};