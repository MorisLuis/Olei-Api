"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDbConnection = exports.dbConnection = void 0;
const mssql_1 = __importDefault(require("mssql"));
const config_1 = __importDefault(require("../config"));
let pool = null;
const dbConnection = async (server, database, password, user) => {
    if (!pool) {
        const dbConfig = {
            user: user || config_1.default.dbUser,
            password: password || config_1.default.dbPassword,
            server: server || config_1.default.dbServer,
            database: database || config_1.default.dbDatabase,
            options: {
                encrypt: true,
                trustServerCertificate: true
            },
        };
        try {
            pool = await mssql_1.default.connect(dbConfig);
        }
        catch (error) {
            console.error('Error al conectar a la base de datos:', error.message);
            throw error;
        }
    }
    return pool;
};
exports.dbConnection = dbConnection;
const closeDbConnection = async () => {
    if (pool) {
        await pool.close();
        pool = null;
    }
};
exports.closeDbConnection = closeDbConnection;
//# sourceMappingURL=connection.js.map