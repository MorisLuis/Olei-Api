import { parentPort, workerData } from 'node:worker_threads';
import { performance } from 'node:perf_hooks';
import { z } from 'zod';
import { createSellsReportPdf } from '../../../src/services/sells/utils/createSellsReportPdf';
import { createReportFixture } from '../reportFixture';

async function main(): Promise<void> {
    if (!parentPort) {
        throw new Error('Run this file as a Worker Thread');
    }

    const rowCount = z.number().int().min(1).max(5000).parse(workerData);
    const fixture = createReportFixture(rowCount);

    const started = performance.now();
    const report = await createSellsReportPdf(fixture);

    parentPort.postMessage({
        rows: rowCount,
        renderMs: Math.round(performance.now() - started),
        pdfBytes: report.pdfBuffer.length,
    });
}

main().catch(error => {
    throw error;
});
