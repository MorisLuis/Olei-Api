import type { RuntimeConfig } from '../src/config';
import { bootstrap } from '../src/bootstrap';
import { loadRuntimeConfig } from '../src/config';
import { Server } from '../src/models/server';
import { registerShutdownSignals } from '../src/lifecycle/shutdown';

jest.mock('../src/config', () => ({ loadRuntimeConfig: jest.fn() }));
jest.mock('../src/models/server', () => ({ Server: jest.fn() }));
jest.mock('../src/lifecycle/shutdown', () => ({
    createShutdown: jest.fn(() => jest.fn()),
    registerShutdownSignals: jest.fn(),
}));

const runtimeConfig = { port: 4321, shutdownTimeoutMs: 25_000 } as RuntimeConfig;

describe('bootstrap', () => {
    it('loads the default server module after validation and starts it', async () => {
        jest.mocked(loadRuntimeConfig).mockReturnValue(runtimeConfig);
        // eslint-disable-next-line no-unused-vars -- This is a TypeScript receiver annotation.
        jest.mocked(Server).mockImplementation(function (this: Server) {
            expect(loadRuntimeConfig).toHaveBeenCalledTimes(1);
            this.start = jest.fn().mockResolvedValue(undefined);
            this.stop = jest.fn();
            return this;
        });

        const server = await bootstrap();

        expect(loadRuntimeConfig).toHaveBeenCalledTimes(1);
        expect(Server).toHaveBeenCalledWith(4321);
        expect(server.start).toHaveBeenCalledTimes(1);
        expect(registerShutdownSignals).toHaveBeenCalledTimes(1);
    });
    it('validates configuration before constructing and starting the server', async () => {
        const events: string[] = [];
        const start = jest.fn(() => {
            events.push('start');
            return Promise.resolve();
        });
        const stop = jest.fn(() => Promise.resolve());
        const loadConfig = jest.fn(() => {
            events.push('config');
            return runtimeConfig;
        });
        const createServer = jest.fn(() => {
            events.push('construct');
            return Promise.resolve({ start, stop });
        });
        const registerShutdown = jest.fn(() => {
            events.push('register-shutdown');
        });

        await bootstrap({ loadConfig, createServer, registerShutdown });

        expect(events).toEqual(['config', 'construct', 'start', 'register-shutdown']);
        expect(createServer).toHaveBeenCalledWith(4321);
        expect(registerShutdown).toHaveBeenCalledWith({ start, stop }, 25_000);
    });

    it('does not construct or start the server when configuration is invalid', async () => {
        const configurationError = new Error('invalid configuration');
        const loadConfig = jest.fn((): RuntimeConfig => {
            throw configurationError;
        });
        const createServer = jest.fn();
        const registerShutdown = jest.fn();

        await expect(bootstrap({ loadConfig, createServer, registerShutdown })).rejects.toBe(configurationError);

        expect(createServer).not.toHaveBeenCalled();
        expect(registerShutdown).not.toHaveBeenCalled();
    });

    it('propagates startup failure to the process boundary', async () => {
        const startupError = new Error('startup failed');
        const start = jest.fn().mockRejectedValue(startupError);
        const stop = jest.fn(() => Promise.resolve());

        const registerShutdown = jest.fn();
        await expect(bootstrap({
            loadConfig: jest.fn(() => runtimeConfig),
            createServer: jest.fn(() => Promise.resolve({ start, stop })),
            registerShutdown,
        })).rejects.toBe(startupError);
        expect(registerShutdown).not.toHaveBeenCalled();
    });
});
