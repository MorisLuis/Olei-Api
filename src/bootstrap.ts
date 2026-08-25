import { loadRuntimeConfig } from './config';
import { createShutdown, registerShutdownSignals } from './lifecycle/shutdown';
import Server from './models/server';
import type { ApplicationServer } from './types';


const createServer = (port: number): ApplicationServer => new Server(port);

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

    const server = dependencies.createServer(runtimeConfig.port);
    await server.start();

    dependencies.registerShutdown(server, runtimeConfig.shutdownTimeoutMs);

    return server;
};
