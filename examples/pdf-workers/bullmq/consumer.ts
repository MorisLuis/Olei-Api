import { Worker as QueueWorker } from 'bullmq';
import { createPdfThread, renderPdf } from './pdf-thread';

async function main(): Promise<void> {

    const thread = await createPdfThread();
    console.log(`PDF thread ${thread.threadId} is ready`);

    const worker = new QueueWorker<{ rowCount: number }>(
        'pdf-learning',
        async job => {
            console.log(`Started job ${job.id}, attempt ${job.attemptsMade + 1}`);

            const result = await renderPdf(thread, job.data.rowCount);

            console.log({
                jobId: job.id,
                threadId: thread.threadId,
                ...result,
            });

            return result;
        },
        {
            connection: {
                host: '127.0.0.1',
                port: 6379,
            },
            concurrency: 1,
        }
    )

    worker.on('completed', job => {
        console.log(`Completed job ${job.id}`);
    });

    worker.on('failed', (job, error) => {
        console.error(`Failed job ${job?.id}:`, error.message);
    });

    worker.on('error', error => {
        console.error('Worker error:', error.message);
    });

    process.once('SIGINT', () => {
        worker.close()
            .finally(() => thread.terminate())
            .catch(error => {
                console.error(error);
                process.exitCode = 1;
            });
    });
}


main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});