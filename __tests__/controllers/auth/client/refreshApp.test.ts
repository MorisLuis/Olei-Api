import type { NextFunction, Request, Response } from 'express';
import { refreshApp } from '../../../../src/controllers/auth/client/refreshApp';
import { generateAccessToken, generateRefreshToken } from '../../../../src/services/auth/client/token.service';

jest.mock('../../../../src/services/auth/client/token.service', () => ({
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
}));

describe('refreshApp controller', () => {
    const mockGenerateAccessToken = generateAccessToken as jest.MockedFunction<typeof generateAccessToken>;
    const mockGenerateRefreshToken = generateRefreshToken as jest.MockedFunction<typeof generateRefreshToken>;

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
        userConected: true,
        Id_UsuarioOLEI: 'app-user',
        userRol: 'ADMIN',
        TodosAlmacenes: 1,
        SalidaSinExistencias: 0,
        Id_Almacen: 5,
        Id_ListPre: 10,
        AlmacenNombre: 'Main Warehouse',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns new tokens and sanitized user on success', () => {
        const req = createReq({
            body: { refreshToken: 'valid-refresh-token' },
            session: baseSession,
            sessionId: 'session-refresh-1',
        });
        const res = createRes();
        const next = jest.fn() as NextFunction;

        mockGenerateAccessToken.mockReturnValue('new-access-token');
        mockGenerateRefreshToken.mockReturnValue('new-refresh-token');

        refreshApp(req, res, next);

        expect(mockGenerateAccessToken).toHaveBeenCalledWith('session-refresh-1');
        expect(mockGenerateRefreshToken).toHaveBeenCalledWith('session-refresh-1');

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                token: 'new-access-token',
                refreshToken: 'new-refresh-token',
                user: expect.objectContaining({
                    IdUsuarioOLEI: 'OLEI-001',
                    from: 'mobil',
                    serverConected: true,
                    userConected: true,
                    Id_UsuarioOLEI: 'app-user',
                    userRol: 'ADMIN',
                }),
            },
            info: undefined,
        });

        const payload = (res.json as jest.Mock).mock.calls[0][0];
        expect(payload.data.user).not.toHaveProperty('PasswordSQL');
        expect(payload.data.user).not.toHaveProperty('ServidorSQL');

        expect(next).not.toHaveBeenCalled();
    });

    it('passes validation errors to next', () => {
        const req = createReq({
            body: {},
            session: baseSession,
            sessionId: 'session-refresh-1',
        });
        const res = createRes();
        const next = jest.fn() as NextFunction;

        refreshApp(req, res, next);

        expect(mockGenerateAccessToken).not.toHaveBeenCalled();
        expect(mockGenerateRefreshToken).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
        expect((next as jest.Mock).mock.calls[0][0]).toBeInstanceOf(Error);
    });

    it('passes token generation errors to next', () => {
        const req = createReq({
            body: { refreshToken: 'valid-refresh-token' },
            session: baseSession,
            sessionId: 'session-refresh-1',
        });
        const res = createRes();
        const next = jest.fn() as NextFunction;
        const tokenError = new Error('Missing ACCESS_TOKEN_SECRET');

        mockGenerateAccessToken.mockImplementation(() => {
            throw tokenError;
        });

        refreshApp(req, res, next);

        expect(mockGenerateAccessToken).toHaveBeenCalledWith('session-refresh-1');
        expect(mockGenerateRefreshToken).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(tokenError);
    });

    it('passes unexpected sanitize/response errors to next', () => {
        const req = createReq({
            body: { refreshToken: 'valid-refresh-token' },
            session: undefined,
            sessionId: 'session-refresh-1',
        });
        const res = createRes();
        const next = jest.fn() as NextFunction;

        mockGenerateAccessToken.mockReturnValue('new-access-token');
        mockGenerateRefreshToken.mockReturnValue('new-refresh-token');

        refreshApp(req, res, next);

        expect(mockGenerateAccessToken).toHaveBeenCalledWith('session-refresh-1');
        expect(mockGenerateRefreshToken).toHaveBeenCalledWith('session-refresh-1');
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
        expect((next as jest.Mock).mock.calls[0][0]).toBeInstanceOf(Error);
    });
});
