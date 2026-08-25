import type { RuntimeConfig } from '../src/config';
import { bootstrap } from '../src/bootstrap';

const runtimeConfig = { port: 4321 } as RuntimeConfig;

describe('bootstrap', () => {
    it('validates configuration before constructing and starting the server', async () => {
        const events: string[] = [];
        const start = jest.fn(() => {
            events.push('start');
            return Promise.resolve();
        });
        const loadConfig = jest.fn(() => {
            events.push('config');
            return runtimeConfig;
        });
        const createServer = jest.fn(() => {
            events.push('construct');
            return { start };
        });

        await bootstrap({ loadConfig, createServer });

        expect(events).toEqual(['config', 'construct', 'start']);
        expect(createServer).toHaveBeenCalledWith(4321);
    });

    it('does not construct or start the server when configuration is invalid', async () => {
        const configurationError = new Error('invalid configuration');
        const loadConfig = jest.fn((): RuntimeConfig => {
            throw configurationError;
        });
        const createServer = jest.fn();

        await expect(bootstrap({ loadConfig, createServer })).rejects.toBe(configurationError);

        expect(createServer).not.toHaveBeenCalled();
    });

    it('propagates startup failure to the process boundary', async () => {
        const startupError = new Error('startup failed');
        const start = jest.fn().mockRejectedValue(startupError);

        await expect(bootstrap({
            loadConfig: jest.fn(() => runtimeConfig),
            createServer: jest.fn(() => ({ start })),
        })).rejects.toBe(startupError);
    });
});
