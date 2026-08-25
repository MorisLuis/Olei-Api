import { loadRuntimeConfig } from './config';
import Server from './models/server';

interface ApplicationServer {
    start: () => Promise<void>;
}

const createServer = (port: number): ApplicationServer => new Server(port);

interface BootstrapDependencies {
    loadConfig: typeof loadRuntimeConfig;
    createServer: typeof createServer;
}

const defaultDependencies: BootstrapDependencies = {
    loadConfig: loadRuntimeConfig,
    createServer,
};

export const bootstrap = async (
    dependencies: BootstrapDependencies = defaultDependencies,
): Promise<ApplicationServer> => {
    const runtimeConfig = dependencies.loadConfig();
    const server = dependencies.createServer(runtimeConfig.port);
    await server.start();
    return server;
};
