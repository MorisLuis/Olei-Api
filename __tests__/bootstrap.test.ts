import type { RuntimeConfig } from '../src/config';
import { bootstrap } from '../src/bootstrap';

const runtimeConfig = { port: 4321, shutdownTimeoutMs: 25_000 } as RuntimeConfig;

describe('bootstrap', () => {
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
            return { start, stop };
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
            createServer: jest.fn(() => ({ start, stop })),
            registerShutdown,
        })).rejects.toBe(startupError);
        expect(registerShutdown).not.toHaveBeenCalled();
    });
});
