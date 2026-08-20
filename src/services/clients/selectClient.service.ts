import { updateWebSession } from "../../helpers/generate-redis";
import type { UserWebSessionInterface } from "../../interface/user";

interface SelectClientParams {
    sessionId: string;
    userSession: UserWebSessionInterface;
    Id_Cliente: number;
    Id_Almacen: number;
    Id_ListPre: number;
}

/**
 * Selects the active client for a web session and persists the updated session in Redis.
 *
 * @param params - Session identifier, existing web session, and validated client selection.
 * @returns A promise that resolves after the session has been updated.
 * @throws Propagates session persistence failures from Redis.
 */
export const selectClientService = async ({ sessionId, userSession, Id_Cliente, Id_Almacen, Id_ListPre }: SelectClientParams): Promise<void> => {
    await updateWebSession(sessionId, {
        ...userSession,
        Id_Almacen,
        Id_Cliente,
        Id_ListPre,
        IsEmploye: true,
    });
};
