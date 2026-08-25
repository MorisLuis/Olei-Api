import { EventEmitter } from 'node:events';
import type { Server as HttpServer } from 'node:http';

import Server from '../../src/models/server';
import { isReady, markNotReady } from '../../src/services/health/health.service';

const createDependencies = () => {
    const events: string[] = [];
    const dependencies = {
        connectDatabase: jest.fn(() => Promise.resolve()),
        connectRedis: jest.fn(() => Promise.resolve()),
        closeDatabase: jest.fn(() => {
            events.push('close-database');
            return Promise.resolve();
        }),
        closeRedis: jest.fn(() => {
            events.push('close-redis');
            return Promise.resolve();
        }),
        abortRedis: jest.fn(),
        stopCleanupTimer: jest.fn(() => {
            events.push('stop-timer');
        }),
        listen: jest.fn(() => Promise.resolve(new EventEmitter() as HttpServer)),
        closeHttpServer: jest.fn(() => {
            events.push('close-http');
            return Promise.resolve();
        }),
    };
    return { dependencies, events };
};

describe('Server shutdown', () => {
    beforeEach(() => {
        markNotReady();
        jest.spyOn(console, 'log').mockImplementation(() => undefined);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('becomes unready, closes HTTP, then cleans up timer and dependencies', async () => {
        const { dependencies, events } = createDependencies();
        const server = new Server(5001, dependencies);
        await server.start();

        const stopping = server.stop();

        expect(isReady({
            isDatabaseConnected: () => true,
            isRedisReady: () => true,
        })).toBe(false);
        await stopping;
        expect(events).toEqual(['close-http', 'stop-timer', 'close-database', 'close-redis']);
    });

    it('waits for HTTP draining before dependency cleanup', async () => {
        const { dependencies, events } = createDependencies();
        let finishHttpClose!: () => void;
        dependencies.closeHttpServer.mockImplementation(() => new Promise(resolve => {
            events.push('close-http');
            finishHttpClose = resolve;
        }));
        const server = new Server(5001, dependencies);
        await server.start();

        const stopping = server.stop();
        await Promise.resolve();

        expect(events).toEqual(['close-http']);
        expect(dependencies.closeDatabase).not.toHaveBeenCalled();
        expect(dependencies.closeRedis).not.toHaveBeenCalled();

        finishHttpClose();
        await stopping;
        expect(events).toEqual(['close-http', 'stop-timer', 'close-database', 'close-redis']);
    });

    it('returns the same shutdown operation for repeated calls', async () => {
        const { dependencies } = createDependencies();
        const server = new Server(5001, dependencies);
        await server.start();

        const first = server.stop();
        const second = server.stop();

        expect(second).toBe(first);
        await first;
        expect(dependencies.closeHttpServer).toHaveBeenCalledTimes(1);
        expect(dependencies.closeDatabase).toHaveBeenCalledTimes(1);
        expect(dependencies.closeRedis).toHaveBeenCalledTimes(1);
    });

    it('attempts every cleanup and rejects when any cleanup fails', async () => {
        const { dependencies } = createDependencies();
        dependencies.closeHttpServer.mockRejectedValue(new Error('http close failed'));
        dependencies.stopCleanupTimer.mockImplementation(() => {
            throw new Error('timer close failed');
        });
        dependencies.closeDatabase.mockRejectedValue(new Error('sql close failed'));
        dependencies.closeRedis.mockRejectedValue(new Error('redis close failed'));
        const server = new Server(5001, dependencies);
        await server.start();

        await expect(server.stop()).rejects.toThrow('Application resource cleanup failed');

        expect(dependencies.stopCleanupTimer).toHaveBeenCalledTimes(1);
        expect(dependencies.closeDatabase).toHaveBeenCalledTimes(1);
        expect(dependencies.closeRedis).toHaveBeenCalledTimes(1);
    });
});
