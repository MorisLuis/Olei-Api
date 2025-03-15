import { UnauthorizedError } from "../errors/CustomError";
import { UserWebSessionInterface } from "../interface/user";
import { handleGetWebSession } from "../utils/Redis/getSession";

export const validateSession = async (sessionId: string | undefined) : Promise<{user: UserWebSessionInterface }>=> {
    const { user } = await handleGetWebSession({ sessionId });
    if (!user) {
        throw new UnauthorizedError('Sesion terminada')
    }
    return { user };
};