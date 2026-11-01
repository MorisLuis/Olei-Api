import { once } from 'node:events';
import { resolve } from 'node:path';
import { Worker as ThreadWorker } from 'node:worker_threads';
import { z } from 'zod';


export async function createPdfThread(): Promise<ThreadWorker> {

    const thread = new ThreadWorker(
        resolve(
            process.cwd(),
            'examples/pdf-workers/reusable-worker/reusable.worker.ts'
        ),
        { execArgv: ['-r', 'ts-node/register'] }
    )

    try {
        const message = await once(thread, 'message', {
            signal: AbortSignal.timeout(5000),
        });

        z.object({ type: z.literal('ready') }).parse(message[0]);

        return thread;

    } catch (error) {
        await thread.terminate().catch(() => undefined);
        throw error;
    }

}


const resultSchema = z.object({
    rows: z.number().int().positive(),
    renderMs: z.number().nonnegative(),
    pdfBytes: z.number().int().positive(),
});

export async function renderPdf(
    thread: ThreadWorker,
    rowCount: number
): Promise<z.infer<typeof resultSchema>> {
    
    const response = once(thread, 'message', {
        signal: AbortSignal.timeout(60_000),
    });

    thread.postMessage(rowCount);

    const message = await response;
    const payload: unknown = message[0];

    const failure = z.object({ error: z.string() }).safeParse(payload);

    if (failure.success) {
        throw new Error(failure.data.error);
    }

    return resultSchema.parse(payload);
}