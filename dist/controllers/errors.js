"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleErrors = void 0;
const database_1 = require("../database");
const mssql_1 = __importDefault(require("mssql"));
const handleErrors = async (req, res) => {
    try {
        const pool = await (0, database_1.dbConnectionMain)();
        const { From, Message, Id_Usuario, Metodo, code } = req.body;
        const transaction = new mssql_1.default.Transaction(pool);
        await transaction.begin();
        const request = new mssql_1.default.Request(transaction);
        let query = database_1.querys.postError;
        const result = await request
            .input('From', mssql_1.default.VarChar, From || '')
            .input('Message', mssql_1.default.VarChar, Message || '')
            .input('Id_Usuario', mssql_1.default.VarChar, Id_Usuario || '')
            .input('Metodo', mssql_1.default.VarChar, Metodo || '')
            .input('code', mssql_1.default.VarChar, code || '')
            .query(query);
        await transaction.commit();
        return res.json({
            ok: true
        });
    }
    catch (error) {
        console.log({ error });
        return res.status(500).send(error.message);
    }
};
exports.handleErrors = handleErrors;
//# sourceMappingURL=errors.js.map