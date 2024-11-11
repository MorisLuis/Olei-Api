"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = void 0;
const database_1 = require("../database");
const getSession_1 = require("../utils/Redis/getSession");
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const getUsers = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis;
        const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
        if (!userFR) {
            throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
        }
        const { Serverweb, Baseweb } = userFR;
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
        next(error);
    }
};
exports.getUsers = getUsers;
//# sourceMappingURL=users.js.map