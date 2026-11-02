import { Buffer } from 'node:buffer';
import sql from 'mssql';
import { dbConnection } from '../../../src/database';
import { generateReportSells } from '../../../src/services/sells/generateReport';
import type { SellReportParameters } from '../../../src/services/sells/types';
import { sellReportWorkerManager } from '../../../src/services/sells/workers';
import { sellReportWorkerRequestSchema } from '../../../src/services/sells/workers/schemas';

jest.mock('../../../src/database', () => ({ dbConnection: jest.fn() }));
jest.mock('../../../src/services/sells/workers', () => ({
    sellReportWorkerManager: { render: jest.fn() },
}));

const command: SellReportParameters = {
    Id_Almacen: 1, Id_Cliente: 2, TipoDoc: '3', Serie: 'A', Folio: '42',
    session: {
        ServidorSQL: 'test-server', BaseSQL: 'test-db', UsuarioSQL: 'test-user', PasswordSQL: 'test-password',
        Id_UsuarioOOL: 'u', Id_UsuarioOLEI: 'u', PasswordOOL: 'test', Nombre: 'User',
        SwImagenes: false, from: 'web', Id_ListPre: 1, Id_Almacen: 1, Id_Cliente: 2,
        Id_Usuario: 'u', TipoUsuario: 'test', Vigencia: '2027-01-01', TipoDocOO: 3,
        InformesIAR: false, InformesIAE: false, InformesIAW: false, SwSinStock: false, SwsinPrecio: false,
    },
};

const sale = {
    Nombre: ' Customer ', Calle: ' Street ', NoExt: '1', NoInt: '', Colonia: ' Area ',
    CodigoPost: '12345', Telefono1: ' 555 ', CorreoVtas: ' test@example.com ',
    Fecha: new Date(2026, 0, 2), Vendedor: 'Seller', Impuesto: 16,
    Subtotal: 100, Total: 116, Folio: 42, TipoDocNombre: 'Invoice',
};

describe('generateReportSells worker integration', () => {
    const render = jest.mocked(sellReportWorkerManager.render);

    const configureDatabase = (sales: unknown[] = [sale]) => {
        // Constructing a pool does not connect; all query execution is mocked.
        const pool = new sql.ConnectionPool({ server: 'test-server' });
        jest.spyOn(pool, 'request').mockImplementation(() => new sql.Request(pool));
        const query = jest.spyOn(sql.Request.prototype, 'query');
        query.mockImplementationOnce(() => Promise.resolve({ recordset: sales, recordsets: [], output: {}, rowsAffected: [] }));
        query.mockImplementationOnce(() => Promise.resolve({
            recordset: [{ Codigo: 'SKU', Cantidad: 2, Descripcion: 'Product', Precio: 50, Importe: 100 }],
            recordsets: [], output: {}, rowsAffected: [],
        }));
        jest.mocked(dbConnection).mockResolvedValue(pool);
        return query;
    };

    afterEach(() => jest.restoreAllMocks());

    it.each([sale, { ...sale, Impuesto: '16', Subtotal: '100', Total: '116', Folio: '42' }])(
        'sends schema-compatible input to the worker and preserves the response contract', async (record) => {
            configureDatabase([record]);
            const pdfBuffer = Buffer.from('%PDF-test');
            render.mockResolvedValue({ pdfBuffer, fileName: 'report.pdf' });

            const result = await generateReportSells(command);

            const input = render.mock.calls[0][0];
            expect(sellReportWorkerRequestSchema.safeParse({ id: 1, input }).success).toBe(true);
            expect(input.sellDetails).toMatchObject({ name: 'Customer', iva: '16', subtotal: '100', total: '116', Folio: '42' });
            expect(input.sells).toEqual([{ sku: 'SKU', quntity: 2, description: 'Product', unitPrice: 50, subtotal: 100 }]);
            expect(input).not.toHaveProperty('session');
            expect(result).toEqual({ pdfBuffer, blob: pdfBuffer.toString('base64'), fileName: 'report.pdf', mimeType: 'application/pdf' });
        }
    );

    it('does not submit a job when the sale is missing', async () => {
        configureDatabase([]);
        await expect(generateReportSells(command)).rejects.toThrow('No se encontró la venta');
        expect(render).not.toHaveBeenCalled();
    });

    it('forwards a database failure without submitting a job', async () => {
        const error = new Error('database unavailable');
        jest.mocked(dbConnection).mockRejectedValue(error);
        await expect(generateReportSells(command)).rejects.toBe(error);
        expect(render).not.toHaveBeenCalled();
    });

    it('forwards a worker rendering failure', async () => {
        configureDatabase();
        const error = new Error('render failed');
        render.mockRejectedValue(error);
        await expect(generateReportSells(command)).rejects.toBe(error);
    });
});
