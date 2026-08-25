import { loadRuntimeConfig, RuntimeConfigError } from '../../src/config';

const validEnvironment = (): Record<string, string | undefined> => ({
    NODE_ENV: 'development',
    PORT: '5001',
    DB_USER: 'db-user',
    DB_PASSWORD: 'db-password',
    DB_SERVER: 'db-server',
    DB_DATABASE: 'db-name',
    REDIS_HOST: 'redis-host',
    REDIS_PORT: '6379',
    ACCESS_TOKEN_SECRET: 'access-secret',
    ACCESS_TOKEN_SEVER_SECRET: 'server-secret',
    REFRESH_TOKEN_SECRET: 'refresh-secret',
    AZURE_OPENAI_API_KEY: 'azure-key',
    AZURE_OPENAI_API_INSTANCE_NAME: 'azure-instance',
    AZURE_OPENAI_API_DEPLOYMENT_NAME: 'azure-deployment',
    AZURE_OPENAI_API_VERSION: 'azure-version',
});

describe('loadRuntimeConfig', () => {
    it('parses and normalizes a valid development environment', () => {
        const environment = validEnvironment();
        environment.DB_SERVER = '  db-server  ';

        const result = loadRuntimeConfig(environment);

        expect(result).toEqual(expect.objectContaining({
            nodeEnv: 'development',
            port: 5001,
            database: expect.objectContaining({
                server: 'db-server',
                password: 'db-password',
            }),
            redis: {
                host: 'redis-host',
                port: 6379,
                password: undefined,
            },
        }));
    });

    it('applies safe local defaults', () => {
        const environment = validEnvironment();
        delete environment.NODE_ENV;
        delete environment.PORT;
        delete environment.REDIS_HOST;
        delete environment.REDIS_PORT;

        const result = loadRuntimeConfig(environment);

        expect(result.nodeEnv).toBe('development');
        expect(result.port).toBe(5001);
        expect(result.shutdownTimeoutMs).toBe(25_000);
        expect(result.redis.host).toBe('127.0.0.1');
        expect(result.redis.port).toBe(6379);
    });

    it.each(['999', '120001', 'invalid'])(
        'rejects invalid SHUTDOWN_TIMEOUT_MS value %s',
        shutdownTimeoutMs => {
            const environment = validEnvironment();
            environment.SHUTDOWN_TIMEOUT_MS = shutdownTimeoutMs;

            expect(() => loadRuntimeConfig(environment)).toThrow(RuntimeConfigError);
        },
    );

    it.each(['staging', 'production'] as const)(
        'requires REDIS_PASSWORD in %s',
        nodeEnv => {
            const environment = validEnvironment();
            environment.NODE_ENV = nodeEnv;

            expect(() => loadRuntimeConfig(environment)).toThrow(RuntimeConfigError);

            try {
                loadRuntimeConfig(environment);
            } catch (error) {
                expect(error).toBeInstanceOf(RuntimeConfigError);
                expect((error as RuntimeConfigError).invalidVariables).toContain('REDIS_PASSWORD');
            }
        },
    );

    it('accepts authenticated Redis in staging', () => {
        const environment = validEnvironment();
        environment.NODE_ENV = 'staging';
        environment.REDIS_PASSWORD = 'redis-password';

        const result = loadRuntimeConfig(environment);

        expect(result.redis.password).toBe('redis-password');
    });

    it.each([
        ['zero', '0'],
        ['not a number', 'invalid'],
        ['above the TCP range', '65536'],
    ])('rejects a PORT that is %s', (_description, port) => {
        const environment = validEnvironment();
        environment.PORT = port;

        expect(() => loadRuntimeConfig(environment)).toThrow(RuntimeConfigError);
    });

    it('reports variable names without exposing supplied secret values', () => {
        const environment = validEnvironment();
        environment.DB_PASSWORD = '   ';
        environment.ACCESS_TOKEN_SECRET = '   ';

        let caught: unknown;
        try {
            loadRuntimeConfig(environment);
        } catch (error) {
            caught = error;
        }

        expect(caught).toBeInstanceOf(RuntimeConfigError);
        const configError = caught as RuntimeConfigError;
        expect(configError.invalidVariables).toEqual(['ACCESS_TOKEN_SECRET', 'DB_PASSWORD']);
        expect(configError.message).not.toContain('db-password');
        expect(configError.message).not.toContain('access-secret');
    });

    it('keeps optional JWT metadata undefined when omitted', () => {
        const result = loadRuntimeConfig(validEnvironment());

        expect(result.auth).toEqual(expect.objectContaining({
            accessIssuer: undefined,
            refreshIssuer: undefined,
            serverIssuer: undefined,
        }));
    });
});
