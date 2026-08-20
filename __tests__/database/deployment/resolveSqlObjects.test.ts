import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { resolveSqlObjects } from '../../../src/database/sqlDeployment/resolveSqlObjects';

jest.mock('node:fs/promises', () => ({
    readFile: jest.fn()
}));

const missingFileError = (): Error & { code: string } => Object.assign(new Error('missing'), {
    code: 'ENOENT'
});

describe('resolveSqlObjects', () => {
    const readFileMock = readFile as jest.MockedFunction<typeof readFile>;
    const proceduresDirectory = path.resolve(process.cwd(), 'src/database/objects/procedures');
    const functionsDirectory = path.resolve(process.cwd(), 'src/database/objects/functions');

    it('resolves procedure and function files while preserving their SQL content', async () => {
        readFileMock.mockImplementation((filePath) => {
            const value = String(filePath);

            if (value === path.join(proceduresDirectory, 'sp_Save.sql')) {
                return Promise.resolve(' CREATE PROCEDURE sp_Save AS SELECT 1 ');
            }
            if (value === path.join(functionsDirectory, 'fn_Total.sql')) {
                return Promise.resolve(
                    'CREATE FUNCTION fn_Total() RETURNS INT AS BEGIN RETURN 1 END'
                );
            }

            return Promise.reject(missingFileError());
        });

        await expect(resolveSqlObjects(['sp_Save', 'fn_Total'])).resolves.toEqual([
            {
                name: 'sp_Save',
                type: 'procedure',
                filePath: path.join(proceduresDirectory, 'sp_Save.sql'),
                sql: ' CREATE PROCEDURE sp_Save AS SELECT 1 '
            },
            {
                name: 'fn_Total',
                type: 'function',
                filePath: path.join(functionsDirectory, 'fn_Total.sql'),
                sql: 'CREATE FUNCTION fn_Total() RETURNS INT AS BEGIN RETURN 1 END'
            }
        ]);
    });

    it.each(['', ' name', 'name ', 'name.sql', '../name', 'folder/name', 'folder\\name', '.', '..', '/tmp/name']) (
        'rejects unsafe object name %j before reading files',
        async (name) => {
            await expect(resolveSqlObjects([name])).rejects.toThrow('Invalid SQL object name');
            expect(readFileMock).not.toHaveBeenCalled();
        }
    );

    it('rejects case-insensitive duplicate names before reading files', async () => {
        await expect(resolveSqlObjects(['sp_Save', 'SP_SAVE']))
            .rejects.toThrow('Duplicate SQL object name: SP_SAVE');
        expect(readFileMock).not.toHaveBeenCalled();
    });

    it('rejects an object present in both supported directories', async () => {
        readFileMock.mockResolvedValue('SELECT 1');

        await expect(resolveSqlObjects(['shared_name']))
            .rejects.toThrow('SQL object exists as both a procedure and a function: shared_name');
    });

    it('reports an object absent from both supported directories', async () => {
        readFileMock.mockRejectedValue(missingFileError());

        await expect(resolveSqlObjects(['missing_name']))
            .rejects.toThrow('SQL object not found: missing_name');
    });

    it('rejects a SQL file containing only whitespace', async () => {
        readFileMock
            .mockResolvedValueOnce('   \n')
            .mockRejectedValueOnce(missingFileError());

        await expect(resolveSqlObjects(['empty_procedure']))
            .rejects.toThrow('SQL object file is empty: empty_procedure');
    });

    it('propagates unexpected filesystem errors', async () => {
        const failure = Object.assign(new Error('permission denied'), { code: 'EACCES' });
        readFileMock.mockRejectedValue(failure);

        await expect(resolveSqlObjects(['sp_Save'])).rejects.toBe(failure);
    });
});
