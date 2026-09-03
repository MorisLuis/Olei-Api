import { config } from "dotenv";
import { z } from "zod";

config();

const requiredString = z.string().refine(value => value.trim().length > 0);
const optionalString = z.string().trim().min(1).optional();

const runtimeEnvironmentSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65_535).default(5001),
    SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(120_000).default(25_000),
    DB_USER: requiredString,
    DB_PASSWORD: requiredString,
    DB_SERVER: z.string().trim().min(1),
    DB_DATABASE: z.string().trim().min(1),
    REDIS_HOST: z.string().trim().min(1).default('127.0.0.1'),
    REDIS_PORT: z.coerce.number().int().min(1).max(65_535).default(6379),
    REDIS_PASSWORD: optionalString,
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
    if ((environment.NODE_ENV === 'staging' || environment.NODE_ENV === 'production')
        && !environment.REDIS_PASSWORD) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Required outside development and test',
            path: ['REDIS_PASSWORD'],
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
    };
    redis: {
        host: string;
        port: number;
        password?: string;
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

    return {
        nodeEnv: values.NODE_ENV,
        port: values.PORT,
        shutdownTimeoutMs: values.SHUTDOWN_TIMEOUT_MS,
        database: {
            user: values.DB_USER,
            password: values.DB_PASSWORD,
            server: values.DB_SERVER,
            database: values.DB_DATABASE,
        },
        redis: {
            host: values.REDIS_HOST,
            port: values.REDIS_PORT,
            password: values.REDIS_PASSWORD,
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

export default {
    port: process.env.PORT || 5001,
    dbUser: process.env.DB_USER || "",
    dbPassword: process.env.DB_PASSWORD || "",
    dbServer: process.env.DB_SERVER || "",
    dbDatabase: process.env.DB_DATABASE || "",
};
