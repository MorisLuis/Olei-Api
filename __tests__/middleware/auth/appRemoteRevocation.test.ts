import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { validateJWTClient } from '../../../src/middleware/validateJWT/validateClient';
import { validateRefreshToken } from '../../../src/middleware/validateJWT/validateRefreshToken';
import { AUTH_ERROR_CODES } from '../../../src/middleware/constants';
import { getSessionOrUnauthorized } from '../../../src/middleware/validateJWT/session.helpers';
import { buildVerifyOptions, extractBearerToken, verifyTokenAndExtractSessionId } from '../../../src/middleware/validateJWT/token.helpers';
import { verifyUserDevice } from '../../../src/services/auth/client/verifyUserDevice.service';
import { logoutAppService } from '../../../src/services/auth/client/logoutApp.service';
import type { UserSessionInterface } from '../../../src/interface/user';

jest.mock('../../../src/middleware/validateJWT/session.helpers', () => ({
    getSessionOrUnauthorized: jest.fn(),
}));

jest.mock('../../../src/middleware/validateJWT/token.helpers', () => ({
    extractBearerToken: jest.fn((value: string | undefined) => value?.replace(/^Bearer /, '') || null),
    buildVerifyOptions: jest.fn(() => ({ algorithms: ['HS256'] })),
    verifyTokenAndExtractSessionId: jest.fn(),
}));

jest.mock('../../../src/services/auth/client/verifyUserDevice.service', () => ({
    verifyUserDevice: jest.fn(),
}));

jest.mock('../../../src/services/auth/client/logoutApp.service', () => ({
    logoutAppService: jest.fn(),
}));

jest.mock('../../../src/services/auth/database/logoutServer.service', () => ({
    logoutServerService: jest.fn(),
}));

jest.mock('../../../src/services/auth/database/session.service', () => ({
    getRedisSession: jest.fn(),
}));

jest.mock('../../../src/helpers/logger', () => ({
    logger: { error: jest.fn() },
}));

