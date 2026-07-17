import { UnauthorizedError } from "../../errors/CustomError";
import type { UserSessionInterface } from "../../interface/user";
import { getRedisSession } from "../../services/auth/database/session.service";

/**
 * @description Retrieves the session data from Redis based on the provided sessionId. If the session is not found, it throws an UnauthorizedError.
 * @param sessionId The ID of the session to retrieve.
 * @param errorCode The error code to use if the session is not found.
 * @param errorMessage The error message to use if the session is not found.
 * @returns A promise that resolves to the UserSessionInterface if the session is found.
 * @throws {UnauthorizedError} If the session is not found in Redis.
 * @example
 * const session = await getSessionOrUnauthorized(sessionId, 'SESSION_EXPIRADA', 'Session is invalid or expired');
 */

export const getSessionOrUnauthorized = async (
    sessionId: string,
    errorCode = 'SESSION_EXPIRADA',
    errorMessage = 'Session is invalid or expired'
): Promise<UserSessionInterface> => {
    try {
        return await getRedisSession(sessionId);
    } catch {
        throw new UnauthorizedError(errorCode, errorMessage);
    }
};