import { config } from "dotenv";
import { z } from "zod";

config();

const requiredString = z.string().refine(value => value.trim().length > 0);
const optionalString = z.string().trim().min(1).optional();
const optionalBoolean = z.enum(['true', 'false']).transform(value => value === 'true').optional();

const runtimeEnvironmentSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65_535).default(5001),
    SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(120_000).default(25_000),
    DB_USER: requiredString,
    DB_PASSWORD: requiredString,
    DB_SERVER: z.string().trim().min(1),
    DB_DATABASE: z.string().trim().min(1),
    DB_ENCRYPT: z.enum(['true', 'false']).transform(value => value === 'true').default('true'),
    DB_TRUST_SERVER_CERTIFICATE: optionalBoolean,
    REDIS_HOST: z.string().trim().min(1).default('127.0.0.1'),
    REDIS_PORT: z.coerce.number().int().min(1).max(65_535).default(6379),
    REDIS_PASSWORD: optionalString,
    REDIS_TLS_ENABLED: optionalBoolean,
    REDIS_TLS_SERVERNAME: optionalString,
    ACCESS_TOKEN_SECRET: requiredString,
    ACCESS_TOKEN_SEVER_SECRET: requiredString,
    REFRESH_TOKEN_SECRET: requiredString,
    JWT_ACCESS_ISSUER: optionalString,
    JWT_ACCESS_AUDIENCE: optionalString,
    JWT_ACCESS_SUBJECT: optionalString,
    JWT_REFRESH_ISSUER: optionalString,
    JWT_REFRESH_AUDIENCE: optionalString,
    JWT_REFRESH_SUBJECT: optionalString,
    JWT_SERVER_ISSUER: optionalString,
    JWT_SERVER_AUDIENCE: optionalString,
    JWT_SERVER_SUBJECT: optionalString,
    AZURE_OPENAI_API_KEY: requiredString,
    AZURE_OPENAI_API_INSTANCE_NAME: z.string().trim().min(1),
    AZURE_OPENAI_API_DEPLOYMENT_NAME: z.string().trim().min(1),
    AZURE_OPENAI_API_VERSION: z.string().trim().min(1),
}).superRefine((environment, context) => {
    const secureRuntime = environment.NODE_ENV === 'staging' || environment.NODE_ENV === 'production';

    if (secureRuntime && !environment.REDIS_PASSWORD) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Required outside development and test',
            path: ['REDIS_PASSWORD'],
        });
    }

    if (secureRuntime && !environment.DB_ENCRYPT) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Must be enabled outside development and test',
            path: ['DB_ENCRYPT'],
        });
    }

    if (secureRuntime && environment.DB_TRUST_SERVER_CERTIFICATE === true) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Must be disabled outside development and test',
            path: ['DB_TRUST_SERVER_CERTIFICATE'],
        });
    }

    if (secureRuntime && environment.REDIS_TLS_ENABLED !== true) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Must be enabled outside development and test',
            path: ['REDIS_TLS_ENABLED'],
        });
    }
});

export interface RuntimeConfig {
    nodeEnv: 'development' | 'test' | 'staging' | 'production';
    port: number;
    shutdownTimeoutMs: number;
    database: {
        user: string;
        password: string;
        server: string;
        database: string;
        encrypt: boolean;
        trustServerCertificate: boolean;
    };
    redis: {
        host: string;
        port: number;
        password?: string;
        tlsEnabled: boolean;
        tlsServername?: string;
    };
    auth: {
        accessTokenSecret: string;
        serverAccessTokenSecret: string;
        refreshTokenSecret: string;
        accessIssuer?: string;
        accessAudience?: string;
        accessSubject?: string;
        refreshIssuer?: string;
        refreshAudience?: string;
        refreshSubject?: string;
        serverIssuer?: string;
        serverAudience?: string;
        serverSubject?: string;
    };
    azureOpenAI: {
        apiKey: string;
        instanceName: string;
        deploymentName: string;
        apiVersion: string;
    };
}

export class RuntimeConfigError extends Error {
    public readonly invalidVariables: string[];

