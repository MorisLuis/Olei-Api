/* global __dirname, __filename */
import { join } from 'node:path';
import { Buffer } from 'node:buffer';
import { setTimeout, clearTimeout } from 'node:timers';
import { Worker } from 'node:worker_threads';

import type { SellReportServiceResponse } from '../types';
import { sellReportWorkerResponseSchema } from './schemas';
import type { SellReportWorkerRequest } from './types';

type RenderResult = Pick<
    SellReportServiceResponse,
    'pdfBuffer' | 'fileName'
>;

export interface PendingRender {
    request: SellReportWorkerRequest;
    resolve: (result: RenderResult) => void;
    reject: (error: Error) => void;
}

export class SellReportWorkerManager {
    private worker: Worker | null = null;
    private pending: PendingRender[] = [];
    private active: PendingRender | null = null;
    private nextId = 1;
    private closing = false;
    private starting: Promise<void> | null = null;
    private stopping: Promise<void> | null = null;
    private resolveIdle: (() => void) | null = null;

    render(input: SellReportWorkerRequest['input']): Promise<RenderResult> {
        if (this.closing) {
            return Promise.reject(new Error('Sale report worker manager is closing'));
        }

        return new Promise<RenderResult>((resolve, reject) => {
            this.pending.push({
                request: {
                    id: this.nextId++,
                    input,
                },
                resolve,
                reject,
            });
            this.runNext();
        });
    }

    async start(): Promise<void> {
        if (this.closing) {
            throw new Error('Sale report worker manager is closing');
        }

        if (this.starting) return this.starting;
        if (this.worker) return;

        const sourceFile = join(__dirname, 'render.worker.ts');
        const isTypeScript = __filename.endsWith('.ts');
        const worker = new Worker(
            isTypeScript ? sourceFile : join(__dirname, 'render.worker.js'),
            { execArgv: isTypeScript ? ['-r', 'ts-node/register'] : [] }
        );
        this.worker = worker;

        this.starting = new Promise<void>((resolve, reject) => {

            const fail = (error: Error): void => {
                clearTimeout(timeout);
                worker.off('message', onReady);

                if (this.worker === worker) {
                    this.worker = null;
                    this.rejectAll(error);
                }

                reject(error);
            };

            const onReady = (message: unknown): void => {
                const response = sellReportWorkerResponseSchema.safeParse(message);

                if (!response.success || response.data.type !== 'ready') {
                    fail(new Error('Sale report worker sent an invalid ready message'));
                    void worker.terminate().catch(() => undefined);
                    return;
                }

                clearTimeout(timeout);
                worker.off('message', onReady);
                worker.on('message', (message: unknown) => {
                    if (this.worker === worker) this.handleResponse(message);
                });
                resolve();
            };

            const timeout = setTimeout(() => {
                fail(new Error('Sale report worker startup timed out'));
                void worker.terminate().catch(() => undefined);
            }, 10_000);

            worker.on('message', onReady);
            worker.on('error', fail);
            worker.once('exit', () => {
                fail(new Error('Sale report worker exited'));
            });

        });

        try {
            await this.starting;
        } finally {
            this.starting = null;
        }

        this.runNext();
    }

    close(): Promise<void> {
        if (this.stopping) return this.stopping;

        this.closing = true;
        this.stopping = (async () => {
            // Startup failures already reject accepted jobs through rejectAll().
            await this.starting?.catch(() => undefined);

            if (!this.worker) {
                this.rejectAll(new Error('Sale report worker is not running'));
                return;
            }

            if (this.active || this.pending.length > 0) {
                await new Promise<void>((resolve) => {
                    this.resolveIdle = resolve;
                    this.runNext();
                });
            }

            const worker = this.worker;
            this.worker = null;
            if (worker) await worker.terminate();
        })();

        return this.stopping;
    }

    private handleResponse(message: unknown): void {
        const response = sellReportWorkerResponseSchema.safeParse(message);
        const job = this.active;

        if (
            !response.success ||
            response.data.type === 'ready' ||
            !job ||
            response.data.id !== job.request.id
        ) {
            const worker = this.worker;
            this.worker = null;
            this.rejectAll(new Error('Sale report worker sent an invalid job response'));
            if (worker) void worker.terminate().catch(() => undefined);
            return;
        }

        this.active = null;

        if (response.data.type === 'success') {
            job.resolve({
                pdfBuffer: Buffer.from(response.data.pdfBytes),
                fileName: response.data.fileName,
            });
        } else {
            job.reject(new Error(response.data.message));
        }

        this.runNext();
    }

    private runNext(): void {
        if (!this.worker || this.starting || this.active) {
            return;
        }

        const job = this.pending.shift();
        if (!job) {
            this.resolveIdle?.();
            this.resolveIdle = null;
            return;
        }

        const worker = this.worker;
        this.active = job;

        try {
            worker.postMessage(job.request);
        } catch {
            this.worker = null;
            this.rejectAll(new Error('Unable to send sale report job to worker'));
            void worker.terminate().catch(() => undefined);
        }
    }

    private rejectAll(error: Error): void {
        const active = this.active;
        const waiting = this.pending.splice(0);

        this.active = null;

        active?.reject(error);

        for (const job of waiting) {
            job.reject(error);
        }

        this.resolveIdle?.();
        this.resolveIdle = null;
    }
}
