import { closeAllDatabaseConnections } from './closeConnectionPools';

let shutdownPromise: Promise<void> | null = null;

/** Closes all database pools once and exits after cleanup finishes. */
export const shutdownConnections = (): void => {
    if (shutdownPromise) return;
    console.log('🔻 Cerrando todas las conexiones...');
    shutdownPromise = closeAllDatabaseConnections().finally(() => process.exit(0));
};

process.once('SIGINT', shutdownConnections);
process.once('SIGTERM', shutdownConnections);
