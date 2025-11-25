import { dbConnectionWeb } from "../../../database";

export async function executeSQLQuery(params: any) {
    const { userSession: { ServidorSQL, BaseSQL }, query } = params
    const connection = await dbConnectionWeb(ServidorSQL, BaseSQL);
    const result = await connection.request().query(query);
    return result.recordset;
}