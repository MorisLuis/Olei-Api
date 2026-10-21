import type { Buffer } from 'node:buffer';
import { Readable, Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { setImmediate } from 'node:timers';

import { generateCsvChunks } from '../../../src/services/ai/csv';

// Opt in: this is a learning experiment, not a portable memory regression assertion.
const experiment = process.env.RUN_CSV_MEMORY_EXPERIMENT === '1' ? describe : describe.skip;

experiment('CSV memory experiment', () => {

    it.each([10_000, 1_000_000])('streams %i generated rows without retaining output', async totalRows => {
        const baseline = process.memoryUsage();
        const peak = { ...baseline };
        let produced = 0;
        let deliveredBytes = 0;
        let writes = 0;
        const payload = 'x'.repeat(256);
        const started = Date.now();

        function sampleMemory(): void {
            const current = process.memoryUsage();
            peak.rss = Math.max(peak.rss, current.rss);
            peak.heapUsed = Math.max(peak.heapUsed, current.heapUsed);
            peak.external = Math.max(peak.external, current.external);
            peak.arrayBuffers = Math.max(peak.arrayBuffers, current.arrayBuffers);
        }

        console.log(`Streaming ${totalRows} rows of ${payload.length} bytes each...`);

        async function* rows() {
            for (let id = 0; id < totalRows; id++) {
                produced++;
                if (produced % 10_000 === 0) {
                    await new Promise<void>(resolve => setImmediate(resolve));
                    sampleMemory();
                }
                yield { id, description: `Product ${id}: ${payload}` };
            }
        }

        const destination = new Writable({
            write(chunk: Buffer, _encoding, callback) {
                // Count output without saving it. Periodically allow other event-loop work.
                deliveredBytes += chunk.length;
                writes++;
                if (writes % 1000 === 0) setImmediate(callback);
                else callback();
            },
        });

        // Substitute generated rows for MSSQL, keeping production's object-mode source
        // and async-generator CSV stage. This does not measure SQL or network memory.
        const source = Readable.from(rows(), { objectMode: true, highWaterMark: 16 });
        await pipeline(
            source,
            async function* (input: AsyncIterable<Record<string, unknown>>) {
                yield* generateCsvChunks(input);
            },
            destination
        );
        sampleMemory();

        const mib = (bytes: number): number => Number((bytes / 1024 / 1024).toFixed(2));

        console.log({
            rows: totalRows,
            outputMiB: mib(deliveredBytes),
            elapsedMs: Date.now() - started,
            baselineMiB: {
                rss: mib(baseline.rss), heap: mib(baseline.heapUsed),
                external: mib(baseline.external), arrayBuffers: mib(baseline.arrayBuffers),
            },
            sampledPeakMiB: {
                rss: mib(peak.rss), heap: mib(peak.heapUsed),
                external: mib(peak.external), arrayBuffers: mib(peak.arrayBuffers),
            },
        });

        expect(produced).toBe(totalRows);
        expect(destination.writableFinished).toBe(true);
        expect(deliveredBytes).toBeGreaterThan(totalRows * payload.length);
    }, 60_000);
});
