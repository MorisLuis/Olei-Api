import type { ConnectionPool, Request } from 'mssql';
import type { Readable } from 'stream';

export interface DatabaseRowStreamResponse {
    request: Request;
    rows: Readable;
}

/**
 * @description Creates a readable stream of database rows from a SQL Server connection pool.
 * @param pool The SQL Server connection pool.
 * @returns An object containing the request and the readable stream of rows.
 */

export function createDatabaseRowStream(pool: ConnectionPool): DatabaseRowStreamResponse {
    
    const request = pool.request();
    const rows = request.toReadableStream({
        highWaterMark: 16,
    });

    let queryFinished = false;

    request.once('done', () => {
        queryFinished = true;
    });

    rows.once('close', () => {
        if (!queryFinished) {
            request.cancel();
        }
    });

    return { request, rows };
}