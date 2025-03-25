"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlmacenByIdService = exports.getAlmacenesService = void 0;
const database_1 = require("../database");
const almacen_1 = require("../database/querys/almacen");
const getAlmacenesService = async (userSession) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    const result = await pool.request().query(almacen_1.AlamacenQuery.getAlmacenes);
    const almacenes = result?.recordset;
    return {
        almacenes
    };
};
exports.getAlmacenesService = getAlmacenesService;
const getAlmacenByIdService = async ({ userSession, Id_Almacen }) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    const result = await pool.request()
        .input('Id_Almacen', Id_Almacen)
        .query(almacen_1.AlamacenQuery.getAlmacenById);
    const almacen = result?.recordset[0];
    return {
        almacen
    };
};
exports.getAlmacenByIdService = getAlmacenByIdService;
//# sourceMappingURL=almacenesService.js.map