import type { NextFunction, Request, Response } from 'express';
import { logoutServer } from '../../../../src/controllers/auth/database/logoutServer';
import { handleDeleteRedisSession } from '../../../../src/helpers/generate-redis';

jest.mock('../../../../src/helpers/generate-redis', () => ({
    handleDeleteRedisSession: jest.fn(),
}));

describe('logoutServer controller', () => {
    const mockHandleDeleteRedisSession = handleDeleteRedisSession as jest.MockedFunction<typeof handleDeleteRedisSession>;

    const createReq = (sessionId?: string): Request => ({ sessionId } as unknown as Request);

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

    it('deletes redis session and returns ok true', async () => {
        const req = createReq('session-abc');
        const res = createRes();
        const next = jest.fn() as NextFunction;

        mockHandleDeleteRedisSession.mockResolvedValue(undefined as never);

        await logoutServer(req, res, next);

        expect(mockHandleDeleteRedisSession).toHaveBeenCalledWith('session-abc');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Logout successful',
            data: { ok: true },
            info: undefined,
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('passes redis delete errors to next', async () => {
        const req = createReq('session-abc');
        const res = createRes();
        const next = jest.fn() as NextFunction;
        const redisError = new Error('redis unavailable');

        mockHandleDeleteRedisSession.mockRejectedValue(redisError);

        await logoutServer(req, res, next);

        expect(mockHandleDeleteRedisSession).toHaveBeenCalledWith('session-abc');
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(redisError);
    });

    it('passes unexpected response errors to next', async () => {
        const req = createReq('session-abc');
        const jsonError = new Error('response serialization failed');
        const res = {
            status: jest.fn(),
            json: jest.fn(() => {
                throw jsonError;
            }),
        } as unknown as Response;

        (res.status as unknown as jest.Mock).mockReturnValue(res);
        const next = jest.fn() as NextFunction;

        mockHandleDeleteRedisSession.mockResolvedValue(undefined as never);

        await logoutServer(req, res, next);

        expect(mockHandleDeleteRedisSession).toHaveBeenCalledWith('session-abc');
        expect(next).toHaveBeenCalledWith(jsonError);
    });
});
