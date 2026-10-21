import { pipeline } from 'node:stream/promises';
import type { Writable } from 'node:stream';

import { dbConnectionWeb } from "../../database";
import { createDatabaseRowStream } from "../../database/connection/connectionStream";
import type { DatabaseRowStreamResponse } from "../../database/connection/connectionStream";
import type { UserWebSessionInterface } from "../../interface/user";
import { generateCsvChunks } from "./csv";


export async function prepareExportQuery(userSession: UserWebSessionInterface): Promise<DatabaseRowStreamResponse> {
    const pool = await dbConnectionWeb(
        userSession.ServidorSQL,
        userSession.BaseSQL
    )

    return createDatabaseRowStream(pool);
}

/**
 * @description Executes a SQL query and streams its results to a writable destination (e.g., HTTP response) as CSV.
 * @param userSession The user's web session containing database connection details.
 * @param query The SQL query to execute.
 * @param destination A writable stream where the CSV output will be sent (e.g., an HTTP response).
 */

export async function exportQueryToDestination(
    userSession: UserWebSessionInterface,
    query: string,
    destination: Writable
): Promise<void> {

    const { request, rows } = await prepareExportQuery(userSession);

    const delivery = pipeline(
        rows,
        async function* (source: AsyncIterable<Record<string, unknown>>) {
            yield* generateCsvChunks(source);
        },
        destination
    )

    try {
        await Promise.all([
            delivery,
            request.query(query)
        ]);
    } catch (error) {
        rows.destroy();
        destination.destroy();

        await delivery.catch(() => undefined);

        throw error;
    }

}