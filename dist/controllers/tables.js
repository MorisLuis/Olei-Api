"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTables = void 0;
const database_1 = require("../database");
const getTables = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const userSession = req.sessionWeb;
        const { ServidorSQL, BaseSQL } = userSession;
        const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
        const FamiliasResult = await pool?.request().query(database_1.querys.getFamilias);
        const Familias = FamiliasResult?.recordset.map(familia => familia.Nombre);
        const MarcaResult = await pool?.request().query(database_1.querys.getMarcas);
        const Marca = MarcaResult?.recordset.map(marca => marca.Nombre);
        const FolioResult = await pool?.request().query(database_1.querys.getFolios);
        const Folio = FolioResult?.recordset.map(folio => folio.Codigo);
        return res.json({
            Familias,
            Marca,
            Folio
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getTables = getTables;
//# sourceMappingURL=tables.js.map