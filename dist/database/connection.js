"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDbConnection = exports.dbConnectionMain = exports.dbConnection = void 0;
const mssql_1 = __importDefault(require("mssql"));
const config_1 = __importDefault(require("../config"));
let mainPool = null;
let pool = null;
const dbConnection = async (server, base, user, pass) => {
    if (!pool) {
        const dbConfig = {
            user: user || config_1.default.dbUser,
            password: pass || config_1.default.dbPassword,
            server: server,
            database: base,
            options: {
                encrypt: true,
                trustServerCertificate: true
            },
        };
        try {
            pool = new mssql_1.default.ConnectionPool(dbConfig);
            await pool.connect();
            console.log('Conexión a la DB establecida.');
        }
        catch (error) {
            console.error('Error al conectar a la DB:', error);
            // Reiniciamos pool para evitar estados corruptos
            pool = null;
            throw new Error('Error en la conexión a la base de datos');
        }
    }
    return pool;
};
exports.dbConnection = dbConnection;
const dbConnectionMain = async () => {
    if (!mainPool) {
        const dbConfig = {
            user: config_1.default.dbUser,
            password: config_1.default.dbPassword,
            server: config_1.default.dbServer,
            database: config_1.default.dbDatabase,
            options: {
                encrypt: true,
                trustServerCertificate: true
            },
        };
        try {
            mainPool = await mssql_1.default.connect(dbConfig);
        }
        catch (error) {
            throw error;
        }
    }
    return mainPool;
};
exports.dbConnectionMain = dbConnectionMain;
const closeDbConnection = async () => {
    console.log("closeDbConnection");
    if (mainPool) {
        await mainPool.close();
        mainPool = null;
    }
    if (pool) {
        await pool.close();
        pool = null;
    }
};
exports.closeDbConnection = closeDbConnection;
//# sourceMappingURL=connection.js.map