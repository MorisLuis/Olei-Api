import { Worker } from 'node:worker_threads';
import { resolve } from 'node:path';

const worker = new Worker(
    resolve(process.cwd(), 'examples/pdf-workers/worker/render.worker.ts'),
    {
        workerData: 5000,
        execArgv: ['-r', 'ts-node/register'],
    }
);

worker.once('message', (result: unknown) => {
    console.log('Worker result:', result);
});

worker.once('error', error => {
    console.error('Worker failed:', error);
    process.exitCode = 1;
});

worker.once('exit', code => {
    console.log('Worker exit code:', code);
    if (code !== 0) process.exitCode = 1;
});
