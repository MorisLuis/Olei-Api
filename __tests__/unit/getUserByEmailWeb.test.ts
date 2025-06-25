import { ConnectionPool } from 'mssql';
import { getUserByEmailWeb } from '../../src/services/authServices';
import { NotFoundError } from '../../src/errors/CustomError';

const makePool = (
    email: string,
    variant: 'ok' | 'empty' | Error
) => {
    const recordset =
        variant === 'ok' ? [{ id: 1, email }] : [];

    const queryMock =
        variant instanceof Error
            ? jest.fn().mockRejectedValue(variant)
            : jest.fn().mockResolvedValue({ recordset });

    const inputMock = jest.fn(() => ({ query: queryMock }));
    const requestMock = jest.fn(() => ({ input: inputMock }));

    return {
        pool: { request: requestMock } as unknown as ConnectionPool,
        requestMock,
        inputMock,
        queryMock,
    };
};

describe.only('getUserByEmailWeb', () => {
    const email = 'morado@example.com';

    it('returns the user when found', async () => {
    
        const { pool, requestMock, inputMock, queryMock } = makePool(email, 'ok');
        const user = await getUserByEmailWeb(pool, email);

        expect(requestMock).toHaveBeenCalledTimes(1);
        expect(inputMock).toHaveBeenCalledWith('email', email);
        expect(queryMock).toHaveBeenCalledWith(expect.any(String));
        expect(user).toEqual({ id: 1, email });
    });

    it('throws NotFoundError when user is missing', async () => {
        const { pool } = makePool(email, 'empty');

        // 1️⃣  Mensaje + clase en una sola aserción
        await expect(getUserByEmailWeb(pool, email))
            .rejects.toThrow(new NotFoundError('No se encontro el usuario'));

        await expect(getUserByEmailWeb(pool, email)).rejects.toBeInstanceOf(NotFoundError);
    });

    it('propagates DB errors', async () => {
        const dbErr = new Error('SQL down');
        const { pool } = makePool(email, dbErr);
        await expect(getUserByEmailWeb(pool, email)).rejects.toThrow('SQL down');
    });
});
