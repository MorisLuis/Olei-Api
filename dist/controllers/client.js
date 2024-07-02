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
const storageWeb_1 = require("../Storage/storageWeb");
const database_1 = require("../database");
const selectClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const baseweb = req.baseweb;
    const serverweb = req.serverweb;
    const id = req.id;
    const rol = req.rol;
    const { Id_Cliente, Id_Almacen, Id_ListPre } = req.body;
    try {
        const client = {
            Id_Almacen: Id_Almacen,
            Id_Cliente: Id_Cliente,
            Id_ListPre: Id_ListPre,
            IsEmploye: true
        };
        (0, storageWeb_1.setClientData)(`${baseweb}_${Id_Cliente}`, client);
        const token = yield (0, generate_jwt_1.generateWebJWT)({
            id,
            rol,
            serverweb,
            baseweb,
            clientid: Id_Cliente
        });
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