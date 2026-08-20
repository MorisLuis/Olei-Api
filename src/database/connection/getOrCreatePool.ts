import sql from 'mssql';
import type { TenantPoolCredentials, TenantPoolEntry } from './types';
import { normalizeDatabaseLocation } from './normalizeDatabaseLocation';

const MAX_TENANT_POOLS = 10;
const tenantPools = new Map<string, TenantPoolEntry[]>();
let tenantPoolCount = 0;

const getTenantCacheKey = (server: string, database: string): string => JSON.stringify([server, database]);

export const removeTenantPoolEntry = (cacheKey: string, entry: TenantPoolEntry): void => {
    const entries = tenantPools.get(cacheKey);
    if (!entries) return;
    const remaining = entries.filter(candidate => candidate !== entry);
    if (remaining.length) tenantPools.set(cacheKey, remaining);
    else tenantPools.delete(cacheKey);
    tenantPoolCount -= 1;
};

export const getTenantPoolEntries = (): ReadonlyMap<string, TenantPoolEntry[]> => tenantPools;

export const clearTenantPoolEntries = (): void => {
    tenantPools.clear();
    tenantPoolCount = 0;
};

export const getOrCreatePool = async (
    serverValue: string,
    databaseValue: string,
    credentials: TenantPoolCredentials,
): Promise<sql.ConnectionPool> => {

    const { server, database } = normalizeDatabaseLocation(serverValue, databaseValue);
    const cacheKey = getTenantCacheKey(server, database);
    const entries = tenantPools.get(cacheKey) ?? [];
    const existing = entries.find(entry => entry.authenticationContext === credentials.authenticationContext
        && entry.user === credentials.user && entry.password === credentials.password);

    if (existing?.pool?.connected) return existing.pool;
    if (existing?.connecting) return existing.connecting;
    if (existing) {
        removeTenantPoolEntry(cacheKey, existing);
        if (existing.pool) void existing.pool.close().catch(() => undefined);
    }

    // Reserve capacity before connecting so concurrent callers cannot exceed the limit.
    if (tenantPoolCount >= MAX_TENANT_POOLS) {
        throw new Error('⚠️ Límite de conexiones alcanzado. Inténtalo más tarde.');
    }

    const entry: TenantPoolEntry = { ...credentials };
    tenantPools.set(cacheKey, [...(tenantPools.get(cacheKey) ?? []), entry]);
    tenantPoolCount += 1;
    const pool = new sql.ConnectionPool({
        user: credentials.user,
        password: credentials.password,
        server,
        database,
        options: { encrypt: true, trustServerCertificate: true },
    });

    entry.connecting = pool.connect().then(connectedPool => {
        entry.pool = connectedPool;
        entry.connecting = undefined;
        console.log(`✅ Conectado a SQL Server: ${server}, DB: ${database}`);
        return connectedPool;
    }).catch(error => {
        removeTenantPoolEntry(cacheKey, entry);
        console.error(`❌ Error al conectar con SQL Server (${server} - ${database})`);
        throw error;
    });
    return entry.connecting;
};
