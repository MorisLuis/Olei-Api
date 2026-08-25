import { clearTimeout as clearNodeTimeout, setTimeout as setNodeTimeout } from 'node:timers';
import type { ApplicationServer } from '../types';

interface ShutdownDependencies {
    scheduleTimeout: typeof scheduleTimeout;
    cancelTimeout: typeof cancelTimeout;
    setExitCode: typeof setExitCode;
    forceExit: typeof forceExit;
}

interface SignalRegistrar {
    once: typeof registerSignal;
}

export type Shutdown = () => Promise<void>;

const setExitCode = (exitCode: number): void => { process.exitCode = exitCode };
const forceExit = (exitCode: number): never => process.exit(exitCode);
const scheduleTimeout = ( callback: () => void, timeoutMs: number ): ReturnType<typeof setNodeTimeout> => setNodeTimeout(callback, timeoutMs);
const cancelTimeout = (timeout: ReturnType<typeof setNodeTimeout>): void => clearNodeTimeout(timeout);

const defaultDependencies: ShutdownDependencies = {
    scheduleTimeout,
    cancelTimeout,
    setExitCode,
    forceExit,
};

/**
 * @description Creates a shutdown function that gracefully stops the application server within a specified timeout.
 * if the shutdown process exceeds the timeout, the application will forcefully exit with a non-zero exit code.
 * 
 * @param application The application server instance to be shut down.
 * @param timeoutMs The maximum time in milliseconds to wait for the shutdown to complete before forcing exit.
 * @param dependencies Optional dependencies for scheduling timeouts, setting exit codes, and forcing exit. Defaults to the standard Node.js implementations.
 * @returns A Shutdown function that returns a promise resolving when the shutdown is complete or rejecting if it fails or times out.
 */

export const createShutdown = (
    application: ApplicationServer,
    timeoutMs: number,
    dependencies: ShutdownDependencies = defaultDependencies,
): Shutdown => {

    let shutdownPromise: Promise<void> | null = null;

    return () => {
        if (shutdownPromise) return shutdownPromise;

        shutdownPromise = new Promise<void>((resolve, reject) => {

            const timeout = dependencies.scheduleTimeout(() => {
                dependencies.setExitCode(1);
                reject(new Error('Application shutdown timed out'));
                dependencies.forceExit(1);
            }, timeoutMs);

            timeout.unref();

            void application.stop().then(() => {
                dependencies.cancelTimeout(timeout);
                dependencies.setExitCode(0);
                resolve();
            }).catch(() => {
                dependencies.cancelTimeout(timeout);
                dependencies.setExitCode(1);
                reject(new Error('Application shutdown failed'));
            });
        });

        return shutdownPromise;
    };
};

const registerSignal = (signal: 'SIGINT' | 'SIGTERM', listener: () => void): unknown => process.once(signal, listener);
const defaultSignalRegistrar: SignalRegistrar = { once: registerSignal };

export const registerShutdownSignals = (
    shutdown: Shutdown,
    registrar: SignalRegistrar = defaultSignalRegistrar,
): void => {

    const handleSignal = (): void => {
        void shutdown().catch(() => undefined);
    };

    registrar.once('SIGINT', handleSignal);
    registrar.once('SIGTERM', handleSignal);
};
