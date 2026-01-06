import { dbConnectionWeb } from "../../../database";

interface ExecuteSQLQueryParams {
    userSession: {
        ServidorSQL: string;
        BaseSQL: string;
    };
    query: string;
}

export async function executeSQLQuery(params: ExecuteSQLQueryParams): Promise<Record<string, unknown>[]> {
    const { userSession: { ServidorSQL, BaseSQL }, query } = params
    const connection = await dbConnectionWeb(ServidorSQL, BaseSQL);
    const result = await connection.request().query(query);
    return result.recordset;
}