import { UnauthorizedError } from "../errors/CustomError";
import { handleGetWebSession } from "../utils/Redis/getSession";

export const validateSession = async (sessionId: string | undefined) => {
    const { user } = await handleGetWebSession({ sessionId });
    if (!user) {
        throw new UnauthorizedError('Sesion terminada')
    }
    return { user };
};