/**
 * @description Escapes and formats a value for inclusion in a CSV file, ensuring that special characters are handled correctly.
 */
export function formatCsvField(value: unknown): string {
    const text = value === null || value === undefined ? '' : String(value);
    const escaped = text.replace(/"/g, '""');

    return `"${escaped}"`;
}

/**
* @description Formats a database row as a CSV string, using the provided headers to determine the order of fields.
 */
export function formatCsvRow(
    row: Record<string, unknown>,
    headers: readonly string[]
): string {
    return headers.map(header => formatCsvField(row[header])).join(',');
}

/**
 * @description Generates CSV chunks from an iterable or async iterable of database rows, optionally including headers.
 * @param rows An iterable or async iterable of database rows, where each row is a record of key-value pairs. 
 * @param headers An optional array of headers to include as the first row in the CSV output. If not provided, headers will be inferred from the first row of data.
 * @returns An async iterable that yields CSV-formatted strings, including headers if specified.
 */
export async function* generateCsvChunks(
    rows:
    | Iterable<Record<string, unknown>>
    | AsyncIterable<Record<string, unknown>>,
    headers?: readonly string[],
): AsyncIterable<string> {

    let columns = headers;
    if (columns !== undefined) {
        yield columns.map(header => formatCsvField(header)).join(',');
    }

    for await (const row of rows) {
        if (columns === undefined) {
            columns = Object.keys(row);
            yield columns.map(header => formatCsvField(header)).join(',');
        }

        yield '\n' + formatCsvRow(row, columns);
    }
}
