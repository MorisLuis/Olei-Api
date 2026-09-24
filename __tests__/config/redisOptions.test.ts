import { createRedisOptions } from '../../src/config/redisOptions';

describe('createRedisOptions', () => {
    it('keeps TLS disabled for an explicitly local configuration', () => {
        expect(createRedisOptions({
            host: '127.0.0.1',
            port: 6379,
            tlsEnabled: false,
        })).toEqual({
            host: '127.0.0.1',
            port: 6379,
            password: undefined,
            lazyConnect: true,
        });
    });

    it('enables TLS with the configured certificate server name', () => {
        expect(createRedisOptions({
            host: 'redis.internal',
            port: 6380,
            password: 'redis-password',
            tlsEnabled: true,
            tlsServername: 'redis.example.com',
        })).toEqual({
            host: 'redis.internal',
            port: 6380,
            password: 'redis-password',
            lazyConnect: true,
            tls: { servername: 'redis.example.com' },
        });
    });

    it('uses the Redis host as the TLS server name when no override is provided', () => {
        expect(createRedisOptions({
            host: 'redis.example.com',
            port: 6380,
            tlsEnabled: true,
        }).tls).toEqual({ servername: 'redis.example.com' });
    });
});
