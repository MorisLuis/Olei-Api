import { Queue } from 'bullmq';


async function main(): Promise<void> {

    const queue = new Queue<{ rowCount: number }>('pdf-learning', {
        connection: {
            host: '127.0.0.1',
            port: 6379,
            maxRetriesPerRequest: 1,
        },
    })

    queue.on('error', error => {
        console.error('Queue connection error:', error.message);
    })

    try {
        const job = await queue.add(
            'render-pdf',
            { rowCount: 50000 },
            {
                jobId: 'report-demo-010',
                attempts: 3,
                backoff: {
                    type: 'fixed',
                    delay: 1000,
                },
            }
        );

        console.log({
            jobId: job.id,
            state: await job.getState(),
        })
    } finally {
        await queue.close();
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});