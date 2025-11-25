"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeSQLQuery = void 0;
const database_1 = require("../../../database");
async function executeSQLQuery(params) {
    const { userSession: { ServidorSQL, BaseSQL }, query } = params;
    const connection = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    const result = await connection.request().query(query);
    return result.recordset;
}
exports.executeSQLQuery = executeSQLQuery;
//# sourceMappingURL=executeSQLQuery.js.map