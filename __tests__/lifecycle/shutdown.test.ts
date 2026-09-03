import { clearTimeout, setTimeout } from 'node:timers';
import { createShutdown, registerShutdownSignals } from '../../src/lifecycle/shutdown';
import type { ApplicationServer } from '../../src/types';

const createDependencies = () => ({
    scheduleTimeout: jest.fn((callback: () => void, timeoutMs: number) => setTimeout(callback, timeoutMs)),
    cancelTimeout: jest.fn((timeout: ReturnType<typeof setTimeout>) => clearTimeout(timeout)),
    setExitCode: jest.fn(),
    forceExit: jest.fn(((): never => undefined as never)),
});

describe('application shutdown coordinator', () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    it('sets exit code zero after successful cleanup', async () => {
        const application : ApplicationServer = { stop: jest.fn(() => Promise.resolve()), start: jest.fn(() => Promise.resolve()) };
        const dependencies = createDependencies();
        const shutdown = createShutdown(application, 25_000, dependencies);

        await shutdown();

        expect(application.stop).toHaveBeenCalledTimes(1);
        expect(dependencies.setExitCode).toHaveBeenLastCalledWith(0);
        expect(dependencies.forceExit).not.toHaveBeenCalled();
    });

    it('sets exit code one when cleanup fails', async () => {
        const application : ApplicationServer = { stop: jest.fn().mockRejectedValue(new Error('cleanup failed')), start: jest.fn(() => Promise.resolve()) };
        const dependencies = createDependencies();
        const shutdown = createShutdown(application, 25_000, dependencies);

        await expect(shutdown()).rejects.toThrow('Application shutdown failed');

        expect(dependencies.setExitCode).toHaveBeenLastCalledWith(1);
        expect(dependencies.forceExit).not.toHaveBeenCalled();
    });

    it('forces exit code one when cleanup exceeds the deadline', async () => {
        const application : ApplicationServer = { stop: jest.fn(() => new Promise<void>(() => undefined)), start: jest.fn(() => Promise.resolve()) };
        const dependencies = createDependencies();
        let runTimeout!: () => void;
        dependencies.scheduleTimeout = jest.fn((callback: () => void, timeoutMs: number) => {
            void timeoutMs;
            runTimeout = callback;
            return { unref: jest.fn() } as unknown as ReturnType<typeof setTimeout>;
        });
        const shutdown = createShutdown(application, 25_000, dependencies);

        const result = shutdown();
        runTimeout();

        await expect(result).rejects.toThrow('Application shutdown timed out');
        expect(dependencies.setExitCode).toHaveBeenLastCalledWith(1);
        expect(dependencies.forceExit).toHaveBeenCalledWith(1);
    });

    it('shares one cleanup operation across both registered signals', async () => {
        let finishStop!: () => void;
        const application = {
            stop: jest.fn(() => new Promise<void>(resolve => {
                finishStop = resolve;
            })),
            start: jest.fn(() => Promise.resolve()),
        };
        const dependencies = createDependencies();
        const shutdown = createShutdown(application, 25_000, dependencies);
        const listeners = new Map<string, () => void>();
        const registrar = {
            once: jest.fn((signal: 'SIGINT' | 'SIGTERM', listener: () => void) => {
                listeners.set(signal, listener);
            }),
        };
        registerShutdownSignals(shutdown, registrar);

        listeners.get('SIGINT')?.();
        listeners.get('SIGTERM')?.();

        expect(application.stop).toHaveBeenCalledTimes(1);
        finishStop();
        await shutdown();
        expect(dependencies.setExitCode).toHaveBeenLastCalledWith(0);
    });
});
