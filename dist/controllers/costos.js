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
exports.updateCostos = void 0;
const database_1 = require("../database");
const mssql_1 = __importDefault(require("mssql"));
const costos_1 = require("../database/querys/costos");
const updateCostos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pool = yield (0, database_1.dbConnection)();
        const transaction = new mssql_1.default.Transaction(pool);
        yield transaction.begin();
        if (!pool) {
            return res.status(500).json({ error: 'No se pudo establecer la conexión con la base de datos' });
        }
        try {
            const { codigo: codigoParam, Id_Marca } = req.query;
            const body = req.body;
            if (!codigoParam || !Id_Marca) {
                yield transaction.rollback();
                return res.status(400).json({ error: 'Se requieren los parámetros "codigo" e "Id_Marca" en la consulta.' });
            }
            const request = new mssql_1.default.Request(transaction);
            request.input('codigo', mssql_1.default.NVarChar, codigoParam);
            request.input('Id_Marca', mssql_1.default.Int, Id_Marca);
            const keys = Object.keys(body);
            const query = costos_1.costosQuerys.updateCostos;
            // Make forEach to create de SET of the query.
            keys.forEach((key) => {
                request.input(key, mssql_1.default.NVarChar, body[key]);
            });
            yield request.query(query);
            yield transaction.commit();
            res.json({
                ok: true
            });
        }
        catch (error) {
            console.error({ error: error.stack || error.message });
            yield transaction.rollback();
            res.status(500).json({ error: 'Hubo un error en la actualización de costos.' });
        }
    }
    catch (error) {
        console.error({ error: error.stack || error.message });
        res.status(500).json({ error: 'Hubo un error en la actualización de costos.' });
    }
});
exports.updateCostos = updateCostos;
//# sourceMappingURL=costos.js.map