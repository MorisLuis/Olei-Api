"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTypeofmovements = void 0;
const database_1 = require("../database");
const mssql_1 = __importDefault(require("mssql"));
const getSession_1 = require("../utils/Redis/getSession");
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const getTypeofmovements = async (req, res, next) => {
    try {
        const sessionId = req.sessionID;
        const { user: userFR } = await (0, getSession_1.handleGetSession)({ sessionId });
        if (!userFR) {
            throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
        }
        const { serverclientes, baseclientes, PasswordSQL, UsuarioSQL, userId } = userFR;
        const pool = await (0, database_1.dbConnection)(serverclientes, baseclientes, UsuarioSQL, PasswordSQL);
        const request = pool.request();
        request.input('Id_Usuario', mssql_1.default.VarChar(50), userId);
        const resultData = await request.execute('fn_GetTypeOfMovement');
        const TiposMovimiento = resultData?.recordset;
        res.json(TiposMovimiento);
    }
    catch (error) {
        next(error);
    }
};
exports.getTypeofmovements = getTypeofmovements;
//# sourceMappingURL=typeofmovements.js.map