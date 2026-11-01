import { Worker } from 'node:worker_threads';
import { once } from 'node:events';
import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { z } from 'zod';

const resultSchema = z.object({
    rows: z.number(),
    renderMs: z.number(),
    pdfBytes: z.number(),
});

async function main(): Promise<void> {
    const started = performance.now();
    const worker = new Worker(
        resolve(process.cwd(), 'examples/pdf-workers/reusable-worker/reusable.worker.ts'),
        { execArgv: ['-r', 'ts-node/register'] }
    );


    try {
        const ready = await once(worker, 'message', {
            signal: AbortSignal.timeout(60_000),
        });
        z.object({ type: z.literal('ready') }).parse(ready[0]);
        console.log('One-time startup ms:', Math.round(performance.now() - started));

        for (let job = 1; job <= 3; job++) {
            const response = once(worker, 'message', {
                signal: AbortSignal.timeout(60_000),
            });

            const jobStarted = performance.now();
            worker.postMessage(5000);

            const message = await response;
            const result = resultSchema.parse(message[0]);

            console.log({
                job,
                threadId: worker.threadId,
                renderMs: result.renderMs,
                elapsedMs: Math.round(performance.now() - jobStarted),
            });
        }

    } finally {
        await worker.terminate();
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});