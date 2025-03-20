import { UnauthorizedError } from "../../errors/CustomError";
import { UserSessionInterface, UserWebSessionInterface } from "../../interface/user";
import { redisClient } from "../../models/server";

interface handleGetSessionInterface {
    sessionId?: string;
}

export const handleGetSession = async ({ sessionId }: handleGetSessionInterface): Promise<{ user: UserSessionInterface | undefined }> => {
    try {
        if (!sessionId) throw new UnauthorizedError(`SessionId vacío`);

        const sessionData = await redisClient?.get(`sess:${sessionId}`);
        if (!sessionData) throw new UnauthorizedError('Sesión terminada');

        const session = JSON.parse(sessionData as string);
        return { user: session.user };
    } catch (error) {
        throw new UnauthorizedError(`Error obteniendo sesión: ${(error as Error).message}`);
    }
}


export const handleGetWebSession = async ({ sessionId }: handleGetSessionInterface): Promise<{ user: UserWebSessionInterface | undefined }> => {
    try {
        if(!sessionId) throw new UnauthorizedError(`SessionId empty`);
        const sessionData = await redisClient?.get(`sess:${sessionId}`);
        const session = JSON.parse(sessionData as string);
        const user: UserWebSessionInterface = session.userWeb;
        return { user };
    } catch (error) {
        throw new UnauthorizedError(`Error en handleGetWebSession: ${error}`);
    }
};