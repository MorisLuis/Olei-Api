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
exports.changeTypeofmovements = exports.getTypeofmovements = void 0;
const database_1 = require("../database");
const storageWeb_1 = require("../Storage/storageWeb");
const getTypeofmovements = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const serverclientes = req.server;
    const baseclientes = req.base;
    try {
        const pool = yield (0, database_1.dbConnection)(serverclientes, baseclientes);
        const TiposMovimientoResult = yield (pool === null || pool === void 0 ? void 0 : pool.request().query(database_1.querys.getTiposMovimiento));
        const TiposMovimiento = TiposMovimientoResult === null || TiposMovimientoResult === void 0 ? void 0 : TiposMovimientoResult.recordset;
        res.json(TiposMovimiento);
    }
    catch (error) {
        res.status(500);
        res.send(error.message);
    }
});
exports.getTypeofmovements = getTypeofmovements;
// Temporal (!)
const changeTypeofmovements = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const serverclientes = req.server;
    const baseclientes = req.base;
    const currentUser = (0, storageWeb_1.getUserDataWeb)(baseclientes.trim());
    try {
        const pool = yield (0, database_1.dbConnection)(serverclientes, baseclientes);
        const { Id_TipoMovInv } = req.body;
        const user = currentUser;
        const TipoMovimiento = yield pool.request()
            .input('Id_TipoMovInv', JSON.parse(Id_TipoMovInv))
            .query(database_1.querys.getTipoDeMovimiento);
        const result = TipoMovimiento.recordset[0];
        const userData = Object.assign(Object.assign({}, user), { Id_TipoMovInv: {
                Id_TipoMovInv: result.Id_TipoMovInv,
                Accion: result.Accion,
                Descripcion: result.Descripcion,
                Id_AlmDest: result.Id_AlmDest
            } });
        res.json({
            user: userData
        });
    }
    catch (error) {
        res.status(500);
        res.send(error.message);
    }
});
exports.changeTypeofmovements = changeTypeofmovements;
//# sourceMappingURL=typeofmovements.js.map