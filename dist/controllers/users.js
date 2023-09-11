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
exports.getUsers = void 0;
const database_1 = require("../database");
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pool = yield (0, database_1.dbConnection)();
    try {
        const result = yield (pool === null || pool === void 0 ? void 0 : pool.request().query(database_1.querys.getAllUsers));
        const users = result === null || result === void 0 ? void 0 : result.recordset;
        const total = result === null || result === void 0 ? void 0 : result.rowsAffected[0];
        res.json({
            total,
            users
        });
        //await pool?.close();
    }
    catch (error) {
        res.status(500);
        res.send(error.message);
    }
});
exports.getUsers = getUsers;
//# sourceMappingURL=users.js.map