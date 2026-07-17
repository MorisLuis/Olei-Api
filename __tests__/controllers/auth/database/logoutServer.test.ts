import type { NextFunction, Request, Response } from 'express';
import { logoutServer } from '../../../../src/controllers/auth/database/logoutServer';
import { logoutServerService } from '../../../../src/services/auth/database/logoutServer.service';

jest.mock('../../../../src/services/auth/database/logoutServer.service', () => ({
    logoutServerService: jest.fn(),
}));

describe('logoutServer controller', () => {
    const mockLogoutServerService = logoutServerService as jest.MockedFunction<typeof logoutServerService>;

    const mockSession = {
        ServidorSQL: 'server',
        BaseSQL: 'db',
        UsuarioSQL: 'user',
        PasswordSQL: 'pass',
        Id_UsuarioOLEI: 'user01',
    };

    const createReq = (sessionId?: string, session?: unknown): Request =>
        ({ sessionId, session } as unknown as Request);

    const createRes = (): Response => {
        const res = {
            status: jest.fn(),
            json: jest.fn(),
        } as unknown as Response;

        (res.status as unknown as jest.Mock).mockReturnValue(res);
        return res;
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls service with sessionId and session and returns ok true', async () => {
        const req = createReq('session-abc', mockSession);
        const res = createRes();
        const next = jest.fn() as NextFunction;

        mockLogoutServerService.mockResolvedValue(undefined);

        await logoutServer(req, res, next);

        expect(mockLogoutServerService).toHaveBeenCalledWith({
            sessionId: 'session-abc',
            session: mockSession,
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Logout successful',
            data: { ok: true },
            info: undefined,
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('passes service errors to next', async () => {
        const req = createReq('session-abc', mockSession);
        const res = createRes();
        const next = jest.fn() as NextFunction;
        const serviceError = new Error('redis unavailable');

        mockLogoutServerService.mockRejectedValue(serviceError);

        await logoutServer(req, res, next);

        expect(mockLogoutServerService).toHaveBeenCalledTimes(1);
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(serviceError);
    });

    it('passes unexpected response errors to next', async () => {
        const req = createReq('session-abc', mockSession);
        const jsonError = new Error('response serialization failed');
        const res = {
            status: jest.fn(),
            json: jest.fn(() => {
                throw jsonError;
            }),
        } as unknown as Response;

        (res.status as unknown as jest.Mock).mockReturnValue(res);
        const next = jest.fn() as NextFunction;

        mockLogoutServerService.mockResolvedValue(undefined);

        await logoutServer(req, res, next);

        expect(mockLogoutServerService).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(jsonError);
    });
});