describe('App remote session revocation', () => {
    const mockGetSession = getSessionOrUnauthorized as jest.MockedFunction<typeof getSessionOrUnauthorized>;
    const mockExtractBearerToken = extractBearerToken as jest.MockedFunction<typeof extractBearerToken>;
    const mockBuildVerifyOptions = buildVerifyOptions as jest.MockedFunction<typeof buildVerifyOptions>;
    const mockVerifyToken = verifyTokenAndExtractSessionId as jest.MockedFunction<typeof verifyTokenAndExtractSessionId>;
    const mockVerifyUserDevice = verifyUserDevice as jest.MockedFunction<typeof verifyUserDevice>;
    const mockLogoutApp = logoutAppService as jest.MockedFunction<typeof logoutAppService>;
    const originalEnv = process.env;

    const deviceBSession: UserSessionInterface = {
        ServidorSQL: 'SERVER',
        BaseSQL: 'DATABASE',
        UsuarioSQL: 'USER',
        PasswordSQL: 'PASSWORD',
        IdUsuarioOLEI: 'tenant-user',
        RazonSocial: 'Tenant',
        SwImagenes: false,
        Vigencia: new Date('2027-01-01T00:00:00.000Z'),
        from: 'mobil',
        serverConected: true,
        userConected: true,
        Id_UsuarioOLEI: 'app-user',
        Id_Equipo: 'DEVICE-B',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = {
            ...originalEnv,
            ACCESS_TOKEN_SEVER_SECRET: 'server-secret',
            ACCESS_TOKEN_SECRET: 'access-secret',
            REFRESH_TOKEN_SECRET: 'refresh-secret',
        };
        mockExtractBearerToken.mockImplementation(value =>
            typeof value === 'string' ? value.replace(/^Bearer /, '') : null
        );
        mockBuildVerifyOptions.mockReturnValue({ algorithms: ['HS256'] });
        mockVerifyToken.mockReturnValue('shared-session');
        mockGetSession.mockResolvedValue(deviceBSession);
        mockLogoutApp.mockResolvedValue({ user: deviceBSession });
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('blocks an unexpired access token when SQL reports the session device as revoked', async () => {
        mockVerifyUserDevice.mockResolvedValue(false);
        const req = {
            headers: {
                'x-server-token': 'Bearer server-token',
                authorization: 'Bearer device-a-access-token',
            },
        } as unknown as Request;
        const next = jest.fn() as NextFunction;

        await validateJWTClient(req, {} as Response, next);

        expect(mockVerifyUserDevice).toHaveBeenCalledWith(deviceBSession);
        expect(mockLogoutApp).toHaveBeenCalledWith({
            sessionId: 'shared-session',
            session: deviceBSession,
        });
        expect(next).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Session revoked',
            code: 'SESSION_REVOKED',
            statusCode: 401,
        }));
    });

    it('preserves SESSION_REVOKED when access-token cleanup also fails', async () => {
        mockVerifyUserDevice.mockResolvedValue(false);
        mockLogoutApp.mockRejectedValue(new Error('cleanup failed'));
        const req = {
            headers: {
                'x-server-token': 'Bearer server-token',
                authorization: 'Bearer device-a-access-token',
            },
        } as unknown as Request;
        const next = jest.fn() as NextFunction;

        await validateJWTClient(req, {} as Response, next);

        expect(next).toHaveBeenCalledWith(expect.objectContaining({ code: 'SESSION_REVOKED' }));
    });

    it('blocks an unexpired refresh token when SQL reports the session device as revoked', async () => {
        mockVerifyUserDevice.mockResolvedValue(false);
        const req = { body: { refreshToken: 'device-a-refresh-token' } } as Request;
        const next = jest.fn() as NextFunction;

        await validateRefreshToken(req, {} as Response, next);

        expect(mockLogoutApp).toHaveBeenCalledWith({
            sessionId: 'shared-session',
            session: deviceBSession,
        });
        expect(next).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Session revoked',
            code: 'SESSION_REVOKED',
            statusCode: 401,
        }));
    });

    it('preserves SESSION_REVOKED when refresh-token cleanup also fails', async () => {
        mockVerifyUserDevice.mockResolvedValue(false);
        mockLogoutApp.mockRejectedValue(new Error('cleanup failed'));
        const req = { body: { refreshToken: 'device-a-refresh-token' } } as Request;
        const next = jest.fn() as NextFunction;

        await validateRefreshToken(req, {} as Response, next);

        expect(next).toHaveBeenCalledWith(expect.objectContaining({ code: 'SESSION_REVOKED' }));
    });

    it('rejects refresh after cleanup has marked the Redis session as logged out', async () => {
        mockGetSession.mockResolvedValue({ ...deviceBSession, userConected: false });
        const req = { body: { refreshToken: 'device-a-refresh-token' } } as Request;
        const next = jest.fn() as NextFunction;

        await validateRefreshToken(req, {} as Response, next);

        expect(mockVerifyUserDevice).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(expect.objectContaining({
            code: AUTH_ERROR_CODES.REFRESH_TOKEN_EXPIRADO,
            statusCode: 401,
        }));
    });

    it('documents the gap: an old access token is accepted after Redis is replaced under the same session ID', async () => {
        mockVerifyUserDevice.mockResolvedValue(true);
        const req = {
            headers: {
                'x-server-token': 'Bearer server-token',
                authorization: 'Bearer device-a-access-token',
            },
        } as unknown as Request;
        const next = jest.fn() as NextFunction;

        await validateJWTClient(req, {} as Response, next);

        expect(mockGetSession).toHaveBeenCalledWith(
            'shared-session',
            AUTH_ERROR_CODES.SESSION_EXPIRADA,
            'Session is invalid or expired / session data not found',
        );
        expect(mockVerifyUserDevice).toHaveBeenCalledWith(deviceBSession);
        expect(mockLogoutApp).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith();
    });

    it('documents the gap: an old refresh token is accepted after Redis is replaced under the same session ID', async () => {
        mockVerifyUserDevice.mockResolvedValue(true);
        const req = { body: { refreshToken: 'device-a-refresh-token' } } as unknown as Request & { session?: UserSessionInterface; sessionId?: string };
        const next = jest.fn() as NextFunction;

        await validateRefreshToken(req, {} as Response, next);

        expect(req.session).toBe(deviceBSession);
        expect(req.sessionId).toBe('shared-session');
        expect(mockLogoutApp).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith();
    });

    it('rejects a missing server token with the existing session-expired code', async () => {
        const req = { headers: {} } as Request;
        const next = jest.fn() as NextFunction;

        await validateJWTClient(req, {} as Response, next);

        expect(mockGetSession).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(expect.objectContaining({
            code: AUTH_ERROR_CODES.SESSION_EXPIRADA,
            statusCode: 401,
        }));
    });

    it('rejects access and server tokens whose session IDs do not match', async () => {
        mockVerifyToken
            .mockReturnValueOnce('server-session')
            .mockReturnValueOnce('different-user-session');
        const req = {
            headers: {
                'x-server-token': 'Bearer server-token',
                authorization: 'Bearer access-token',
            },
        } as unknown as Request;
        const next = jest.fn() as NextFunction;

        await validateJWTClient(req, {} as Response, next);

        expect(mockVerifyUserDevice).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(expect.objectContaining({
            code: AUTH_ERROR_CODES.TOKEN_CLIENTE_INVALIDO,
            statusCode: 401,
        }));
    });

    it('rejects a missing refresh token with the existing refresh-expired code', async () => {
        const req = { body: {} } as Request;
        const next = jest.fn() as NextFunction;

        await validateRefreshToken(req, {} as Response, next);

        expect(mockGetSession).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(expect.objectContaining({
            code: AUTH_ERROR_CODES.REFRESH_TOKEN_EXPIRADO,
            statusCode: 401,
        }));
    });

    it('rejects a malformed refresh token with the existing invalid-token code', async () => {
        mockVerifyToken.mockImplementation(() => {
            throw new jwt.JsonWebTokenError('malformed token');
        });
        const req = { body: { refreshToken: 'malformed' } } as Request;
        const next = jest.fn() as NextFunction;

        await validateRefreshToken(req, {} as Response, next);

        expect(next).toHaveBeenCalledWith(expect.objectContaining({
            code: AUTH_ERROR_CODES.REFRESH_TOKEN_INVALIDO,
            statusCode: 401,
        }));
    });

    it('rejects an expired refresh token with the existing refresh-expired code', async () => {
        mockVerifyToken.mockImplementation(() => {
            throw new jwt.TokenExpiredError('jwt expired', new Date());
        });
        const req = { body: { refreshToken: 'expired' } } as Request;
        const next = jest.fn() as NextFunction;

        await validateRefreshToken(req, {} as Response, next);

        expect(next).toHaveBeenCalledWith(expect.objectContaining({
            code: AUTH_ERROR_CODES.REFRESH_TOKEN_EXPIRADO,
            statusCode: 401,
        }));
    });
});
