import type { closeHttpServer, listen } from "./server";

export interface ServerDependencies {
    connectDatabase: () => Promise<unknown>;
    connectRedis: () => Promise<void>;
    closeDatabase: () => Promise<void>;
    closeRedis: () => Promise<void>;
    abortRedis: () => void;
    stopCleanupTimer: () => void;
    closeHttpServer: typeof closeHttpServer;
    listen: typeof listen;
}
