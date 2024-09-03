import { UserSessionInterface } from "../../interface/user";
import { redisClient } from "../../models/server";

interface handleGetSessionInterface {
    sessionId?: string;
}

export const handleGetSession = async ({ sessionId }: handleGetSessionInterface) => {

    try {
        const sessionData = await redisClient?.get(`sess:${sessionId}`);
        const session = JSON.parse(sessionData as string);
        const user : UserSessionInterface = session.user;    
        return { user }
    } catch (error) {
        console.log({error})
        return { user : undefined }
    }

}