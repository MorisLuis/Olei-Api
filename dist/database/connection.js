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
exports.closeDbConnection = exports.dbConnection = void 0;
const mssql_1 = __importDefault(require("mssql"));
const __1 = require("..");
const config_1 = __importDefault(require("../config"));
let pool = null;
const dbConnection = (server, database) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const currenUserConnection = (_a = __1.sharedData === null || __1.sharedData === void 0 ? void 0 : __1.sharedData.userConnection) === null || _a === void 0 ? void 0 : _a.connection;
    const dbConfig = {
        user: config_1.default.dbUser,
        password: config_1.default.dbPassword,
        server: server || (currenUserConnection === null || currenUserConnection === void 0 ? void 0 : currenUserConnection.server) || config_1.default.dbServer,
        database: database || (currenUserConnection === null || currenUserConnection === void 0 ? void 0 : currenUserConnection.database) || config_1.default.dbDatabase,
        options: {
            encrypt: true,
            trustServerCertificate: true,
        },
    };
    try {
        const pool = new mssql_1.default.ConnectionPool(dbConfig);
        console.log('db online');
        yield pool.connect();
        return pool;
    }
    catch (error) {
        console.error('Error al conectar a la base de datos:', error.message);
        throw error;
    }
});
exports.dbConnection = dbConnection;
const closeDbConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    if (pool) {
        __1.sharedData.userConnection = {
            connection: {
                user: config_1.default.dbUser,
                password: config_1.default.dbPassword,
                server: config_1.default.dbServer,
                database: config_1.default.dbDatabase
            }
        };
        yield pool.close();
        pool = null;
    }
});
exports.closeDbConnection = closeDbConnection;
//# sourceMappingURL=connection.js.map