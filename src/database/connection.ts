 

import sql from 'mssql';
import config from "../config";

let mainPool: sql.ConnectionPool | null = null;
const connectionPools: Map<string, sql.ConnectionPool> = new Map(); // Mapa para almacenar las conexiones activas
const MAX_CONNECTIONS = 10; // Límite de conexiones simultáneas
const getPoolKey = (server: string, base: string) => `${server}-${base}`; // Función para generar una clave única por servidor y base de datos


// Conexion App
export const dbConnection = async (server: string, base: string, user: string, pass: string) : Promise<sql.ConnectionPool> => {
    // Get pool key
    const poolKey = getPoolKey(server, base);

    // Si ya existe un pool de conexión y sigue activo, lo reutilizamos
    if (connectionPools.has(poolKey)) {
        const existingPool = connectionPools.get(poolKey);

        if (existingPool?.connected) return existingPool;
    }

    // Si el número de conexiones activas supera el límite, rechaza la solicitud
    if (connectionPools.size >= MAX_CONNECTIONS) {
        throw new Error('⚠️ Límite de conexiones alcanzado. Inténtalo más tarde.');
    };


    const dbConfig: sql.config = {
        user: user || config.dbUser,
        password: pass || config.dbPassword,
        server: server,
        database: base,
        options: {
            encrypt: true,
            trustServerCertificate: true
        },
    };

    try {
        // Crear un nuevo pool de conexión
        const pool = new sql.ConnectionPool(dbConfig);
        await pool.connect();
        connectionPools.set(poolKey, pool);

        console.log(`✅ Conectado a SQL Server: ${server}, DB: ${base}`);
        return pool;
    } catch (error) {
        console.error(`❌ Error al conectar con SQL Server (${server} - ${base}):`, error);
        throw error;
    }
};

// Conexion Web
export const dbConnectionWeb = async (server: string, base: string) : Promise<sql.ConnectionPool> => {
    // Get pool key
    const poolKey = getPoolKey(server, base);

    // Si ya existe un pool de conexión y sigue activo, lo reutilizamos
    if (connectionPools.has(poolKey)) {
        const existingPool = connectionPools.get(poolKey);
        if (existingPool?.connected) return existingPool;
    }

    // Si el número de conexiones activas supera el límite, rechaza la solicitud
    if (connectionPools.size >= MAX_CONNECTIONS) {
        throw new Error('⚠️ Límite de conexiones alcanzado. Inténtalo más tarde.');
    };


    const dbConfig: sql.config = {
        user: config.dbUser,
        password: config.dbPassword,
        server: server,
        database: base,
        options: {
            encrypt: true,
            trustServerCertificate: true
        },
    };

    try {
        // Crear un nuevo pool de conexión
        const pool = new sql.ConnectionPool(dbConfig);
        await pool.connect();
        connectionPools.set(poolKey, pool);

        console.log(`✅ Conectado a SQL Server: ${server}, DB: ${base}`);
        return pool;
    } catch (error) {
        console.error(`❌ Error al conectar con SQL Server (${server} - ${base}):`, error);
        throw error;
    }
};

// Conexion App Main
export const dbConnectionMain = async () : Promise<sql.ConnectionPool> => {
    if (!mainPool) {
        const dbConfig = {
            user: config.dbUser,
            password: config.dbPassword,
            server: config.dbServer,
            database: config.dbDatabase,
            options: {
                encrypt: true,
                trustServerCertificate: true
            },
        };

        mainPool = await sql.connect(dbConfig);

    }
    return mainPool;
};


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
