import { UserSessionInterface } from "../../interface/user";
import { redisClient } from "../../models/server";

interface handleGetSessionInterface {
    sessionId?: string;
}

export const handleGetSession = async ({ sessionId }: handleGetSessionInterface) => {

    const sessionData = await redisClient?.get(`sess:${sessionId}`);
    const session = JSON.parse(sessionData as string);

    return {
        user: session.user as UserSessionInterface
    }
}