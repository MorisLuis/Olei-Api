import { EventEmitter } from 'node:events';
import { Buffer } from 'node:buffer';
import { PassThrough, Writable } from 'node:stream';
import sql from 'mssql';
import { dbConnectionWeb } from '../../../src/database';
import { exportQueryToDestination } from '../../../src/services/ai/exportQuery.service';
import type { UserWebSessionInterface } from '../../../src/interface/user';

let queryImplementation = (request: MockRequest): Promise<void> => {
    void request;
    return Promise.resolve();
};
const requests: MockRequest[] = [];

class MockRequest extends EventEmitter {
    public rows = new PassThrough({ objectMode: true });
    public query = jest.fn((query: string) => {
        void query;
        return queryImplementation(this);
    });
    public cancel = jest.fn();
    public toReadableStream = jest.fn(() => this.rows);
}

class MockPool {
    public request(): MockRequest {
        const request = new MockRequest();
        requests.push(request);
        return request;
    }
}

jest.mock('mssql', () => ({
    __esModule: true,
    default: { ConnectionPool: function () { return new MockPool(); } },
}));

jest.mock('../../../src/database', () => ({ dbConnectionWeb: jest.fn() }));

const session: UserWebSessionInterface = {
    ServidorSQL: 'tenant-server', BaseSQL: 'tenant-database',
    UsuarioSQL: 'test', PasswordSQL: 'test',
    Id_UsuarioOOL: '1', Id_UsuarioOLEI: '1', PasswordOOL: 'test',
    Nombre: 'Test', SwImagenes: false, from: 'crm',
    Id_ListPre: 1, Id_Almacen: 1, Id_Cliente: 1, Id_Usuario: '1',
    TipoUsuario: 'test', Vigencia: '', TipoDocOO: 1,
    InformesIAR: false, InformesIAE: false, InformesIAW: false,
    SwSinStock: false, SwsinPrecio: false,
};

function collectDestination() {
    const chunks: Buffer[] = [];
    const destination = new Writable({
        write(chunk: Buffer, _encoding, callback) {
            chunks.push(Buffer.from(chunk));
            callback();
        },
    });
    return { destination, text: () => Buffer.concat(chunks).toString('utf8') };
}

describe('exportQueryToDestination', () => {
    beforeEach(() => {
        requests.length = 0;
        jest.mocked(dbConnectionWeb).mockResolvedValue(new sql.ConnectionPool({ server: 'unused' }));
        queryImplementation = request => {
            request.rows.write({ name: 'Café', price: 25 });
            request.rows.write({ price: 30, name: 'Second' });
            request.emit('done');
            request.rows.end();
            return Promise.resolve();
        };
    });

    it('uses the web tenant and delivers all rows as CSV without cancelling a finished query', async () => {
        const { destination, text } = collectDestination();

        await exportQueryToDestination(session, 'SELECT name, price FROM example', destination);

        expect(dbConnectionWeb).toHaveBeenCalledWith('tenant-server', 'tenant-database');
        expect(requests[0].query).toHaveBeenCalledWith('SELECT name, price FROM example');
        expect(text()).toBe('"name","price"\n"Café","25"\n"Second","30"');
        expect(destination.writableFinished).toBe(true);
        expect(requests[0].cancel).not.toHaveBeenCalled();
    });

    it('preserves a rejected query error and closes delivery', async () => {
        const failure = new Error('Query rejected');
        queryImplementation = () => Promise.reject(failure);
        const { destination } = collectDestination();

        await expect(exportQueryToDestination(session, 'SELECT example', destination)).rejects.toBe(failure);

        expect(destination.destroyed).toBe(true);
        expect(requests[0].rows.destroyed).toBe(true);
        expect(requests[0].cancel).toHaveBeenCalledTimes(1);
    });

    it('handles a source-stream failure even when query execution resolves', async () => {
        const failure = new Error('Streamed SQL error');
        queryImplementation = request => {
            request.rows.destroy(failure);
            request.emit('done');
            return Promise.resolve();
        };
        const { destination } = collectDestination();

        await expect(exportQueryToDestination(session, 'SELECT example', destination)).rejects.toBe(failure);

        expect(destination.destroyed).toBe(true);
    });

    it('cancels an active database request when the destination fails', async () => {
        const failure = new Error('Destination failed');
        queryImplementation = request => new Promise<void>(resolve => {
            request.cancel.mockImplementation(() => {
                request.emit('done');
                resolve();
            });
            request.rows.write({ name: 'First' });
        });
        const destination = new Writable({
            write(_chunk, _encoding, callback) { callback(failure); },
        });

        await expect(exportQueryToDestination(session, 'SELECT example', destination)).rejects.toBe(failure);

        expect(requests[0].cancel).toHaveBeenCalledTimes(1);
        expect(requests[0].rows.destroyed).toBe(true);
    });

    it('forwards connection failures without starting a request', async () => {
        const failure = new Error('Connection failed');
        jest.mocked(dbConnectionWeb).mockRejectedValue(failure);
        const { destination } = collectDestination();

        await expect(exportQueryToDestination(session, 'SELECT example', destination)).rejects.toBe(failure);

        expect(requests).toHaveLength(0);
        expect(destination.writableFinished).toBe(false);
    });
});