    constructor(invalidVariables: string[]) {
        super(`Invalid runtime configuration: ${invalidVariables.join(', ')}`);
        this.name = 'RuntimeConfigError';
        this.invalidVariables = invalidVariables;
    }
}

export const loadRuntimeConfig = (
    environment: Record<string, string | undefined> = process.env,
): RuntimeConfig => {
    const result = runtimeEnvironmentSchema.safeParse(environment);

    if (!result.success) {
        const invalidVariables = [...new Set(result.error.issues.map(issue => String(issue.path[0] ?? 'environment')))]
            .sort();
        throw new RuntimeConfigError(invalidVariables);
    }

    const values = result.data;
    const secureRuntime = values.NODE_ENV === 'staging' || values.NODE_ENV === 'production';
    const redisTlsEnabled = values.REDIS_TLS_ENABLED ?? false;

    return {
        nodeEnv: values.NODE_ENV,
        port: values.PORT,
        shutdownTimeoutMs: values.SHUTDOWN_TIMEOUT_MS,
        database: {
            user: values.DB_USER,
            password: values.DB_PASSWORD,
            server: values.DB_SERVER,
            database: values.DB_DATABASE,
            encrypt: values.DB_ENCRYPT,
            trustServerCertificate: values.DB_TRUST_SERVER_CERTIFICATE ?? !secureRuntime,
        },
        redis: {
            host: values.REDIS_HOST,
            port: values.REDIS_PORT,
            password: values.REDIS_PASSWORD,
            tlsEnabled: redisTlsEnabled,
            tlsServername: redisTlsEnabled
                ? values.REDIS_TLS_SERVERNAME ?? values.REDIS_HOST
                : undefined,
        },
        auth: {
            accessTokenSecret: values.ACCESS_TOKEN_SECRET,
            serverAccessTokenSecret: values.ACCESS_TOKEN_SEVER_SECRET,
            refreshTokenSecret: values.REFRESH_TOKEN_SECRET,
            accessIssuer: values.JWT_ACCESS_ISSUER,
            accessAudience: values.JWT_ACCESS_AUDIENCE,
            accessSubject: values.JWT_ACCESS_SUBJECT,
            refreshIssuer: values.JWT_REFRESH_ISSUER,
            refreshAudience: values.JWT_REFRESH_AUDIENCE,
            refreshSubject: values.JWT_REFRESH_SUBJECT,
            serverIssuer: values.JWT_SERVER_ISSUER,
            serverAudience: values.JWT_SERVER_AUDIENCE,
            serverSubject: values.JWT_SERVER_SUBJECT,
        },
        azureOpenAI: {
            apiKey: values.AZURE_OPENAI_API_KEY,
            instanceName: values.AZURE_OPENAI_API_INSTANCE_NAME,
            deploymentName: values.AZURE_OPENAI_API_DEPLOYMENT_NAME,
            apiVersion: values.AZURE_OPENAI_API_VERSION,
        },
    };
};

const configuredNodeEnvironment = process.env.NODE_ENV ?? 'development';
const configuredSecureRuntime = configuredNodeEnvironment === 'staging'
    || configuredNodeEnvironment === 'production';
const configuredRedisHost = process.env.REDIS_HOST || '127.0.0.1';
const configuredRedisTlsEnabled = process.env.REDIS_TLS_ENABLED === 'true';

export default {
    port: process.env.PORT || 5001,
    dbUser: process.env.DB_USER || "",
    dbPassword: process.env.DB_PASSWORD || "",
    dbServer: process.env.DB_SERVER || "",
    dbDatabase: process.env.DB_DATABASE || "",
    dbEncrypt: process.env.DB_ENCRYPT !== 'false',
    dbTrustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE
        ? process.env.DB_TRUST_SERVER_CERTIFICATE === 'true'
        : !configuredSecureRuntime,
    redisHost: configuredRedisHost,
    redisPort: Number(process.env.REDIS_PORT) || 6379,
    redisPassword: process.env.REDIS_PASSWORD || undefined,
    redisTlsEnabled: configuredRedisTlsEnabled,
    redisTlsServername: configuredRedisTlsEnabled
        ? process.env.REDIS_TLS_SERVERNAME || configuredRedisHost
        : undefined,
};
