import Redis from 'ioredis';
import config from '../config';
import { logger } from '../helpers/logger';
import { createRedisOptions } from './redisOptions';

const redisClient = new Redis(createRedisOptions({
    host: config.redisHost,
    port: config.redisPort,
    password: config.redisPassword,
    tlsEnabled: config.redisTlsEnabled,
    tlsServername: config.redisTlsServername,
}));

redisClient.on('connect', () => logger.info('redis.connected'));
redisClient.on('error', () => logger.error('redis.connection_failed'));

export const connectRedis = async (): Promise<void> => {
    if (redisClient.status === 'ready') return;
    if (redisClient.status === 'wait') {
        await redisClient.connect();
        return;
    }

    await redisClient.ping();
};

export const abortRedisConnection = (): void => {
    if (redisClient.status !== 'end') redisClient.disconnect(false);
};

export const closeRedis = async (): Promise<void> => {
    if (redisClient.status === 'wait' || redisClient.status === 'end') return;
    await redisClient.quit();
};

export default redisClient;
