import sql from "mssql";
import { dbConnection } from "../../../src/database";
import { vendedoresQuery } from "../../../src/database/querys/vendedores";
import { NotFoundError, ValidationError } from "../../../src/errors/CustomError";
import type { UserSessionInterface } from "../../../src/interface/user";
import { getVendedorByIdService } from "../../../src/services/vendedores";

jest.mock("../../../src/database", () => ({
    dbConnection: jest.fn(),
}));

jest.mock("mssql", () => ({
    __esModule: true,
    default: { Int: "Int" },
}));

describe("getVendedorByIdService", () => {
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

    const configurePool = (recordset: unknown[]) => {
        const query = jest.fn().mockResolvedValue({ recordset });
        const input = jest.fn().mockReturnThis();
        const request = jest.fn().mockReturnValue({ input, query });

        mockDbConnection.mockResolvedValue({ request } as never);
        return { request, input, query };
    };

    it("queries and returns the vendedor", async () => {
        const vendedor = { IdOLEI: 1, Id_Vendedor: 10, Nombre: "Ana" };
        const { input, query } = configurePool([vendedor]);

        const result = await getVendedorByIdService({
            userSession,
            Id_Vendedor: 10,
        });

        expect(mockDbConnection).toHaveBeenCalledWith("SERVER", "DATABASE", "USER", "PASSWORD");
        expect(input).toHaveBeenCalledWith("Id_Vendedor", sql.Int, 10);
        expect(query).toHaveBeenCalledWith(vendedoresQuery.getVendedorById);
        expect(result).toEqual({ vendedor });
    });

    it("throws NotFoundError when the vendedor does not exist", async () => {
        configurePool([]);

        await expect(
            getVendedorByIdService({ userSession, Id_Vendedor: 999 }),
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("throws ValidationError when the app tenant connection is unavailable", async () => {
        mockDbConnection.mockResolvedValue(null as never);

        await expect(
            getVendedorByIdService({ userSession, Id_Vendedor: 10 }),
        ).rejects.toBeInstanceOf(ValidationError);
    });

    it("forwards query failures", async () => {
        const error = new Error("query failed");
        const query = jest.fn().mockRejectedValue(error);
        const input = jest.fn().mockReturnThis();
        const request = jest.fn().mockReturnValue({ input, query });

        mockDbConnection.mockResolvedValue({ request } as never);

        await expect(
            getVendedorByIdService({ userSession, Id_Vendedor: 10 }),
        ).rejects.toThrow(error);
    });
});
