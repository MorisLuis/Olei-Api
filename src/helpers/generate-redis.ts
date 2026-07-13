import redisClient from "../config/redisClient";
import type { UserWebSessionInterface } from "../interface/user";
import { AppError, NotFoundError } from "../errors/CustomError";

export const handleRedisError = (context: string, error: unknown): never => {
    if (error instanceof AppError) {
        throw error;
    }

    throw new AppError(`Error en ${context}: ${error instanceof Error ? error.message : String(error)}`, 500);
};

export const handleDeleteRedisSession = async (sessionId: string): Promise<void> => {
    try {
        const response = await redisClient.del(`session:${sessionId}`);

        if (response === 0) {
            throw new NotFoundError('Sesión no encontrada en Redis');
        }
    } catch (error) {
        return handleRedisError('handleDeleteRedisSession', error);
    }
};


// WEB
export const generateRedisSessionWeb = async (
    sessionId: string,
    datosDelUsuario: UserWebSessionInterface
): Promise<string> => {
    try {
        const result = await redisClient.set(`session:${sessionId}`, JSON.stringify(datosDelUsuario), 'EX', 3600);
        if (!result) {
            throw new AppError('Error al generar la sesión web en Redis', 500);
        }
        return result;
    } catch (error) {
        return handleRedisError('generateRedisSessionWeb', error);
    }
};

export const getRedisWebSession = async (sessionId: string): Promise<UserWebSessionInterface | null> => {
    try {
        const sessionData = await redisClient?.get(`session:${sessionId}`);
        if (!sessionData) {
            throw new NotFoundError('Sesión no encontrada en Redis');
        }
        return JSON.parse(sessionData);
    } catch (error) {
        return handleRedisError('getRedisWebSession', error);
    }
};

export const updateWebSession = async (
    sessionId: string,
    newData: Partial<UserWebSessionInterface>
): Promise<UserWebSessionInterface> => {
    try {
        let session = await getRedisWebSession(sessionId);

        if (!session) {
            throw new NotFoundError('Sesión no encontrada en Redis');
        }

        session = { ...session, ...newData };

        const result = await redisClient.set(`session:${sessionId}`, JSON.stringify(session), 'EX', 3600);

        if (!result) {
            throw new AppError('Error al actualizar la sesión en Redis', 500);
        }

        return session;
    } catch (error) {
        return handleRedisError('updateWebSession', error);
    }
};
