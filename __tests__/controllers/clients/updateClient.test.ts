import type { NextFunction, Request, Response } from "express";
import { selectClient, updateClient } from "../../../src/controllers/clients/client.controller";
import { selectClientService } from "../../../src/services/clients/selectClient.service";
import { updateClientService } from "../../../src/services/clients/updateClient.service";

jest.mock("../../../src/services/clients/updateClient.service", () => ({ updateClientService: jest.fn() }));
jest.mock("../../../src/services/clients/selectClient.service", () => ({ selectClientService: jest.fn() }));
jest.mock("../../../src/services/clients/getClientById.service", () => ({ getClientIdService: jest.fn() }));
jest.mock("../../../src/services/clients/getClients.service", () => ({ getClientsService: jest.fn() }));
jest.mock("../../../src/services/clients/getTotalClients.service", () => ({ getTotalClientsService: jest.fn() }));
jest.mock("../../../src/services/clients/searchClient.service", () => ({ searchClientService: jest.fn() }));

describe("updateClient controller", () => {
    const mockService = updateClientService as jest.MockedFunction<typeof updateClientService>;
    const mockSelectClientService = selectClientService as jest.MockedFunction<typeof selectClientService>;
    const sessionWeb = { ServidorSQL: "SERVER", BaseSQL: "DATABASE" };
    const response = (): Response => ({ json: jest.fn() } as unknown as Response);

    beforeEach(() => jest.clearAllMocks());

    it("preserves numeric route arguments, body and response shape", async () => {
        const body = { Nombre: "Cliente" };
        const req = { params: { id: "2" }, query: { Id_Almacen: "1" }, body, sessionWeb } as unknown as Request;
        const res = response();
        const next = jest.fn() as NextFunction;
        const client = { Id_Almacen: 1, Id_Cliente: 2, Nombre: "Cliente" };
        mockService.mockResolvedValue({ client });

        await updateClient(req, res, next);

        expect(mockService).toHaveBeenCalledWith({ userSession: sessionWeb, Id_Cliente: 2, Id_Almacen: 1, body });
        expect(res.json).toHaveBeenCalledWith({ client });
        expect(next).not.toHaveBeenCalled();
    });

    it("forwards service failures", async () => {
        const error = new Error("update failed");
        const req = { params: { id: "2" }, query: { Id_Almacen: "1" }, body: {}, sessionWeb } as unknown as Request;
        const res = response();
        const next = jest.fn() as NextFunction;
        mockService.mockRejectedValue(error);
        await updateClient(req, res, next);
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(error);
    });

    it("delegates client selection and preserves the existing response", async () => {
        const req = {
            body: { Id_Cliente: 2, Id_Almacen: 1, Id_ListPre: 3 },
            sessionWeb,
            sessionId: "session-id",
        } as unknown as Request;
        const res = response();
        const next = jest.fn() as NextFunction;

        await selectClient(req, res, next);

        expect(mockSelectClientService).toHaveBeenCalledWith({
            sessionId: "session-id",
            userSession: sessionWeb,
            Id_Cliente: 2,
            Id_Almacen: 1,
            Id_ListPre: 3,
        });
        expect(res.json).toHaveBeenCalledWith({ ok: true });
        expect(next).not.toHaveBeenCalled();
    });
});
