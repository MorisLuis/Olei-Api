"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConnectionMain = exports.dbConnectionWeb = exports.dbConnection = void 0;
const mssql_1 = __importDefault(require("mssql"));
const config_1 = __importDefault(require("../config"));
let mainPool = null;
const connectionPools = new Map(); // Mapa para almacenar las conexiones activas
const MAX_CONNECTIONS = 10; // Límite de conexiones simultáneas
const getPoolKey = (server, base) => `${server}-${base}`; // Función para generar una clave única por servidor y base de datos
// Conexion App
const dbConnection = async (server, base, user, pass) => {
    // Get pool key
    const poolKey = getPoolKey(server, base);
    // Si ya existe un pool de conexión y sigue activo, lo reutilizamos
    if (connectionPools.has(poolKey)) {
        const existingPool = connectionPools.get(poolKey);
        if (existingPool?.connected)
            return existingPool;
    }
    // Si el número de conexiones activas supera el límite, rechaza la solicitud
    if (connectionPools.size >= MAX_CONNECTIONS) {
        throw new Error('⚠️ Límite de conexiones alcanzado. Inténtalo más tarde.');
    }
    ;
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
        // Crear un nuevo pool de conexión
        const pool = new mssql_1.default.ConnectionPool(dbConfig);
        await pool.connect();
        connectionPools.set(poolKey, pool);
        console.log(`✅ Conectado a SQL Server: ${server}, DB: ${base}`);
        return pool;
    }
    catch (error) {
        console.error(`❌ Error al conectar con SQL Server (${server} - ${base}):`, error);
        throw error;
    }
};
exports.dbConnection = dbConnection;
// Conexion Web
const dbConnectionWeb = async (server, base) => {
    // Get pool key
    const poolKey = getPoolKey(server, base);
    // Si ya existe un pool de conexión y sigue activo, lo reutilizamos
    if (connectionPools.has(poolKey)) {
        const existingPool = connectionPools.get(poolKey);
        if (existingPool?.connected)
            return existingPool;
    }
    // Si el número de conexiones activas supera el límite, rechaza la solicitud
    if (connectionPools.size >= MAX_CONNECTIONS) {
        throw new Error('⚠️ Límite de conexiones alcanzado. Inténtalo más tarde.');
    }
    ;
    const dbConfig = {
        user: config_1.default.dbUser,
        password: config_1.default.dbPassword,
        server: server,
        database: base,
        options: {
            encrypt: true,
            trustServerCertificate: true
        },
    };
    try {
        // Crear un nuevo pool de conexión
        const pool = new mssql_1.default.ConnectionPool(dbConfig);
        await pool.connect();
        connectionPools.set(poolKey, pool);
        console.log(`✅ Conectado a SQL Server: ${server}, DB: ${base}`);
        return pool;
    }
    catch (error) {
        console.error(`❌ Error al conectar con SQL Server (${server} - ${base}):`, error);
        throw error;
    }
};
exports.dbConnectionWeb = dbConnectionWeb;
// Conexion App Main
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
        mainPool = await mssql_1.default.connect(dbConfig);
    }
    return mainPool;
};
exports.dbConnectionMain = dbConnectionMain;
// Función para cerrar todas las conexiones inactivas después de un tiempo
setInterval(() => {
    for (const [key, pool] of connectionPools.entries()) {
        if (!pool.connected) {
            console.log(`🔴 Cerrando conexión inactiva: ${key}`);
            pool.close();
            connectionPools.delete(key);
        }
    }
}, 300000); // Verifica cada 5 minutos
// Cierra todas las conexiones al apagar el servidor
process.on('SIGINT', async () => {
    console.log('🔻 Cerrando todas las conexiones...');
    for (const pool of connectionPools.values()) {
        await pool.close();
    }
    process.exit();
});
//# sourceMappingURL=connection.js.map