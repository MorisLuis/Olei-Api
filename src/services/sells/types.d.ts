import type { UserWebSessionInterface } from "../../interface/user";
import type { Buffer } from 'buffer';

export interface SellReportParameters {
    Id_Almacen: number;
    TipoDoc: string;
    Serie: string;
    Folio: string;
    Id_Cliente: number;
    session: UserWebSessionInterface,
}

export interface SellReportServiceResponse {
    pdfBuffer: Buffer;
    blob: string;
    fileName: string;
    mimeType: 'application/pdf';
}

