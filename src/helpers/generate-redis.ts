import redisClient from "../config/redisClient";
import type { UserSessionInterface, UserWebSessionInterface } from "../interface/user";
import { AppError, NotFoundError } from "../errors/CustomError";


// Generar sesion de redis.
export const generateRedisSession = async (sessionId: string, datosDelUsuario: UserSessionInterface): Promise<string | null> => {
    try {
        const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365; // 31,536,000

        const result = await redisClient.set(`session:${sessionId}`, JSON.stringify(datosDelUsuario), 'EX', ONE_YEAR_IN_SECONDS);
        if (!result) {
            throw new AppError('Error al generar la sesión en Redis', 500);
        }
        return result;
    } catch (error) {
        throw new AppError(`Error en generateRedisSession: ${error}`, 500);
    }
};


// Obtener la sesión desde Redis
export const getRedisSession = async (sessionId: string): Promise<UserSessionInterface | null> => {
    try {
        const sessionData = await redisClient?.get(`session:${sessionId}`);
        if (!sessionData) {
            throw new NotFoundError('Sesión no encontrada en Redis');
        }
        return JSON.parse(sessionData);
    } catch (error) {
        throw new AppError(`Error en generateRedisSession: ${error}`, 500);
    }
};


// Actualizar la sesión en Redis
export const updateSession = async (
    sessionId: string,
    newData: Partial<UserSessionInterface>
): Promise<UserSessionInterface> => {
    try {
        let session = await getRedisSession(sessionId);

        if (!session) {
            throw new NotFoundError('Sesión no encontrada en Redis');
        }

        session = { ...session, ...newData };

        // Get current TTL
        const ttl = await redisClient.ttl(`session:${sessionId}`); // TTL in seconds

        if (ttl === -2) {
            throw new NotFoundError('Sesión ya expiró');
        }

        if (ttl === -1) {
            throw new AppError('La sesión no tiene TTL y no se puede conservar', 500);
        }


        const result = await redisClient.set(`session:${sessionId}`, JSON.stringify(session), 'EX', ttl);

        if (!result) {
            throw new AppError('Error al actualizar la sesión en Redis', 500);
        }

        return session;
    } catch (error) {
        throw new AppError(`Error en updateSession: ${error}`, 500);
    }
};



// Eliminar la sesión en Redis.
export const handleDeleteRedisSession = async (sessionId: string): Promise<void> => {
    try {
        const response = await redisClient.del(`session:${sessionId}`);

        if (response === 0) {
            throw new NotFoundError('Sesión no encontrada en Redis');
        }
    } catch (error) {
        throw new AppError(`Error en handleDeleteRedisSession: ${error}`, 500);
    }
};


// WEB

// Generar sesión web en Redis
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
        throw new AppError(`Error en generateRedisSessionWeb: ${error}`, 500);
    }
};

// Obtener la sesión desde Redis
export const getRedisWebSession = async (sessionId: string): Promise<UserWebSessionInterface | null> => {
    try {
        const sessionData = await redisClient?.get(`session:${sessionId}`);
        if (!sessionData) {
            throw new NotFoundError('Sesión no encontrada en Redis');
        }
        return JSON.parse(sessionData);
    } catch (error) {
        throw new AppError(`Error en generateRedisSession: ${error}`, 500);
    }
};



// Actualizar la sesión web en Redis
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
        throw new AppError(`Error en updateSession: ${error}`, 500);
    }
};
