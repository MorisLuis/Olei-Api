"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = void 0;
const database_1 = require("../database");
const getSession_1 = require("../utils/Redis/getSession");
const getUsers = async (req, res) => {
    // Get session from REDIS.
    const sessionId = req.sessionRedis;
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }
    const { Serverweb, Baseweb } = userFR;
    try {
        const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
        const result = await pool?.request().query(database_1.querys.getAllUsers);
        const users = result?.recordset;
        const total = result?.rowsAffected[0];
        res.json({
            total,
            users
        });
    }
    catch (error) {
        console.log({ getUsersError: error });
        res.status(500);
        res.send(error.message);
    }
};
exports.getUsers = getUsers;
//# sourceMappingURL=users.js.map