import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { loginApp } from '../../../../src/controllers/auth/client/loginApp';
import { loginAppService } from '../../../../src/services/auth/client/loginApp.service';

jest.mock('../../../../src/services/auth/client/loginApp.service', () => ({
    loginAppService: jest.fn(),
}));

describe('loginApp controller', () => {
    const mockLoginAppService = loginAppService as jest.MockedFunction<typeof loginAppService>;

    const createReq = ({ body, session, sessionId }: { body?: unknown, session?: unknown, sessionId?: string }): Request => (
        { body, session, sessionId } as unknown as Request
    );

    const createRes = (): Response => {
        const res = {
            status: jest.fn(),
            json: jest.fn(),
        } as unknown as Response;

        (res.status as unknown as jest.Mock).mockReturnValue(res);
        return res;
    };

    const baseSession = {
        ServidorSQL: 'SERVER',
        BaseSQL: 'DB',
        UsuarioSQL: 'USER',
        PasswordSQL: 'PASS',
        IdUsuarioOLEI: 'OLEI-001',
        RazonSocial: 'OLEI S.A.',
        SwImagenes: true,
        Vigencia: '2027-01-01',
        from: 'mobil',
        serverConected: true,
        userConected: false,
        Id_ListPre: 10,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns sanitized user with access and refresh tokens on success', async () => {
        const req = createReq({
            body: {
                Id_Usuario: '  app-user  ',
                password: '  app-pass  ',
            },
            session: baseSession,
            sessionId: 'session-abc',
        });
        const res = createRes();
        const next = jest.fn() as NextFunction;
        const serviceResponse = {
            user: {
                IdUsuarioOLEI: 'OLEI-001',
                from: 'mobil',
                serverConected: true,
                userConected: true,
                Id_UsuarioOLEI: 'app-user',
                userRol: 1,
                TodosAlmacenes: 1,
                SalidaSinExistencias: 0,
                Id_Almacen: 7,
                AlmacenNombre: 'Main Warehouse',
            },
            token: 'access-token-123',
            refreshToken: 'refresh-token-123',
        };

        mockLoginAppService.mockResolvedValue(serviceResponse as never);

        await loginApp(req, res, next);

        expect(mockLoginAppService).toHaveBeenCalledWith({
            Id_Usuario: 'app-user',
            password: 'app-pass',
            session: baseSession,
            sessionId: 'session-abc',
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Login successful',
            data: serviceResponse,
            info: undefined,
        });

        expect(next).not.toHaveBeenCalled();
    });

    it('passes validation errors to next', async () => {
        const req = createReq({
            body: {
                Id_Usuario: '',
                password: 'app-pass',
            },
            session: baseSession,
            sessionId: 'session-abc',
        });
        const res = createRes();
        const next = jest.fn() as NextFunction;

        await loginApp(req, res, next);

        expect(mockLoginAppService).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);

        const error = (next as jest.Mock).mock.calls[0][0];
        expect(error).toBeInstanceOf(ZodError);
    });

    it('passes service errors to next', async () => {
        const req = createReq({
            body: {
                Id_Usuario: 'app-user',
                password: 'app-pass',
            },
            session: baseSession,
            sessionId: 'session-abc',
        });
        const res = createRes();
        const next = jest.fn() as NextFunction;
        const serviceError = new Error('Correo no encontrado');

        mockLoginAppService.mockRejectedValue(serviceError);

        await loginApp(req, res, next);

        expect(mockLoginAppService).toHaveBeenCalledTimes(1);
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(serviceError);
    });

    it('passes unexpected errors from response construction to next', async () => {
        const req = createReq({
            body: {
                Id_Usuario: 'app-user',
                password: 'app-pass',
            },
            session: baseSession,
            sessionId: 'session-abc',
        });
        const res = createRes();
        const next = jest.fn() as NextFunction;
        const responseError = new Error('response failed');

        mockLoginAppService.mockResolvedValue({
            user: {
                IdUsuarioOLEI: 'OLEI-001',
            },
            token: 'access-token-123',
            refreshToken: 'refresh-token-123',
        } as never);
        (res.status as unknown as jest.Mock).mockImplementation(() => {
            throw responseError;
        });

        await loginApp(req, res, next);

        expect(mockLoginAppService).toHaveBeenCalledTimes(1);
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(responseError);
    });
});
