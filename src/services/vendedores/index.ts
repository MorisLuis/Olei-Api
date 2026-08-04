import sql from "mssql";
import { dbConnection } from "../../database";
import { vendedoresQuery } from "../../database/querys/vendedores";
import { NotFoundError, ValidationError } from "../../errors/CustomError";
import type {
    GetVendedorByIdParams,
    GetVendedorByIdResponse,
    GetVendedoresParams,
    GetVendedoresResponse,
} from "./types";

export const getVendedoresService = async ({
    userSession,
    PageNumber,
    PageSize,
}: GetVendedoresParams): Promise<GetVendedoresResponse> => {
    const { ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL } = userSession;
    const pool = await dbConnection(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);

    if (!pool) {
        throw new ValidationError("Error al conectarse a base de datos principal");
    }

    const vendedoresRequest = pool.request()
        .input("PageNumber", sql.Int, PageNumber)
        .input("PageSize", sql.Int, PageSize)
        .query(vendedoresQuery.getVendedores);
    const countRequest = pool.request().query(vendedoresQuery.getVendedoresCount);

    const [vendedoresResult, countResult] = await Promise.all([
        vendedoresRequest,
        countRequest,
    ]);

    return {
        vendedores: vendedoresResult.recordset,
        total: Number(countResult.recordset[0]?.Total ?? 0),
    };
};

export const getVendedorByIdService = async ({
    userSession,
    Id_Vendedor,
}: GetVendedorByIdParams): Promise<GetVendedorByIdResponse> => {
    const { ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL } = userSession;
    const pool = await dbConnection(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);

    if (!pool) {
        throw new ValidationError("Error al conectarse a base de datos principal");
    }

    const result = await pool.request()
        .input("Id_Vendedor", sql.Int, Id_Vendedor)
        .query(vendedoresQuery.getVendedorById);
    const vendedor = result.recordset[0];

    if (!vendedor) {
        throw new NotFoundError("Vendedor no encontrado");
    }

    return { vendedor };
};
