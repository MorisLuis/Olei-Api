import type { RedisOptions } from 'ioredis';

export interface RedisConnectionConfig {
    host: string;
    port: number;
    password?: string;
    tlsEnabled: boolean;
    tlsServername?: string;
}

export const createRedisOptions = (config: RedisConnectionConfig): RedisOptions => ({
    host: config.host,
    port: config.port,
    password: config.password,
    lazyConnect: true,
    ...(config.tlsEnabled
        ? { tls: { servername: config.tlsServername ?? config.host } }
        : {}),
});
