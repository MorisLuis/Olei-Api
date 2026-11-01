import { once } from 'node:events';
import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { Worker } from 'node:worker_threads';
import { z } from 'zod';
import { LocalQueue } from '../local-queue/localQueue';

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

        const queue = new LocalQueue(async job => {
            const response = once(worker, 'message', {
                signal: AbortSignal.timeout(60_000),
            });

            worker.postMessage(job.rowCount);

            const message = await response;
            const payload: unknown = message[0];
            const failure = z.object({ error: z.string() }).safeParse(payload);

            if (failure.success) {
                throw new Error(failure.data.error);
            }

            const result = resultSchema.parse(payload);
            console.log({
                job: job.id,
                threadId: worker.threadId,
                renderMs: result.renderMs,
            });
        });

        queue.add({ id: 1, rowCount: 5000 });
        queue.add({ id: 2, rowCount: 100 }); 
        queue.add({ id: 3, rowCount: 5000 });

        await queue.onIdle();
    } finally {
        await worker.terminate();
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
