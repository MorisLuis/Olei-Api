import BadRequestError from "../errors/BadRequestError";
import { handleGetWebSession } from "../utils/Redis/getSession";

export const validateSession = async (sessionId: string | undefined) => {
    const { user } = await handleGetWebSession({ sessionId });
    if (!user) {
        throw new BadRequestError({ code: 401, message: "Sesión terminada", logging: true });
    }
    return { user };
};