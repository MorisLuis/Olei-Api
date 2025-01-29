"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPool = void 0;
const database_1 = require("../database");
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const createPool = async (Serverweb, Baseweb) => {
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError_1.default({ code: 500, message: `Error de conexión con la base de datos.`, logging: true });
    }
    return pool;
};
exports.createPool = createPool;
//# sourceMappingURL=createPool.js.map