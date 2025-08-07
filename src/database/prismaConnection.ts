// src/utils/prismaPool.ts
import { PrismaClient } from '@prisma/client';
import { getPoolKey } from '.';

const prismaClients: Map<string, PrismaClient> = new Map();

export function getPrismaClient(server: string, database: string) : PrismaClient {

    const key = getPoolKey(server, database);
    console.log({key})

    if (prismaClients.has(key)) {
        return prismaClients.get(key)!;
    }

    // Construye una instancia nueva apuntando a la DB dinámica
    const url = `sqlserver://${server.trim()};database=${database.trim()};user=${process.env.DB_USER};password=${process.env.DB_PASSWORD};encrypt=true;trustServerCertificate=true`;

    const client = new PrismaClient({
        datasources: {
            db: { url }
        }
    });

    prismaClients.set(key, client);
    return client;
}
