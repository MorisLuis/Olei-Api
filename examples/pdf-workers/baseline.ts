import { monitorEventLoopDelay, performance } from 'node:perf_hooks';
import { setTimeout as delay } from 'node:timers/promises';
import { createSellsReportPdf } from '../../src/services/sells/utils/createSellsReportPdf';
import { createReportFixture } from './reportFixture';

async function measure(rowCount: number): Promise<void> {
    const fixture = createReportFixture(rowCount);
    const monitor = monitorEventLoopDelay({ resolution: 10 });

    monitor.enable();

    try {
        await delay(30);
        monitor.reset();

        const started = performance.now();
        const report = await createSellsReportPdf(fixture);
        const renderMs = performance.now() - started;

        await delay(30);

        console.log({
            rows: rowCount,
            renderMs: Math.round(renderMs),
            maxEventLoopDelayMs: Math.round(monitor.max / 1_000_000),
            pdfBytes: report.pdfBuffer.length,
        });

    } finally {
        monitor.disable();
    }
}

async function main(): Promise<void> {
    await measure(100);
    await measure(5000);
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
