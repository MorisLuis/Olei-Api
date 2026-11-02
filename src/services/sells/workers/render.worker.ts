import { parentPort, threadId } from 'node:worker_threads';
import { logger } from '../../../helpers/logger';
import { createSellsReportPdf } from '../utils/createSellsReportPdf';
import { sellReportWorkerRequestSchema } from './schemas';
import type {
    SellReportWorkerRequest,
    SellReportWorkerResponse,
} from './types';

const port = parentPort;

if (!port) {
    throw new Error('Sale report worker must run in a Worker Thread');
}

const send = (message: SellReportWorkerResponse): void => {
    port.postMessage(message);
};

let busy = false;

async function render(request: SellReportWorkerRequest): Promise<void> {
    logger.info('pdf.worker.started', { jobId: request.id, threadId });

    try {
        const { pdfBuffer, fileName } = await createSellsReportPdf(request.input);

        logger.info('pdf.worker.finished', { jobId: request.id, threadId });

        send({
            type: 'success',
            id: request.id,
            pdfBytes: pdfBuffer,
            fileName,
        });
    
    } catch {
        send({
            type: 'error',
            id: request.id,
            message: 'Unable to generate sale report PDF',
        });
    } finally {
        busy = false;
    }
}

port.on('message', (message: unknown) => {
    const request = sellReportWorkerRequestSchema.parse(message);

    if (busy) {
        throw new Error('Sale report worker received overlapping requests');
    }

    busy = true;

    render(request).catch(() => {
        throw new Error('Sale report worker could not deliver its response');
    });
});

send({ type: 'ready' });
