import type { NextFunction, Request, Response } from "express";
import { getAbonos } from "../../../src/controllers/abonos/abonos.controller";
import { getAbonosService } from "../../../src/services/abonos/getAbonos.service";

jest.mock("../../../src/services/abonos/getAbonos.service", () => ({ getAbonosService: jest.fn() }));
jest.mock("../../../src/services/abonos/getAbonoById.service", () => ({ getAbonoByIdService: jest.fn() }));
jest.mock("../../../src/services/abonos/getAbonoDetails.service", () => ({ getAbonoDetailsService: jest.fn() }));

describe("getAbonos controller", () => {
    const mockService = getAbonosService as jest.MockedFunction<typeof getAbonosService>;
    const sessionWeb = { ServidorSQL: "SERVER", BaseSQL: "DATABASE" };
    const response = (): Response => ({ json: jest.fn() } as unknown as Response);

    beforeEach(() => jest.clearAllMocks());

    it("preserves query parsing, service arguments and response shape", async () => {
        const req = {
            query: { PageNumber: "2", limit: "10", orderField: "Fecha", orderDirection: "desc", filterField: "Id_Cliente,cliente.Nombre", filterValue: "7,Ana" },
            sessionWeb,
        } as unknown as Request;
        const res = response();
        const next = jest.fn() as NextFunction;
        mockService.mockResolvedValue({ abonos: [], total: 4 });

        await getAbonos(req, res, next);

        expect(mockService).toHaveBeenCalledWith({
            userSession: sessionWeb, orderField: "Fecha", orderDirection: "desc", PageNumber: 2, limit: 10,
            filterField: "Id_Cliente,cliente.Nombre", filterValue: "7,Ana",
            startDate: undefined, endDate: undefined, exactlyDate: undefined,
        });
        expect(res.json).toHaveBeenCalledWith({ abonos: [], total: 4 });
        expect(next).not.toHaveBeenCalled();
    });

    it("forwards validation errors without calling the service", async () => {
        const req = { query: { PageNumber: "1", limit: "10", filterField: "Folio" }, sessionWeb } as unknown as Request;
        const res = response();
        const next = jest.fn() as NextFunction;
        await getAbonos(req, res, next);
        expect(mockService).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
    });
});
