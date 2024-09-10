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
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectClient = void 0;
const generate_jwt_1 = require("../helpers/generate-jwt");
const database_1 = require("../database");
const getSession_1 = require("../utils/Redis/getSession");
const selectClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get session from REDIS.
    const sessionId = req.sessionID;
    const { user: userFR } = yield (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }
    const { Id } = userFR;
    try {
        const { Id_Cliente, Id_Almacen, Id_ListPre } = req.body;
        const client = {
            Id_Almacen: Id_Almacen,
            Id_Cliente: Id_Cliente,
            Id_ListPre: Id_ListPre,
            IsEmploye: true
        };
        const token = yield (0, generate_jwt_1.generateWebJWT)({ Id: Id });
        return res.json({
            client,
            token
        });
    }
    catch (error) {
        console.log({ error });
        return res.status(500).send(error.message);
    }
    finally {
        yield (0, database_1.closeDbConnection)();
    }
});
exports.selectClient = selectClient;
//# sourceMappingURL=client.js.map