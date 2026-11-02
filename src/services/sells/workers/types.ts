import type { sellsReportPdfParams } from '../utils/types';

export interface SellReportWorkerRequest {
    id: number;
    input: sellsReportPdfParams;
}

export type SellReportWorkerResponse =
    | {
        type: 'ready';
    }
    | {
        type: 'success';
        id: number;
        pdfBytes: Uint8Array;
        fileName: string;
    }
    | {
        type: 'error';
        id: number;
        message: string;
    };
