import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { getVendedorById } from "../../../src/controllers/vendedores";
import { getVendedorByIdService } from "../../../src/services/vendedores";

jest.mock("../../../src/services/vendedores", () => ({
    getVendedorByIdService: jest.fn(),
}));

describe("getVendedorById controller", () => {
    const mockGetVendedorByIdService = getVendedorByIdService as jest.MockedFunction<typeof getVendedorByIdService>;
    const userSession = { ServidorSQL: "SERVER", BaseSQL: "DATABASE" };

    const createResponse = (): Response => {
        const res = {
            status: jest.fn(),
            json: jest.fn(),
        } as unknown as Response;

        (res.status as unknown as jest.Mock).mockReturnValue(res);
        return res;
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns the vendedor in the standard response", async () => {
        const req = {
            params: { id: "10" },
            session: userSession,
        } as unknown as Request;
        const res = createResponse();
        const next = jest.fn() as NextFunction;
        const vendedor = { IdOLEI: 1, Id_Vendedor: 10, Nombre: "Ana" };

        mockGetVendedorByIdService.mockResolvedValue({ vendedor });

        await getVendedorById(req, res, next);

        expect(mockGetVendedorByIdService).toHaveBeenCalledWith({
            userSession,
            Id_Vendedor: 10,
        });
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Operation successful",
            data: vendedor,
            info: undefined,
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("forwards invalid ids without calling the service", async () => {
        const req = {
            params: { id: "0" },
            session: userSession,
        } as unknown as Request;
        const res = createResponse();
        const next = jest.fn() as NextFunction;

        await getVendedorById(req, res, next);

        expect(mockGetVendedorByIdService).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
        expect((next as jest.Mock).mock.calls[0][0]).toBeInstanceOf(ZodError);
    });

    it("forwards service errors", async () => {
        const req = {
            params: { id: "10" },
            session: userSession,
        } as unknown as Request;
        const res = createResponse();
        const next = jest.fn() as NextFunction;
        const error = new Error("database unavailable");

        mockGetVendedorByIdService.mockRejectedValue(error);

        await getVendedorById(req, res, next);

        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(error);
    });
});
