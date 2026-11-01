import type { sellsReportPdfParams } from '../../src/services/sells/utils/types';

export function createReportFixture(rowCount: number): sellsReportPdfParams {
    return {
        sellDetails: {
            name: 'Example Customer',
            date: '2026-10-23',
            address: 'Example Address',
            phoneNumber: '5551234567',
            email: 'example@example.com',
            seller: 'Example Seller',
            iva: '0',
            subtotal: String(rowCount * 10),
            total: String(rowCount * 10),
            Folio: '1',
            TipoDocNombre: 'Example Report',
        },
        sells: Array.from({ length: rowCount }, (_, index) => ({
            sku: `SKU-${index}`,
            quntity: 1,
            description: `Example product ${index}`,
            unitPrice: 10,
            subtotal: 10,
        })),
    };
}
