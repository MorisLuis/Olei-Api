"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrismaClient = void 0;
// src/utils/prismaPool.ts
const client_1 = require("@prisma/client");
const _1 = require(".");
const prismaClients = new Map();
function getPrismaClient(server, database) {
    const key = (0, _1.getPoolKey)(server, database);
    if (prismaClients.has(key)) {
        return prismaClients.get(key);
    }
    // Construye una instancia nueva apuntando a la DB dinámica
    const url = `sqlserver://${server.trim()};database=${database.trim()};user=${process.env.DB_USER};password=${process.env.DB_PASSWORD};encrypt=true;trustServerCertificate=true`;
    const client = new client_1.PrismaClient({
        datasources: {
            db: { url }
        }
    });
    prismaClients.set(key, client);
    return client;
}
exports.getPrismaClient = getPrismaClient;
//# sourceMappingURL=prismaConnection.js.map