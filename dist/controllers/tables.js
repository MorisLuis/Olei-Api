"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTables = void 0;
const database_1 = require("../database");
const getSession_1 = require("../utils/Redis/getSession");
const CustomError_1 = require("../errors/CustomError");
const getTables = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis;
        const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
        if (!userFR) {
            throw new CustomError_1.UnauthorizedError('Sesion terminada');
        }
        const { Serverweb, Baseweb } = userFR;
        const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
        const FamiliasResult = await pool?.request().query(database_1.querys.getFamilias);
        const Familias = FamiliasResult?.recordset.map(familia => familia.Nombre);
        const MarcaResult = await pool?.request().query(database_1.querys.getMarcas);
        const Marca = MarcaResult?.recordset.map(marca => marca.Nombre);
        const FolioResult = await pool?.request().query(database_1.querys.getFolios);
        const Folio = FolioResult?.recordset.map(folio => folio.Codigo);
        res.json({
            Familias,
            Marca,
            Folio
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTables = getTables;
//# sourceMappingURL=tables.js.map