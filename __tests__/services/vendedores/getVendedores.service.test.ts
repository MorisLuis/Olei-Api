import sql from "mssql";
import { dbConnection } from "../../../src/database";
import { vendedoresQuery } from "../../../src/database/querys/vendedores";
import { ValidationError } from "../../../src/errors/CustomError";
import type { UserSessionInterface } from "../../../src/interface/user";
import { getVendedoresService } from "../../../src/services/vendedores";

jest.mock("../../../src/database", () => ({
    dbConnection: jest.fn(),
}));

jest.mock("mssql", () => ({
    __esModule: true,
    default: { Int: "Int" },
}));

describe("getVendedoresService", () => {
    const mockDbConnection = dbConnection as jest.MockedFunction<typeof dbConnection>;
    const userSession: UserSessionInterface = {
        ServidorSQL: "SERVER",
        BaseSQL: "DATABASE",
        UsuarioSQL: "USER",
        PasswordSQL: "PASSWORD",
        IdUsuarioOLEI: "OLEI-USER",
        RazonSocial: "OLEI",
        SwImagenes: true,
        Vigencia: new Date("2027-01-01"),
        from: "mobil",
        serverConected: true,
        userConected: true,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("queries the requested page and matching total", async () => {
        const vendedores = [{ IdOLEI: 1, Id_Vendedor: 10, Nombre: "Ana" }];
        const dataQuery = jest.fn().mockResolvedValue({ recordset: vendedores });
        const dataInput = jest.fn().mockReturnThis();
        const countQuery = jest.fn().mockResolvedValue({ recordset: [{ Total: 21 }] });
        const request = jest.fn()
            .mockReturnValueOnce({ input: dataInput, query: dataQuery })
            .mockReturnValueOnce({ query: countQuery });

        mockDbConnection.mockResolvedValue({ request } as never);

        const result = await getVendedoresService({
            userSession,
            PageNumber: 2,
            PageSize: 20,
        });

        expect(mockDbConnection).toHaveBeenCalledWith("SERVER", "DATABASE", "USER", "PASSWORD");
        expect(dataInput).toHaveBeenCalledWith("PageNumber", sql.Int, 2);
        expect(dataInput).toHaveBeenCalledWith("PageSize", sql.Int, 20);
        expect(dataQuery).toHaveBeenCalledWith(vendedoresQuery.getVendedores);
        expect(countQuery).toHaveBeenCalledWith(vendedoresQuery.getVendedoresCount);
        expect(result).toEqual({ vendedores, total: 21 });
    });

    it("throws ValidationError when the app tenant connection is unavailable", async () => {
        mockDbConnection.mockResolvedValue(null as never);

        await expect(
            getVendedoresService({ userSession, PageNumber: 1, PageSize: 20 }),
        ).rejects.toBeInstanceOf(ValidationError);
    });

    it("forwards data query failures", async () => {
        const error = new Error("query failed");
        const dataQuery = jest.fn().mockRejectedValue(error);
        const dataInput = jest.fn().mockReturnThis();
        const countQuery = jest.fn().mockResolvedValue({ recordset: [{ Total: 0 }] });
        const request = jest.fn()
            .mockReturnValueOnce({ input: dataInput, query: dataQuery })
            .mockReturnValueOnce({ query: countQuery });

        mockDbConnection.mockResolvedValue({ request } as never);

        await expect(
            getVendedoresService({ userSession, PageNumber: 1, PageSize: 20 }),
        ).rejects.toThrow(error);
    });
});
