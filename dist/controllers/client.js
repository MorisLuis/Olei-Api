"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectClient = void 0;
const generate_jwt_1 = require("../helpers/generate-jwt");
const database_1 = require("../database");
const getSession_1 = require("../utils/Redis/getSession");
const selectClient = async (req, res) => {
    // Get session from REDIS.
    const sessionId = req.sessionID;
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
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
        const datosDelUsuario = {
            ...userFR,
            ...client
        };
        req.session.userWeb = datosDelUsuario;
        const token = await (0, generate_jwt_1.generateWebJWT)({ Id: Id });
        return res.json({
            token
        });
    }
    catch (error) {
        console.log({ error });
        return res.status(500).send(error.message);
    }
    finally {
        await (0, database_1.closeDbConnection)();
    }
};
exports.selectClient = selectClient;
//# sourceMappingURL=client.js.map