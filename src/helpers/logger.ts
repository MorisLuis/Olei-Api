export interface LogMetadata {
    port?: number;
    context?: string;
    method?: string;
    route?: string;
    statusCode?: number;
    code?: string | null;
    issueCount?: number;
}

type LogLevel = 'info' | 'warn' | 'error';

const write = (level: LogLevel, event: string, metadata: LogMetadata = {}): void => {
    let output: string;
    try {
        output = JSON.stringify({
            timestamp: new Date().toISOString(),
            level,
            event,
            ...(metadata.port === undefined ? {} : { port: metadata.port }),
            ...(metadata.context === undefined ? {} : { context: metadata.context }),
            ...(metadata.method === undefined ? {} : { method: metadata.method }),
            ...(metadata.route === undefined ? {} : { route: metadata.route }),
            ...(metadata.statusCode === undefined ? {} : { statusCode: metadata.statusCode }),
            ...(metadata.code === undefined ? {} : { code: metadata.code }),
            ...(metadata.issueCount === undefined ? {} : { issueCount: metadata.issueCount }),
        });
    } catch {
        output = JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'error',
            event: 'logger.serialization_failed',
        });
    }

    try {
        if (level === 'info') console.log(output);
        else if (level === 'warn') console.warn(output);
        else console.error(output);
    } catch {
        // Logging must not change application control flow.
    }
};

export const logger = {
    info: (event: string, metadata?: LogMetadata): void => write('info', event, metadata),
    warn: (event: string, metadata?: LogMetadata): void => write('warn', event, metadata),
    error: (event: string, metadata?: LogMetadata): void => write('error', event, metadata),
};
