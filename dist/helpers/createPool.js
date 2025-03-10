"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPool = void 0;
const database_1 = require("../database");
const CustomError_1 = require("../errors/CustomError");
const createPool = async (Serverweb, Baseweb) => {
    const pool = await (0, database_1.dbConnectionWeb)(Serverweb, Baseweb);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos.');
    }
    return pool;
};
exports.createPool = createPool;
//# sourceMappingURL=createPool.js.map