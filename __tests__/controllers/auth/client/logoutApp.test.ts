import type { NextFunction, Request, Response } from 'express';
import { logoutApp } from '../../../../src/controllers/auth/client/logoutApp';
import { logoutAppService } from '../../../../src/services/auth/client/logoutApp.service';

jest.mock('../../../../src/services/auth/client/logoutApp.service', () => ({
    logoutAppService: jest.fn(),
}));

describe('logoutApp controller', () => {
    const mockLogoutAppService = logoutAppService as jest.MockedFunction<typeof logoutAppService>;

    const createReq = ({ session, sessionId }: { session?: unknown, sessionId?: string }): Request => (
        { session, sessionId } as unknown as Request
    );

    const createRes = (): Response => {
        const res = {
            status: jest.fn(),
            json: jest.fn(),
        } as unknown as Response;

        (res.status as unknown as jest.Mock).mockReturnValue(res);
        return res;
    };

    const connectedSession = {
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
        userConected: true,
        Id_UsuarioOLEI: 'app-user',
        userRol: 'ADMIN',
        TodosAlmacenes: 1,
        SalidaSinExistencias: 1,
        Id_Almacen: 5,
        Id_ListPre: 10,
        AlmacenNombre: 'Main Warehouse',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('updates session with logged-out user and returns sanitized user', async () => {
        const req = createReq({
            session: connectedSession,
            sessionId: 'session-logout-1',
        });
        const res = createRes();
        const next = jest.fn() as NextFunction;

        mockLogoutAppService.mockResolvedValue({
            user: {
                ...connectedSession,
                Id_UsuarioOLEI: '',
                userRol: 0,
                TodosAlmacenes: 0,
                SalidaSinExistencias: 0,
                Id_Almacen: 0,
                AlmacenNombre: '',
                userConected: false,
            },
        } as never);

        await logoutApp(req, res, next);

        expect(mockLogoutAppService).toHaveBeenCalledWith({
            sessionId: 'session-logout-1',
            session: connectedSession,
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Logout successful',
            data: {
                user: expect.objectContaining({
                    IdUsuarioOLEI: 'OLEI-001',
                    from: 'mobil',
                    serverConected: true,
                    userConected: false,
                    Id_UsuarioOLEI: '',
                    userRol: 0,
                    TodosAlmacenes: 0,
                    SalidaSinExistencias: 0,
                    Id_Almacen: 0,
                    AlmacenNombre: '',
                }),
            },
            info: undefined,
        });

        const payload = (res.json as jest.Mock).mock.calls[0][0];
        expect(payload.data.user).not.toHaveProperty('PasswordSQL');
        expect(payload.data.user).not.toHaveProperty('ServidorSQL');

        expect(next).not.toHaveBeenCalled();
    });

    it('passes unauthorized error to next when session is missing', async () => {
        const req = createReq({
            session: undefined,
            sessionId: 'session-logout-1',
        });
        const res = createRes();
        const next = jest.fn() as NextFunction;

        const serviceError = new Error('Session ID or session data is missing');
        mockLogoutAppService.mockRejectedValue(serviceError);

        await logoutApp(req, res, next);

        expect(mockLogoutAppService).toHaveBeenCalledWith({
            sessionId: 'session-logout-1',
            session: undefined,
        });
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
        expect((next as jest.Mock).mock.calls[0][0]).toBe(serviceError);
    });

    it('passes service errors to next', async () => {
        const req = createReq({
            session: connectedSession,
            sessionId: 'session-logout-1',
        });
        const res = createRes();
        const next = jest.fn() as NextFunction;
        const serviceError = new Error('redis unavailable');

        mockLogoutAppService.mockRejectedValue(serviceError);

        await logoutApp(req, res, next);

        expect(mockLogoutAppService).toHaveBeenCalledTimes(1);
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(serviceError);
    });

    it('passes unexpected response errors to next', async () => {
        const req = createReq({
            session: connectedSession,
            sessionId: 'session-logout-1',
        });
        const jsonError = new Error('response serialization failed');
        const res = {
            status: jest.fn(),
            json: jest.fn(() => {
                throw jsonError;
            }),
        } as unknown as Response;

        (res.status as unknown as jest.Mock).mockReturnValue(res);
        const next = jest.fn() as NextFunction;

        mockLogoutAppService.mockResolvedValue({
            user: {
                ...connectedSession,
                userConected: false,
            },
        } as never);

        await logoutApp(req, res, next);

        expect(mockLogoutAppService).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(jsonError);
    });
});
