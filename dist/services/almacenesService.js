"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlmacenByIdService = exports.getAlmacenesService = void 0;
const database_1 = require("../database");
const almacen_1 = require("../database/querys/almacen");
const CustomError_1 = require("../errors/CustomError");
const getSession_1 = require("../utils/Redis/getSession");
const getAlmacenesService = async ({ sessionId }) => {
    const { user: userFR } = await (0, getSession_1.handleGetSession)({ sessionId });
    if (!userFR) {
        throw new CustomError_1.UnauthorizedError('Sesion terminada');
    }
    const { ServidorSQL, BaseSQL } = userFR;
    const pool = await (0, database_1.dbConnection)(ServidorSQL, BaseSQL);
    const result = await pool.request().query(almacen_1.AlamacenQuery.getAlmacenes);
    const almacenes = result?.recordset;
    return {
        almacenes
    };
};
exports.getAlmacenesService = getAlmacenesService;
const getAlmacenByIdService = async ({ sessionId, Id_Almacen }) => {
    const { user: userFR } = await (0, getSession_1.handleGetSession)({ sessionId });
    if (!userFR) {
        throw new CustomError_1.UnauthorizedError('Sesion terminada');
    }
    const { ServidorSQL, BaseSQL } = userFR;
    const pool = await (0, database_1.dbConnection)(ServidorSQL, BaseSQL);
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