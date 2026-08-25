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

export const functionTTYFriendly = (output: string): string => {
    const isTest = process.env.NODE_ENV === 'test';
    const isTTY = Boolean(process.stdout && (process.stdout as unknown as { isTTY?: boolean }).isTTY);
    if (isTest || !isTTY) return output;

    try {
        const record = JSON.parse(output) as Record<string, unknown>;
        const colors = {
            reset: '\x1b[0m',
            red: '\x1b[31m',
            yellow: '\x1b[33m',
            green: '\x1b[32m',
        };
        const level = String(record.level || 'info');
        const levelColor = level === 'info' ? colors.green : level === 'warn' ? colors.yellow : colors.red;

        const metaParts = Object.entries(record)
            .filter(([k]) => k !== 'timestamp' && k !== 'level' && k !== 'event')
            .map(([k, v]) => {
                try {
                    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return `${k}=${v}`;
                    return `${k}=${JSON.stringify(v)}`;
                } catch {
                    return `${k}=[unserializable]`;
                }
            });

        const metaStr = metaParts.length ? ' ' + metaParts.join(' ') : '';
        return `${record.timestamp} ${levelColor}${level.toUpperCase()}${colors.reset} ${record.event}${metaStr}`;
    } catch {
        return output;
    }
};

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
        if (level === 'info') console.log(functionTTYFriendly(output));
        else if (level === 'warn') console.warn(functionTTYFriendly(output));
        else console.error(functionTTYFriendly(output));
    } catch {
        // Logging must not change application control flow.
    }
};

export const logger = {
    info: (event: string, metadata?: LogMetadata): void => write('info', event, metadata),
    warn: (event: string, metadata?: LogMetadata): void => write('warn', event, metadata),
    error: (event: string, metadata?: LogMetadata): void => write('error', event, metadata),
};
