import redisClient from "../../../config/redisClient";
import { AppError, NotFoundError, UnauthorizedError } from "../../../errors/CustomError";
import { handleRedisError } from "../../../helpers/generate-redis";
import type { UserSessionInterface } from "../../../interface/user";


const SESSION_KEY_PREFIX = "session:";
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365; // 31,536,000

const buildSessionKey = (sessionId: string): string =>
    `${SESSION_KEY_PREFIX}${sessionId}`;


/**
 * @description Retrieves a user session from Redis based on the provided session ID.
 * @param {string} sessionId - The unique identifier for the user session.
 * @returns {Promise<UserSessionInterface>} - A promise that resolves to the user session data.
 * @throws {NotFoundError} - If the session is not found in Redis.
 * @throws {AppError} - If there is an error retrieving the session from Redis.
 */

export const getRedisSession = async (sessionId: string): Promise<UserSessionInterface> => {
    try {
        const key = buildSessionKey(sessionId);
        const sessionData = await redisClient.get(key);
        if (!sessionData) {
            throw new UnauthorizedError('Sesión no encontrada en Redis');
        }
        return JSON.parse(sessionData);
    } catch (error) {
        return handleRedisError('getRedisSession', error);
    }
};

/**
 * @description Generates a new user session in Redis with the provided session ID and session data.
 *  The session will expire after one year.
 * @param sessionId - The unique identifier for the user session.
 * @param session - The user session data to be stored in Redis.
 * @returns {Promise<void>} - A promise that resolves when the session is successfully stored in Redis.
 */
export const generateRedisSession = async (sessionId: string, session: UserSessionInterface): Promise<void> => {
    try {
        const key = buildSessionKey(sessionId);
        const result = await redisClient.set(
            key,
            JSON.stringify(session),
            "EX",
            ONE_YEAR_IN_SECONDS
        );

        if (result !== "OK") {
            throw new AppError(
                "Error al generar la sesión en Redis",
                500
            );
        }

    } catch (error) {
        return handleRedisError('generateRedisSession', error);
    }
};


/**
 * @description Updates an existing user session in Redis with new data.
 *  The session will retain its original expiration time.
 * @param sessionId - The unique identifier for the user session.
 * @param newData - The new data to be merged into the existing session.
 * @returns {Promise<UserSessionInterface>} - A promise that resolves to the updated user session data.
 * @throws {NotFoundError} - If the session is not found in Redis or has already expired.
 * @throws {AppError} - If there is an error updating the session in Redis.
 */
export const updateSession = async (
    sessionId: string,
    newData: Partial<UserSessionInterface>
): Promise<UserSessionInterface> => {
    try {
        let session = await getRedisSession(sessionId);
        const key = buildSessionKey(sessionId);

        if (!session) {
            throw new NotFoundError('Sesión no encontrada en Redis');
        }

        const updatedSession: UserSessionInterface = {
            ...session,
            ...newData,
        };

        const ttl = await redisClient.ttl(key);

        if (ttl === -2) {
            throw new NotFoundError('Sesión ya expiró');
        }

        if (ttl === -1) {
            throw new AppError('La sesión no tiene TTL y no se puede conservar', 500);
        }

        const result = await redisClient.set(key, JSON.stringify(updatedSession), 'EX', ttl);

        if (result !== "OK") {
            throw new AppError(
                "Error al actualizar la sesión en Redis",
                500
            );
        }

        return updatedSession;
    } catch (error) {
        return handleRedisError('updateSession', error);
    }
};