import { updateWebSession } from "../../../src/helpers/generate-redis";
import type { UserWebSessionInterface } from "../../../src/interface/user";
import { selectClientService } from "../../../src/services/clients/selectClient.service";

jest.mock("../../../src/helpers/generate-redis", () => ({ updateWebSession: jest.fn() }));

describe("selectClientService", () => {
    const mockUpdateWebSession = updateWebSession as jest.MockedFunction<typeof updateWebSession>;

    beforeEach(() => jest.clearAllMocks());

    it("persists the selected client while preserving the existing session", async () => {
        const userSession = { ServidorSQL: "SERVER", BaseSQL: "DATABASE", IsEmploye: false } as UserWebSessionInterface;

        await selectClientService({
            sessionId: "session-id",
            userSession,
            Id_Cliente: 2,
            Id_Almacen: 1,
            Id_ListPre: 3,
        });

        expect(mockUpdateWebSession).toHaveBeenCalledWith("session-id", {
            ...userSession,
            Id_Cliente: 2,
            Id_Almacen: 1,
            Id_ListPre: 3,
            IsEmploye: true,
        });
    });

    it("forwards session persistence failures", async () => {
        const error = new Error("redis unavailable");
        mockUpdateWebSession.mockRejectedValue(error);

        await expect(selectClientService({
            sessionId: "session-id",
            userSession: {} as never,
            Id_Cliente: 2,
            Id_Almacen: 1,
            Id_ListPre: 3,
        })).rejects.toThrow(error);
    });
});
