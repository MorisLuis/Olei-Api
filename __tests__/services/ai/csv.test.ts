import { Buffer } from 'node:buffer';
import { Readable, Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { setImmediate } from 'node:timers';
import { formatCsvField, formatCsvRow, generateCsvChunks } from '../../../src/services/ai/csv';

async function collectCsv(chunks: AsyncIterable<string>): Promise<string> {
    let output = '';
    for await (const chunk of chunks) {
        output += chunk;
    }
    return output;
}

describe('CSV export', () => {

    it.each([
        [null, '""'],
        [undefined, '""'],
        [42, '"42"'],
        [false, '"false"'],
        ['Coffee, large', '"Coffee, large"'],
        ['Called "Special"', '"Called ""Special"""'],
        ['First\nSecond', '"First\nSecond"'],
        ['México', '"México"'],
    ])('formats field %p', (value, expected) => {
        expect(formatCsvField(value)).toBe(expected);
    });

    it('uses header order and leaves missing fields empty', () => {
        expect(formatCsvRow({ price: 25, name: 'Coffee' }, ['name', 'missing', 'price']))
            .toBe('"Coffee","","25"');
    });

    it('produces a complete CSV with escaped headers and values', async () => {
        const rows = [
            { price: 25, description: 'Called "Special"', name: 'Coffee, large' },
            { price: null, description: 'First line\nSecond line', name: 'Café' },
        ];
        const output = await collectCsv(generateCsvChunks(rows, ['name', 'description', 'price']));

        expect(output).toBe(
            '"name","description","price"\n' +
            '"Coffee, large","Called ""Special""","25"\n' +
            '"Café","First line\nSecond line",""'
        );
        expect(await collectCsv(generateCsvChunks([], ['A"B']))).toBe('"A""B"');
    });

    it('handles an empty result with or without known headers', async () => {
        expect(await collectCsv(generateCsvChunks([], []))).toBe('');
        expect(await collectCsv(generateCsvChunks([], ['name']))).toBe('"name"');
    });

    it('does not request rows until the consumer advances past the header', async () => {
        const requested: number[] = [];
        function* rows() {
            requested.push(1);
            yield { name: 'First' };
            requested.push(2);
            yield { name: 'Second' };
        }
        const iterator = generateCsvChunks(rows(), ['name'])[Symbol.asyncIterator]();

        expect(requested).toEqual([]);
        expect((await iterator.next()).value).toBe('"name"');
        expect(requested).toEqual([]);
        expect((await iterator.next()).value).toBe('\n"First"');
        expect(requested).toEqual([1]);
        expect((await iterator.next()).value).toBe('\n"Second"');
        expect(requested).toEqual([1, 2]);
    });

    it('accepts rows supplied asynchronously', async () => {
        async function* rows() {
            await new Promise<void>(resolve => setImmediate(resolve));
            yield { name: 'Café' };
            await new Promise<void>(resolve => setImmediate(resolve));
            yield { name: 'Second' };
        }

        expect(await collectCsv(generateCsvChunks(rows(), ['name'])))
            .toBe('"name"\n"Café"\n"Second"');
    });

    it('infers headers from the first asynchronous row without dropping it', async () => {
        async function* rows() {
            await new Promise<void>(resolve => setImmediate(resolve));
            yield { name: 'First', price: 25 };
            yield { price: 30, name: 'Second' };
        }

        expect(await collectCsv(generateCsvChunks(rows())))
            .toBe('"name","price"\n"First","25"\n"Second","30"');
    });

    it('produces no content when there are no rows or supplied headers', async () => {
        expect(await collectCsv(generateCsvChunks([]))).toBe('');
    });

    it('keeps the first row available after yielding inferred headers and closes on early exit', async () => {
        let requested = 0;
        let closed = false;
        async function* rows() {
            try {
                await Promise.resolve();
                requested++;
                yield { name: 'First' };
                requested++;
                yield { name: 'Second' };
            } finally {
                closed = true;
            }
        }
        const iterator = generateCsvChunks(rows())[Symbol.asyncIterator]();

        expect(requested).toBe(0);
        expect((await iterator.next()).value).toBe('"name"');
        expect(requested).toBe(1);
        expect((await iterator.next()).value).toBe('\n"First"');
        expect(requested).toBe(1);
        await iterator.return?.();
        expect(closed).toBe(true);
    });

    it('propagates a source failure before the first row', async () => {
        const failure = new Error('Query failed');
        async function* rows(): AsyncGenerator<Record<string, unknown>> {
            yield await Promise.reject<Record<string, unknown>>(failure);
        }

        await expect(collectCsv(generateCsvChunks(rows()))).rejects.toBe(failure);
    });

    it('streams CSV without requiring explicit headers', async () => {
        const chunks: Buffer[] = [];
        const destination = new Writable({
            write(chunk: Buffer, _encoding, callback) {
                chunks.push(Buffer.from(chunk));
                callback();
            },
        });

        await pipeline(
            Readable.from([{ name: 'Café' }], { objectMode: true, highWaterMark: 16 }),
            async function* (source: AsyncIterable<Record<string, unknown>>) {
                yield* generateCsvChunks(source);
            },
            destination
        );

        expect(Buffer.concat(chunks).toString('utf8')).toBe('"name"\n"Café"');
    });

    it('delivers UTF-8 bytes and finishes the destination', async () => {
        const chunks: Buffer[] = [];
        const destination = new Writable({
            write(chunk: Buffer, _encoding, callback) {
                chunks.push(Buffer.from(chunk));
                callback();
            },
        });

        await pipeline(
            Readable.from([{ name: 'Café ☕' }], { objectMode: true, highWaterMark: 16 }),
            async function* (source: AsyncIterable<Record<string, unknown>>) {
                yield* generateCsvChunks(source);
            },
            destination
        );

        expect(Buffer.concat(chunks)).toEqual(Buffer.from('"name"\n"Café ☕"', 'utf8'));
        expect(destination.writableFinished).toBe(true);
    });

    it('limits production while the destination is blocked and resumes without losing bytes', async () => {
        const totalRows = 512;
        const value = 'x'.repeat(4096);
        let produced = 0;
        let deliveredBytes = 0;
        let releaseFirstWrite: (() => void) | undefined;
        let signalFirstWrite: () => void = () => undefined;
        const firstWrite = new Promise<void>(resolve => { signalFirstWrite = resolve; });

        function* rows() {
            for (let index = 0; index < totalRows; index++) {
                produced++;
                yield { value };
            }
        }

        const destination = new Writable({
            highWaterMark: 10,
            write(chunk: Buffer, _encoding, callback) {
                deliveredBytes += chunk.length;
                if (!releaseFirstWrite) {
                    releaseFirstWrite = () => callback();
                    signalFirstWrite();
                } else {
                    callback();
                }
            },
        });

        const completion = pipeline(
            Readable.from(rows(), { objectMode: true, highWaterMark: 16 }),
            async function* (source: AsyncIterable<Record<string, unknown>>) {
                yield* generateCsvChunks(source);
            },
            destination
        );

        await firstWrite;
        try {
            // Give the source time to fill its buffer without relying on a sleep duration.
            await new Promise<void>(resolve => setImmediate(resolve));
            expect(produced).toBeLessThan(totalRows);
            console.log('Rows produced while blocked:', produced)
            const pausedCount = produced;
            await new Promise<void>(resolve => setImmediate(resolve));
            expect(produced).toBe(pausedCount);
        } finally {
            releaseFirstWrite?.();
            await completion;
        }

        console.log('Rows produced after completion:', produced)
        expect(produced).toBe(totalRows);
        expect(deliveredBytes).toBe(Buffer.byteLength('"value"') + totalRows * (value.length + 3));
    });

    it('rejects destination failures and closes the source iterator', async () => {
        const failure = new Error('Destination failed');
        let sourceClosed = false;
        function* rows() {
            try {
                while (true) {
                    yield { name: 'x'.repeat(4096) };
                }
            } finally {
                sourceClosed = true;
            }
        }
        const source = Readable.from(rows(), { objectMode: true, highWaterMark: 16 });
        const destination = new Writable({
            write(_chunk, _encoding, callback) {
                callback(failure);
            },
        });

        await expect(pipeline(
            source,
            async function* (input: AsyncIterable<Record<string, unknown>>) {
                yield* generateCsvChunks(input);
            },
            destination
        )).rejects.toBe(failure);
        expect(source.destroyed).toBe(true);
        expect(sourceClosed).toBe(true);
    });
});
