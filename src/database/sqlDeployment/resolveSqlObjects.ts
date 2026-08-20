import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { cwd } from 'node:process';

import { NotFoundError, ValidationError } from '../../errors/CustomError';
import type { SqlObjectDefinition, SqlObjectType } from './types';

const SQL_OBJECT_DIRECTORIES: Record<SqlObjectType, string> = {
    procedure: path.resolve(cwd(), 'src', 'database', 'objects', 'procedures'),
    function: path.resolve(cwd(), 'src', 'database', 'objects', 'functions')
};

const hasErrorCode = (error: unknown): error is Error & { code: unknown } => (
    error instanceof Error && 'code' in error
);

const readSqlFile = async (filePath: string): Promise<string | null> => {
    try {
        return await readFile(filePath, 'utf8');
    } catch (error) {
        if (hasErrorCode(error) && error.code === 'ENOENT') {
            return null;
        }

        throw error;
    }
};

const validateObjectNames = (objectNames: string[]): void => {
    if (!Array.isArray(objectNames)) {
        throw new ValidationError('SQL object names must be provided as an array');
    }

    const seenNames = new Set<string>();

    for (const name of objectNames) {
        const normalizedName = typeof name === 'string' ? name.toLowerCase() : '';
        const isInvalid = typeof name !== 'string'
            || name.length === 0
            || name !== name.trim()
            || name.endsWith('.sql')
            || name.includes('/')
            || name.includes('\\')
            || name.includes('\0')
            || path.isAbsolute(name)
            || path.win32.isAbsolute(name)
            || name === '.'
            || name === '..';

        if (isInvalid) {
            throw new ValidationError(`Invalid SQL object name: ${String(name)}`);
        }

        if (seenNames.has(normalizedName)) {
            throw new ValidationError(`Duplicate SQL object name: ${name}`);
        }

        seenNames.add(normalizedName);
    }
};

/**
 * @description Resolves SQL object names to their definitions, including type, file path, and SQL content.
 * @example
 * const sqlObjects = await resolveSqlObjects(['sp_AuthenticateAndGetMovement', 'fn_CalculateDiscount']);
 * console.log(sqlObjects);
 * output: [
 *   {
 *    name: 'sp_AuthenticateAndGetMovement',
 *    type: 'procedure',
 *    filePath: '/path/to/src/database/objects/procedures/sp_AuthenticateAndGetMovement.sql',
 *    sql: 'CREATE PROCEDURE dbo.sp_AuthenticateAndGetMovement ...'
 *  },
 * 
 * @throws {ValidationError} If any of the object names are invalid or if a name exists as both a procedure and a function.
 * @throws {NotFoundError} If any of the specified SQL objects cannot be found in the expected directories.
 * @throws {Error} If there is an unexpected error reading the SQL files.   
 * @param objectNames - An array of SQL object names to resolve. Each name should be a string without file extensions or path separators.
 * @returns A promise that resolves to an array of SqlObjectDefinition objects, each containing the name, type, file path, and SQL content of the resolved SQL object.
 */

export const resolveSqlObjects = async (objectNames: string[]): Promise<SqlObjectDefinition[]> => {
    validateObjectNames(objectNames);

    return Promise.all(objectNames.map(async name => {

        const procedurePath = path.join(SQL_OBJECT_DIRECTORIES.procedure, `${name}.sql`);
        const functionPath = path.join(SQL_OBJECT_DIRECTORIES.function, `${name}.sql`);

        const [procedureSql, functionSql] = await Promise.all([
            readSqlFile(procedurePath),
            readSqlFile(functionPath)
        ]);

        if (procedureSql !== null && functionSql !== null) {
            throw new ValidationError(
                `SQL object exists as both a procedure and a function: ${name}`
            );
        }

        const type: SqlObjectType | null = procedureSql !== null
            ? 'procedure'
            : functionSql !== null
                ? 'function'
                : null;

        const sql = procedureSql ?? functionSql;

        if (!type || sql === null) {
            throw new NotFoundError(`SQL object not found: ${name}`);
        }

        if (sql.trim().length === 0) {
            throw new ValidationError(`SQL object file is empty: ${name}`);
        }

        return {
            name,
            type,
            filePath: type === 'procedure' ? procedurePath : functionPath,
            sql
        };
    }));
};
