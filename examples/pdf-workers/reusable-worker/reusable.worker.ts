import { parentPort } from 'node:worker_threads';
import { performance } from 'node:perf_hooks';
import { z } from 'zod';
import { createSellsReportPdf } from '../../../src/services/sells/utils/createSellsReportPdf';
import { createReportFixture } from '../reportFixture';

async function main(input: unknown): Promise<void> {
    if (!parentPort) {
        throw new Error('Run this file as a Worker Thread');
    }

    const rowCount = z.number().int().min(1).max(100000).parse(input);
    const fixture = createReportFixture(rowCount);

    const started = performance.now();
    const report = await createSellsReportPdf(fixture);

    parentPort.postMessage({
        rows: rowCount,
        renderMs: Math.round(performance.now() - started),
        pdfBytes: report.pdfBuffer.length,
    });
}

const port = parentPort;

if (!port) {
    throw new Error('Run this file as a Worker Thread');
}

let busy = false;

port.on('message', (input: unknown) => {
    if (busy) {
        port.postMessage({ error: 'Worker is busy' });
        return;
    }

    busy = true;

    main(input)
        .catch(error => {
            port.postMessage({
                error: error instanceof Error
                    ? error.message
                    : 'PDF rendering failed',
            });
        })
        .finally(() => {
            busy = false;
        });
});

port.postMessage({ type: 'ready' });