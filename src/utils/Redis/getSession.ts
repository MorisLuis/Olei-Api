import { UnauthorizedError } from "../../errors/CustomError";
import { UserSessionInterface, UserWebSessionInterface } from "../../interface/user";
import { redisClient } from "../../models/server";

interface handleGetSessionInterface {
    sessionId?: string;
}

export const handleGetSession = async ({ sessionId }: handleGetSessionInterface): Promise<{ user: UserSessionInterface | undefined }> => {

    try {
        const sessionData = await redisClient?.get(`sess:${sessionId}`);
        const session = JSON.parse(sessionData as string);
        const user: UserSessionInterface = session.user;
        return { user }
    } catch (error) {
        throw new UnauthorizedError(`Error en handleGetSession: ${error}`);
    }

}
export const handleGetWebSession = async ({ sessionId }: handleGetSessionInterface): Promise<{ user: UserWebSessionInterface | undefined }> => {
    try {
        const sessionData = await redisClient?.get(`sess:${sessionId}`);
        const session = JSON.parse(sessionData as string);
        const user: UserWebSessionInterface = session.userWeb;
        return { user };
    } catch (error) {
        throw new UnauthorizedError(`Error en handleGetWebSession: ${error}`);
    }
};