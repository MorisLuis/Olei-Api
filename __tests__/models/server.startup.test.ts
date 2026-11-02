import { EventEmitter } from 'node:events';
import type { Server as HttpServer } from 'node:http';

import Server from '../../src/models/server';
import { isReady, markNotReady } from '../../src/services/health/health.service';

const createDependencies = () => {
    const events: string[] = [];
    const connectDatabase = jest.fn(() => {
        events.push('database');
        return Promise.resolve();
    });
    const connectRedis = jest.fn(() => {
        events.push('redis');
        return Promise.resolve();
    });
    const startReportWorker = jest.fn(() => {
        events.push('worker');
        return Promise.resolve();
    });
    const closeReportWorker = jest.fn(() => {
        events.push('close-worker');
        return Promise.resolve();
    });
    const closeDatabase = jest.fn(() => {
        events.push('close-database');
        return Promise.resolve();
    });
    const closeRedis = jest.fn(() => {
        events.push('close-redis');
        return Promise.resolve();
    });
    const abortRedis = jest.fn(() => {
        events.push('abort-redis');
    });
    const listen = jest.fn(() => {
        events.push('http');
        return Promise.resolve(new EventEmitter() as HttpServer);
    });
    const closeHttpServer = jest.fn(() => {
        events.push('close-http');
        return Promise.resolve();
    });
    const stopCleanupTimer = jest.fn(() => {
        events.push('stop-timer');
    });

    return {
        dependencies: {
            connectDatabase,
            connectRedis,
            startReportWorker,
            closeReportWorker,
            closeDatabase,
            closeRedis,
            abortRedis,
            listen,
            closeHttpServer,
            stopCleanupTimer,
        },
        events,
    };
};

describe('Server startup', () => {
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
        markNotReady();
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
    });

    it('connects SQL, Redis and the report worker before opening the HTTP listener', async () => {
        const { dependencies, events } = createDependencies();
        const server = new Server(5001, dependencies);

        await server.start();

        expect(events).toEqual(['database', 'redis', 'worker', 'http']);
        expect(dependencies.listen).toHaveBeenCalledWith(server.app, 5001);
        expect(isReady({
            isDatabaseConnected: () => true,
            isRedisReady: () => true,
        })).toBe(true);
    });

    it('does not connect Redis or listen when SQL startup fails', async () => {
        const { dependencies, events } = createDependencies();
        const sqlError = new Error('sql unavailable');
        dependencies.connectDatabase.mockRejectedValue(sqlError);
        const server = new Server(5001, dependencies);

        await expect(server.start()).rejects.toBe(sqlError);

        expect(dependencies.connectRedis).not.toHaveBeenCalled();
        expect(dependencies.listen).not.toHaveBeenCalled();
        expect(events).toEqual(['abort-redis', 'close-database', 'close-worker']);
        expect(isReady({
            isDatabaseConnected: () => true,
            isRedisReady: () => true,
        })).toBe(false);
    });

    it('cleans up SQL and Redis when Redis startup fails', async () => {
        const { dependencies, events } = createDependencies();
        const redisError = new Error('redis unavailable');
        dependencies.connectRedis.mockRejectedValue(redisError);
        const server = new Server(5001, dependencies);

        await expect(server.start()).rejects.toBe(redisError);

        expect(dependencies.listen).not.toHaveBeenCalled();
        expect(events).toEqual(['database', 'abort-redis', 'close-database', 'close-worker']);
    });

    it('does not listen when worker startup fails and preserves that failure', async () => {
        const { dependencies } = createDependencies();
        const workerError = new Error('worker unavailable');
        dependencies.startReportWorker.mockRejectedValue(workerError);
        dependencies.closeReportWorker.mockRejectedValue(new Error('worker cleanup failed'));
        const server = new Server(5001, dependencies);

        await expect(server.start()).rejects.toBe(workerError);

        expect(dependencies.listen).not.toHaveBeenCalled();
        expect(dependencies.closeReportWorker).toHaveBeenCalledTimes(1);
        expect(dependencies.closeDatabase).toHaveBeenCalledTimes(1);
        expect(isReady({
            isDatabaseConnected: () => true,
            isRedisReady: () => true,
        })).toBe(false);
    });

    it('cleans up dependencies when the HTTP listener fails', async () => {
        const { dependencies, events } = createDependencies();
        const listenError = new Error('port unavailable');
        dependencies.listen.mockRejectedValue(listenError);
        const server = new Server(5001, dependencies);

        await expect(server.start()).rejects.toBe(listenError);

        expect(events).toEqual(['database', 'redis', 'worker', 'abort-redis', 'close-database', 'close-worker']);
    });

    it('preserves the startup failure when rollback also fails', async () => {
        const { dependencies } = createDependencies();
        const startupError = new Error('redis unavailable');
        dependencies.connectRedis.mockRejectedValue(startupError);
        dependencies.abortRedis.mockImplementation(() => {
            throw new Error('redis cleanup failed');
        });
        dependencies.closeDatabase.mockRejectedValue(new Error('sql cleanup failed'));
        dependencies.closeReportWorker.mockRejectedValue(new Error('worker cleanup failed'));
        const server = new Server(5001, dependencies);

        await expect(server.start()).rejects.toBe(startupError);

        expect(dependencies.abortRedis).toHaveBeenCalledTimes(1);
        expect(dependencies.closeDatabase).toHaveBeenCalledTimes(1);
        expect(dependencies.closeReportWorker).toHaveBeenCalledTimes(1);
    });
});
