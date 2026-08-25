import Redis from 'ioredis';

const redisClient = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    lazyConnect: true,
});

redisClient.on('connect', () => console.log('✅ Conectado a Redis'));
redisClient.on('error', () => console.error('Redis connection error'));

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
