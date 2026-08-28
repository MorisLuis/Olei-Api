import type { DatabaseLocation } from './types';

export const normalizeDatabaseLocation = (server: string, database: string): DatabaseLocation => ({
    server: server.trim(),
    database: database.trim(),
});
