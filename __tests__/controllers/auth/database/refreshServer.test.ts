import type { NextFunction, Request, Response } from 'express';
import { refreshServer } from '../../../../src/controllers/auth/database/refreshServer';
import { generateAccessTokenServer } from '../../../../src/services/auth/database';

jest.mock('../../../../src/services/auth/database', () => ({
    generateAccessTokenServer: jest.fn(),
}));

describe('refreshServer controller', () => {
    const mockGenerateAccessTokenServer = generateAccessTokenServer as jest.MockedFunction<typeof generateAccessTokenServer>;

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

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns sanitized user and token on success', () => {
        const req = createReq({
            sessionId: 'session-xyz',
            session: {
                IdUsuarioOLEI: 'U-01',
                RazonSocial: 'Olei SA',
                SwImagenes: true,
                Vigencia: '2027-01-01',
                Id_ListPre: 5,
                from: 'mobil',
                userConected: false,
                serverConected: true,
                PasswordSQL: 'secret',
                ServidorSQL: 'sql01',
            },
        });
        const res = createRes();
        const next = jest.fn() as NextFunction;

        mockGenerateAccessTokenServer.mockReturnValue('token-server-xyz');

        refreshServer(req, res, next);

        expect(mockGenerateAccessTokenServer).toHaveBeenCalledWith('session-xyz');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                user: expect.objectContaining({
                    IdUsuarioOLEI: 'U-01',
                    RazonSocial: 'Olei SA',
                    SwImagenes: true,
                    Vigencia: '2027-01-01',
                    Id_ListPre: 5,
                    from: 'mobil',
                    userConected: false,
                    serverConected: true,
                }),
                tokenServer: 'token-server-xyz',
            },
            info: undefined,
        });

        const payload = (res.json as jest.Mock).mock.calls[0][0];
        expect(payload.data.user).not.toHaveProperty('PasswordSQL');
        expect(payload.data.user).not.toHaveProperty('ServidorSQL');
        expect(next).not.toHaveBeenCalled();
    });

    it('passes token generation errors to next', () => {
        const req = createReq({
            sessionId: 'session-xyz',
            session: {
                IdUsuarioOLEI: 'U-01',
            },
        });
        const res = createRes();
        const next = jest.fn() as NextFunction;
        const tokenError = new Error('Missing ACCESS_TOKEN_SEVER_SECRET');

        mockGenerateAccessTokenServer.mockImplementation(() => {
            throw tokenError;
        });

        refreshServer(req, res, next);

        expect(mockGenerateAccessTokenServer).toHaveBeenCalledWith('session-xyz');
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(tokenError);
    });

    it('passes unexpected sanitize/response errors to next', () => {
        const req = createReq({
            sessionId: 'session-xyz',
            session: undefined,
        });
        const res = createRes();
        const next = jest.fn() as NextFunction;

        mockGenerateAccessTokenServer.mockReturnValue('token-server-xyz');

        refreshServer(req, res, next);

        expect(mockGenerateAccessTokenServer).toHaveBeenCalledWith('session-xyz');
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
        expect((next as jest.Mock).mock.calls[0][0]).toBeInstanceOf(Error);
    });
});
