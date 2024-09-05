"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTypeofmovements = void 0;
const database_1 = require("../database");
const mssql_1 = __importDefault(require("mssql"));
const getSession_1 = require("../utils/Redis/getSession");
const getTypeofmovements = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sessionId = req.sessionID;
    const { user: userFR } = yield (0, getSession_1.handleGetSession)({ sessionId });
    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }
    const { serverclientes, baseclientes, PasswordSQL, UsuarioSQL, userId } = userFR;
    try {
        const pool = yield (0, database_1.dbConnection)(serverclientes, baseclientes, PasswordSQL, UsuarioSQL);
        const request = pool.request();
        request.input('Id_Usuario', mssql_1.default.VarChar(50), userId);
        const resultData = yield request.execute('fn_GetTypeOfMovement');
        const TiposMovimiento = resultData === null || resultData === void 0 ? void 0 : resultData.recordset;
        res.json(TiposMovimiento);
    }
    catch (error) {
        res.status(500);
        res.send(error.message);
    }
});
exports.getTypeofmovements = getTypeofmovements;
//# sourceMappingURL=typeofmovements.js.map