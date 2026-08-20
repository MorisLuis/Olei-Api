import sql from "mssql";
import { dbConnectionWeb } from "../../../src/database";
import { abonosQuery } from "../../../src/database/querys/abonos";
import { getAbonoByIdService } from "../../../src/services/abonos/getAbonoById.service";
import { getAbonosService } from "../../../src/services/abonos/getAbonos.service";

jest.mock("../../../src/database", () => ({ dbConnectionWeb: jest.fn() }));
jest.mock("mssql", () => ({
    __esModule: true,
    default: { Int: "Int", DateTime: "DateTime", VarChar: "VarChar", NVarChar: jest.fn((size: number) => `NVarChar(${size})`) },
}));

describe("abonos MSSQL services", () => {
    const mockConnection = dbConnectionWeb as jest.MockedFunction<typeof dbConnectionWeb>;
    const userSession = { ServidorSQL: "SERVER", BaseSQL: "DATABASE" } as never;

    beforeEach(() => {
        jest.clearAllMocks();
        (sql.NVarChar as unknown as jest.Mock).mockImplementation((size: number) => `NVarChar(${size})`);
    });

    it("binds filters, date range and pagination and maps relation objects", async () => {
        const row = { Folio: 1, Id_Almacen: 2, Id_Cliente: 3, Id_FormaPago: 4, Importe: 50, Fecha: new Date(), ClienteNombre: "Ana", FormaPagoNombre: "Efectivo" };
        const dataInput = jest.fn().mockReturnThis();
        const countInput = jest.fn().mockReturnThis();
        const dataQuery = jest.fn().mockResolvedValue({ recordset: [row] });
        const countQuery = jest.fn().mockResolvedValue({ recordset: [{ Total: 1 }] });
        const request = jest.fn()
            .mockReturnValueOnce({ input: dataInput, query: dataQuery })
            .mockReturnValueOnce({ input: countInput, query: countQuery });
        mockConnection.mockResolvedValue({ request } as never);

        const result = await getAbonosService({
            userSession, orderField: "cliente.Nombre", orderDirection: "desc", PageNumber: 3, limit: 5,
            filterField: "Id_Cliente,cliente.Nombre", filterValue: "3,Ana",
            exactlyDate: "2026-08-20",
        });

        expect(mockConnection).toHaveBeenCalledWith("SERVER", "DATABASE");
        expect(dataInput).toHaveBeenCalledWith("FilterIdCliente", sql.Int, 3);
        expect(dataInput).toHaveBeenCalledWith("ClienteNombre", "NVarChar(100)", "Ana");
        expect(dataInput).toHaveBeenCalledWith("StartDate", sql.DateTime, expect.any(Date));
        expect(dataInput).toHaveBeenCalledWith("EndDate", sql.DateTime, expect.any(Date));
        expect(dataInput).toHaveBeenCalledWith("OrderField", sql.VarChar, "cliente.Nombre");
        expect(dataInput).toHaveBeenCalledWith("OrderDirection", sql.VarChar, "desc");
        expect(dataInput).toHaveBeenCalledWith("Skip", sql.Int, 10);
        expect(dataInput).toHaveBeenCalledWith("Limit", sql.Int, 5);
        expect(dataQuery).toHaveBeenCalledWith(abonosQuery.getAbonos);
        expect(countQuery).toHaveBeenCalledWith(abonosQuery.getAbonosCount);
        expect(result).toEqual({
            abonos: [{ Folio: 1, Id_Almacen: 2, Id_Cliente: 3, Id_FormaPago: 4, Importe: 50, Fecha: row.Fecha, cliente: { Nombre: "Ana" }, forma_de_pago: { Nombre: "Efectivo" } }],
            total: 1,
        });
    });

    it("returns null when the requested abono does not exist", async () => {
        const input = jest.fn().mockReturnThis();
        const query = jest.fn().mockResolvedValue({ recordset: [] });
        mockConnection.mockResolvedValue({ request: jest.fn().mockReturnValue({ input, query }) } as never);

        await expect(getAbonoByIdService({ userSession, Id_Almacen: 2, Folio: 9 })).resolves.toEqual({ abono: null });
        expect(input).toHaveBeenCalledWith("Id_Almacen", sql.Int, 2);
        expect(input).toHaveBeenCalledWith("Folio", sql.Int, 9);
    });

    it("forwards database query failures", async () => {
        const input = jest.fn().mockReturnThis();
        const error = new Error("query failed");
        mockConnection.mockResolvedValue({ request: jest.fn().mockReturnValue({ input, query: jest.fn().mockRejectedValue(error) }) } as never);
        await expect(getAbonoByIdService({ userSession, Id_Almacen: 2, Folio: 9 })).rejects.toThrow(error);
    });
});
