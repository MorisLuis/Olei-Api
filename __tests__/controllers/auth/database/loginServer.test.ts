import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { loginServer } from '../../../../src/controllers/auth/database/loginServer';
import { loginDB } from '../../../../src/services/auth/database';

jest.mock('../../../../src/services/auth/database', () => ({
    loginDB: jest.fn(),
}));

describe('loginServer controller', () => {
    const mockLoginDB = loginDB as jest.MockedFunction<typeof loginDB>;

    const createRes = (): Response => {
        const res = {
            status: jest.fn(),
            json: jest.fn(),
        } as unknown as Response;

        (res.status as unknown as jest.Mock).mockReturnValue(res);
        return res;
    };

    const createReq = (body: unknown): Request => ({ body } as Request);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns sanitized user and token on success', async () => {
        const req = createReq({
            IdUsuarioOLEI: '  user01  ',
            PasswordOLEI: '  secret  ',
        });
        const res = createRes();
        const next = jest.fn() as NextFunction;
        const serviceResponse = {
            user: {
                IdUsuarioOLEI: 'USER_OLEI',
                RazonSocial: 'RAZON',
                SwImagenes: true,
                Vigencia: '2027-01-01',
                Id_ListPre: 3,
                from: 'mobil',
                userConected: false,
                serverConected: true,
            },
            tokenServer: 'token-server-1234',
        };

        mockLoginDB.mockResolvedValue(serviceResponse as never);

        await loginServer(req, res, next);

        expect(mockLoginDB).toHaveBeenCalledWith({
            IdUsuarioOLEI: 'user01',
            PasswordOLEI: 'secret',
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect((res.json as jest.Mock)).toHaveBeenCalledWith({
            success: true,
            message: 'Login successful',
            data: serviceResponse,
            info: undefined,
        });

        expect(next).not.toHaveBeenCalled();
    });

    it('passes validation errors to next', async () => {
        const req = createReq({
            IdUsuarioOLEI: '',
        });
        const res = createRes();
        const next = jest.fn() as NextFunction;

        await loginServer(req, res, next);

        expect(mockLoginDB).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);

        const error = (next as jest.Mock).mock.calls[0][0];
        expect(error).toBeInstanceOf(ZodError);
    });

    it('passes service errors to next', async () => {
        const req = createReq({
            IdUsuarioOLEI: 'user01',
            PasswordOLEI: 'secret',
        });
        const res = createRes();
        const next = jest.fn() as NextFunction;
        const serviceError = new Error('Credenciales inválidas');

        mockLoginDB.mockRejectedValue(serviceError);

        await loginServer(req, res, next);

        expect(mockLoginDB).toHaveBeenCalledTimes(1);
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(serviceError);
    });

    it('passes unexpected errors to next', async () => {
        const req = createReq({
            IdUsuarioOLEI: 'user01',
            PasswordOLEI: 'secret',
        });
        const res = createRes();
        const next = jest.fn() as NextFunction;
        const unexpectedError = new Error('response down');

        mockLoginDB.mockResolvedValue({
            user: {
                IdUsuarioOLEI: 'USER_OLEI',
                RazonSocial: 'RAZON',
            },
            tokenServer: 'token-server-1234',
        } as never);
        (res.status as unknown as jest.Mock).mockImplementation(() => {
            throw unexpectedError;
        });

        await loginServer(req, res, next);

        expect(mockLoginDB).toHaveBeenCalledTimes(1);
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(unexpectedError);
    });
});
