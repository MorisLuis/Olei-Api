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
const config_1 = __importDefault(require("../config"));
let pool = null;
const dbConnection = (server, database, password, user) => __awaiter(void 0, void 0, void 0, function* () {
    if (!pool) {
        const dbConfig = {
            user: user || config_1.default.dbUser,
            password: password || config_1.default.dbPassword,
            server: server || config_1.default.dbServer,
            database: database || config_1.default.dbDatabase,
            options: {
                encrypt: true,
                trustServerCertificate: true,
            },
        };
        try {
            pool = yield mssql_1.default.connect(dbConfig);
        }
        catch (error) {
            console.error('Error al conectar a la base de datos:', error.message);
            throw error;
        }
    }
    return pool;
});
exports.dbConnection = dbConnection;
const closeDbConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    if (pool) {
        yield pool.close();
        pool = null;
    }
});
exports.closeDbConnection = closeDbConnection;
//# sourceMappingURL=connection.js.map