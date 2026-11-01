import { performance } from 'node:perf_hooks';
import { resolve } from 'node:path';
import { clearInterval, clearTimeout, setInterval, setTimeout } from 'node:timers';
import { setTimeout as delay } from 'node:timers/promises';
import { Worker } from 'node:worker_threads';
import { z } from 'zod';
import { createSellsReportPdf } from '../../src/services/sells/utils/createSellsReportPdf';
import { createReportFixture } from './reportFixture';

const reportSchema = z.object({
    rows: z.number().int().positive(),
    renderMs: z.number().nonnegative(),
    pdfBytes: z.number().int().positive(),
});
type Report = z.infer<typeof reportSchema>;
type Mode = 'Main thread' | 'Worker thread';

interface Measurement {
    mode: Mode;
    totalMs: number;
    renderMs: number;
    otherMs: number;
    worstTimerLateMs: number;
    timerTicks: number;
}

function runWorker(rowCount: number): Promise<Report> {
    return new Promise((resolveResult, reject) => {
        const worker = new Worker(resolve(process.cwd(), 'examples/pdf-workers/worker/render.worker.ts'), {
            workerData: rowCount,
            execArgv: ['-r', 'ts-node/register'],
        });
        let report: Report | undefined;
        const timeout = setTimeout(() => {
            reject(new Error('Worker exceeded 60 seconds'));
            worker.terminate().catch(() => undefined);
        }, 60_000);

        worker.once('message', (message: unknown) => {
            const parsed = reportSchema.safeParse(message);
            if (!parsed.success || parsed.data.rows !== rowCount) {
                reject(new Error('Worker returned invalid measurements'));
                worker.terminate().catch(() => undefined);
                return;
            }
            report = parsed.data;
        });
        worker.once('error', reject);
        worker.once('exit', code => {
            clearTimeout(timeout);
            if (code !== 0 || !report) {
                reject(new Error(`Worker exited with code ${code} without a valid result`));
                return;
            }
            resolveResult(report);
        });
    });
}

async function measure(mode: Mode, rowCount: number): Promise<Measurement> {
    const intervalMs = 10;
    let lastTick = performance.now();
    let worstTimerLateMs = 0;
    let timerTicks = 0;
    const heartbeat = setInterval(() => {
        const now = performance.now();
        worstTimerLateMs = Math.max(worstTimerLateMs, now - lastTick - intervalMs);
        lastTick = now;
        timerTicks++;
    }, intervalMs);

    try {
        // Let the heartbeat start, then measure delays while the report is processed.
        await delay(30);
        worstTimerLateMs = 0;
        timerTicks = 0;
        lastTick = performance.now();
        const started = performance.now();
        let report: Report;

        if (mode === 'Worker thread') {
            report = await runWorker(rowCount);
        } else {
            const fixture = createReportFixture(rowCount);
            const renderStarted = performance.now();
            const pdf = await createSellsReportPdf(fixture);
            report = {
                rows: rowCount,
                renderMs: performance.now() - renderStarted,
                pdfBytes: pdf.pdfBuffer.length,
            };
        }

        const totalMs = performance.now() - started;
        // A delayed heartbeat must get a turn before it is stopped.
        await delay(30);

        return {
            mode,
            totalMs: Math.round(totalMs),
            renderMs: Math.round(report.renderMs),
            otherMs: Math.round(Math.max(0, totalMs - report.renderMs)),
            worstTimerLateMs: Math.round(Math.max(0, worstTimerLateMs)),
            timerTicks,
        };
    } finally {
        clearInterval(heartbeat);
    }
}

function median(values: number[]): number {
    const sorted = [...values].sort((left, right) => left - right);
    return sorted[Math.floor(sorted.length / 2)];
}

async function main(): Promise<void> {
    const rowCount = z.coerce.number().int().min(1).max(5000).parse(process.argv[2] ?? 5000);
    const measurements: Measurement[] = [];
    console.log(`Rendering the same ${rowCount}-row report: 3 trials per mode.`);
    console.log('A main-thread timer tries to run every 10 ms. Lower timer lateness means better responsiveness.');

    for (let trial = 0; trial < 3; trial++) {
        const order: Mode[] = trial % 2 === 0
            ? ['Main thread', 'Worker thread'] : ['Worker thread', 'Main thread'];
        for (const mode of order) {
            const result = await measure(mode, rowCount);
            measurements.push(result);
            console.log(`Trial ${trial + 1}:`, result);
        }
    }

    const summary = (['Main thread', 'Worker thread'] satisfies Mode[]).map(mode => {
        const results = measurements.filter(result => result.mode === mode);
        return {
            mode,
            totalMs: median(results.map(result => result.totalMs)),
            renderMs: median(results.map(result => result.renderMs)),
            otherMs: median(results.map(result => result.otherMs)),
            worstTimerLateMs: median(results.map(result => result.worstTimerLateMs)),
        };
    });
    console.log('\nMedian results (including fresh worker startup and TypeScript loading):');
    console.table(summary);
    console.log('otherMs includes startup, module loading, fixture creation, messaging, and exit; it is not pure startup time.');

    const [direct, worker] = summary;
    console.log(`\nREASON TO CONSIDER A WORKER: main-thread timer lateness was ${direct.worstTimerLateMs} ms without a worker versus ${worker.worstTimerLateMs} ms with a worker.`);
    if (worker.worstTimerLateMs < direct.worstTimerLateMs) {
        console.log('This run supports using a worker to keep the API thread responsive during PDF rendering.');
    } else {
        console.log('This run does not demonstrate a responsiveness benefit. Repeat under representative conditions before choosing workers.');
    }
    console.log(`TRADE-OFF: total completion time was ${direct.totalMs} ms without a worker versus ${worker.totalMs} ms with a fresh worker.`);
    console.log('This is a local timer experiment, not an HTTP load test. A reusable worker pool would amortize startup cost.');
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
