import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { getVendedores } from "../../../src/controllers/vendedores";
import { getVendedoresService } from "../../../src/services/vendedores";

jest.mock("../../../src/services/vendedores", () => ({
    getVendedoresService: jest.fn(),
}));

describe("getVendedores controller", () => {
    const mockGetVendedoresService = getVendedoresService as jest.MockedFunction<typeof getVendedoresService>;
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

    it("uses pagination defaults and returns the standard response", async () => {
        const req = { query: {}, session: userSession } as unknown as Request;
        const res = createResponse();
        const next = jest.fn() as NextFunction;
        const vendedores = [{ IdOLEI: 1, Id_Vendedor: 10, Nombre: "Ana" }];

        mockGetVendedoresService.mockResolvedValue({ vendedores, total: 21 });

        await getVendedores(req, res, next);

        expect(mockGetVendedoresService).toHaveBeenCalledWith({
            userSession,
            PageNumber: 1,
            PageSize: 20,
        });
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Operation successful",
            data: vendedores,
            info: {
                totals: { show: 1, total: 21 },
                pages: { current: 1, totalPages: 2, next: 2, previous: 1 },
            },
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("parses custom pagination values", async () => {
        const req = {
            query: { PageNumber: "2", PageSize: "10" },
            session: userSession,
        } as unknown as Request;
        const res = createResponse();
        const next = jest.fn() as NextFunction;

        mockGetVendedoresService.mockResolvedValue({ vendedores: [], total: 15 });

        await getVendedores(req, res, next);

        expect(mockGetVendedoresService).toHaveBeenCalledWith({
            userSession,
            PageNumber: 2,
            PageSize: 10,
        });
    });

    it("forwards invalid pagination without calling the service", async () => {
        const req = {
            query: { PageNumber: "0", PageSize: "101" },
            session: userSession,
        } as unknown as Request;
        const res = createResponse();
        const next = jest.fn() as NextFunction;

        await getVendedores(req, res, next);

        expect(mockGetVendedoresService).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
        expect((next as jest.Mock).mock.calls[0][0]).toBeInstanceOf(ZodError);
    });

    it("forwards service errors", async () => {
        const req = { query: {}, session: userSession } as unknown as Request;
        const res = createResponse();
        const next = jest.fn() as NextFunction;
        const error = new Error("database unavailable");

        mockGetVendedoresService.mockRejectedValue(error);

        await getVendedores(req, res, next);

        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(error);
    });
});
