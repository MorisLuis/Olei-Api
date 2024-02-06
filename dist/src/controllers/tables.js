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
exports.getTables = void 0;
const database_1 = require("../database");
const getTables = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pool = yield (0, database_1.dbConnection)();
        const FamiliasResult = yield (pool === null || pool === void 0 ? void 0 : pool.request().query(database_1.querys.getFamilias));
        const Familias = FamiliasResult === null || FamiliasResult === void 0 ? void 0 : FamiliasResult.recordset.map(familia => familia.Nombre);
        const MarcaResult = yield (pool === null || pool === void 0 ? void 0 : pool.request().query(database_1.querys.getMarcas));
        const Marca = MarcaResult === null || MarcaResult === void 0 ? void 0 : MarcaResult.recordset.map(marca => marca.Nombre);
        const FolioResult = yield (pool === null || pool === void 0 ? void 0 : pool.request().query(database_1.querys.getFolios));
        const Folio = FolioResult === null || FolioResult === void 0 ? void 0 : FolioResult.recordset.map(folio => folio.Codigo);
        res.json({
            Familias,
            Marca,
            Folio
        });
    }
    catch (error) {
        res.status(500);
        res.send(error.message);
    }
});
exports.getTables = getTables;
//# sourceMappingURL=tables.js.map