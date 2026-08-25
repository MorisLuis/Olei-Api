import sql from "mssql";
import { dbConnectionWeb } from "../../../src/database";
import { updateClientService } from "../../../src/services/clients/updateClient.service";

jest.mock("../../../src/database", () => ({ dbConnectionWeb: jest.fn() }));
jest.mock("mssql", () => ({
    __esModule: true,
    default: {
        Int: "Int", Bit: "Bit", DateTime: "DateTime", SmallInt: "SmallInt", MAX: "MAX",
        Decimal: jest.fn((precision: number, scale: number) => `Decimal(${precision},${scale})`),
        VarChar: jest.fn((size: number) => `VarChar(${size})`),
        NVarChar: jest.fn((size: number | string) => `NVarChar(${size})`),
    },
}));

describe("updateClientService with MSSQL", () => {
    const mockConnection = dbConnectionWeb as jest.MockedFunction<typeof dbConnectionWeb>;
    const userSession = { ServidorSQL: "SERVER", BaseSQL: "DATABASE" } as never;

    beforeEach(() => {
        jest.clearAllMocks();
        (sql.NVarChar as unknown as jest.Mock).mockImplementation((size: number | string) => `NVarChar(${size})`);
    });

    it("updates allowed fields with explicit types and returns the updated row", async () => {
        const client = { Id_Almacen: 1, Id_Cliente: 2, Nombre: "Cliente", Status: true };
        const input = jest.fn().mockReturnThis();
        const query = jest.fn().mockResolvedValue({ recordset: [client] });
        mockConnection.mockResolvedValue({ request: jest.fn().mockReturnValue({ input, query }) } as never);

        await expect(updateClientService({ userSession, Id_Almacen: 1, Id_Cliente: 2, body: { Nombre: "Cliente", Status: true } })).resolves.toEqual({ client });
        expect(input).toHaveBeenCalledWith("TargetId_Almacen", sql.Int, 1);
        expect(input).toHaveBeenCalledWith("TargetId_Cliente", sql.Int, 2);
        expect(input).toHaveBeenCalledWith("Nombre", "NVarChar(200)", "Cliente");
        expect(input).toHaveBeenCalledWith("Status", sql.Bit, true);
        expect(query.mock.calls[0][0]).toContain("[Nombre] = @Nombre, [Status] = @Status");
        expect(query.mock.calls[0][0]).toContain("OUTPUT INSERTED.*");
    });

    it("rejects unknown fields before executing a query", async () => {
        const input = jest.fn().mockReturnThis();
        const query = jest.fn();
        mockConnection.mockResolvedValue({ request: jest.fn().mockReturnValue({ input, query }) } as never);
        await expect(updateClientService({ userSession, Id_Almacen: 1, Id_Cliente: 2, body: { unknown: true } })).rejects.toThrow("Unknown argument `unknown`");
        expect(query).not.toHaveBeenCalled();
    });

    it("matches the previous not-found failure behavior", async () => {
        const input = jest.fn().mockReturnThis();
        mockConnection.mockResolvedValue({ request: jest.fn().mockReturnValue({ input, query: jest.fn().mockResolvedValue({ recordset: [] }) }) } as never);
        await expect(updateClientService({ userSession, Id_Almacen: 1, Id_Cliente: 404, body: {} })).rejects.toThrow("No record was found for an update");
    });
});
