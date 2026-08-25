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
    const closeDatabase = jest.fn(() => {
        events.push('close-database');
        return Promise.resolve();
    });
    const abortRedis = jest.fn(() => {
        events.push('abort-redis');
    });
    const listen = jest.fn(() => {
        events.push('http');
        return Promise.resolve(new EventEmitter() as HttpServer);
    });

    return {
        dependencies: { connectDatabase, connectRedis, closeDatabase, abortRedis, listen },
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

    it('connects SQL and Redis before opening the HTTP listener', async () => {
        const { dependencies, events } = createDependencies();
        const server = new Server(5001, dependencies);

        await server.start();

        expect(events).toEqual(['database', 'redis', 'http']);
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
        expect(events).toEqual(['abort-redis', 'close-database']);
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
        expect(events).toEqual(['database', 'abort-redis', 'close-database']);
    });

    it('cleans up dependencies when the HTTP listener fails', async () => {
        const { dependencies, events } = createDependencies();
        const listenError = new Error('port unavailable');
        dependencies.listen.mockRejectedValue(listenError);
        const server = new Server(5001, dependencies);

        await expect(server.start()).rejects.toBe(listenError);

        expect(events).toEqual(['database', 'redis', 'abort-redis', 'close-database']);
    });

    it('preserves the startup failure when rollback also fails', async () => {
        const { dependencies } = createDependencies();
        const startupError = new Error('redis unavailable');
        dependencies.connectRedis.mockRejectedValue(startupError);
        dependencies.abortRedis.mockImplementation(() => {
            throw new Error('redis cleanup failed');
        });
        dependencies.closeDatabase.mockRejectedValue(new Error('sql cleanup failed'));
        const server = new Server(5001, dependencies);

        await expect(server.start()).rejects.toBe(startupError);

        expect(dependencies.abortRedis).toHaveBeenCalledTimes(1);
        expect(dependencies.closeDatabase).toHaveBeenCalledTimes(1);
    });
});
