"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTypeofmovements = void 0;
const database_1 = require("../database");
const mssql_1 = __importDefault(require("mssql"));
const getTypeofmovements = async (req, res, next) => {
    try {
        const session = req.session;
        const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL, Id_UsuarioOLEI } = session;
        const pool = await (0, database_1.dbConnection)(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);
        const request = pool.request();
        request.input('Id_Usuario', mssql_1.default.VarChar(50), Id_UsuarioOLEI);
        const resultData = await request.execute('fn_GetTypeOfMovement');
        const TiposMovimiento = resultData?.recordset;
        return res.json({
            TiposMovimiento
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getTypeofmovements = getTypeofmovements;
//# sourceMappingURL=typeofmovements.js.map