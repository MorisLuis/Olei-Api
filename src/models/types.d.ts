import type { listen } from "./server";

export interface ServerDependencies {
    connectDatabase: () => Promise<unknown>;
    connectRedis: () => Promise<void>;
    closeDatabase: () => Promise<void>;
    abortRedis: () => void;
    listen: typeof listen;
}