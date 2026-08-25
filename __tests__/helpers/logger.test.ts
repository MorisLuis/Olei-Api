import { logger } from '../../src/helpers/logger';

describe('structured logger', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('writes structured informational events to stdout', () => {
        const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);

        logger.info('server.started', { port: 5001 });

        expect(log).toHaveBeenCalledTimes(1);
        const record = JSON.parse(String(log.mock.calls[0][0])) as Record<string, unknown>;
        expect(record).toEqual(expect.objectContaining({
            level: 'info',
            event: 'server.started',
            port: 5001,
        }));
        expect(new Date(String(record.timestamp)).toISOString()).toBe(record.timestamp);
    });

    it('writes warnings and failures to stderr streams', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
        const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);

        logger.warn('rate_limit.evaluation_failed');
        logger.error('application.startup_failed');

        expect(JSON.parse(String(warn.mock.calls[0][0]))).toEqual(expect.objectContaining({
            level: 'warn',
            event: 'rate_limit.evaluation_failed',
        }));
        expect(JSON.parse(String(error.mock.calls[0][0]))).toEqual(expect.objectContaining({
            level: 'error',
            event: 'application.startup_failed',
        }));
    });

    it('omits metadata keys outside the explicit allowlist', () => {
        const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
        const unsafeMetadata = {
            port: 5001,
            password: 'must-not-appear',
            event: 'overridden',
        } as unknown as Parameters<typeof logger.info>[1];

        logger.info('server.started', unsafeMetadata);

        const output = String(log.mock.calls[0][0]);
        expect(output).not.toContain('password');
        expect(output).not.toContain('must-not-appear');
        expect(JSON.parse(output)).toEqual(expect.objectContaining({
            event: 'server.started',
            port: 5001,
        }));
    });

    it('uses a fixed fallback for metadata that cannot be serialized', () => {
        const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
        const circular: { self?: unknown } = {};
        circular.self = circular;

        logger.info('unsafe.event', { context: circular } as unknown as Parameters<typeof logger.info>[1]);

        expect(JSON.parse(String(log.mock.calls[0][0]))).toEqual(expect.objectContaining({
            level: 'error',
            event: 'logger.serialization_failed',
        }));
    });

    it('does not throw when the output stream fails', () => {
        jest.spyOn(console, 'error').mockImplementation(() => {
            throw new Error('stream unavailable');
        });

        expect(() => logger.error('application.startup_failed')).not.toThrow();
    });
});
