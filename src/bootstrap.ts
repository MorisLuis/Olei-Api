/* global require */
import { loadRuntimeConfig } from './config';
import { createShutdown, registerShutdownSignals } from './lifecycle/shutdown';
import type { ApplicationServer } from './types';
import type * as ServerModule from './models/server';


const createServer = (port: number): Promise<ApplicationServer> => Promise.resolve().then(() => {
    // Defer loading until configuration is validated. Extensionless CommonJS
    // resolution works with both ts-node-dev sources and compiled JavaScript.
    const { Server }: typeof ServerModule = require('./models/server');
    return new Server(port);
});

const registerShutdown = (server: ApplicationServer, timeoutMs: number): void => {
    registerShutdownSignals(createShutdown(server, timeoutMs));
};

interface BootstrapDependencies {
    loadConfig: typeof loadRuntimeConfig;
    createServer: typeof createServer;
    registerShutdown: typeof registerShutdown;
}

const defaultDependencies: BootstrapDependencies = {
    loadConfig: loadRuntimeConfig,
    createServer,
    registerShutdown,
};

/**
 * @description Bootstraps the application server by loading configuration, creating the server, 
 * starting it, and registering shutdown signals.
 * @param dependencies @BootstrapDependencies
 * @returns A promise that resolves to the started ApplicationServer instance.
 */

export const bootstrap = async (
    dependencies: BootstrapDependencies = defaultDependencies,
): Promise<ApplicationServer> => {

    const runtimeConfig = dependencies.loadConfig();

    const server = await dependencies.createServer(runtimeConfig.port);
    await server.start();

    dependencies.registerShutdown(server, runtimeConfig.shutdownTimeoutMs);

    return server;
};
