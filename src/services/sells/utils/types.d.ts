export interface sellsReportPdfParams {
    sellDetails: {
        name: string;
        date: string;
        address: string;
        phoneNumber: string;
        email: string;
        seller: string;
        iva: string;
        subtotal: string;
        total: string;
        Folio: string;
        TipoDocNombre: string;
    },
    sells: {
        sku: string;
        quntity: number;
        description: string;
        unitPrice: number;
        subtotal: number;
    }[]
}   