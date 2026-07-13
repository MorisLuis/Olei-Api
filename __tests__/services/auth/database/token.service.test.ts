describe('generateAccessTokenServer', () => {
    const ORIGINAL_ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...ORIGINAL_ENV };
    });

    afterAll(() => {
        process.env = ORIGINAL_ENV;
    });

    it('throws when ACCESS_TOKEN_SEVER_SECRET is missing', async () => {
        delete process.env.ACCESS_TOKEN_SEVER_SECRET;

        const { generateAccessTokenServer } = await import('../../../../src/services/auth/database/token.service');

        expect(() => generateAccessTokenServer('session-123')).toThrow('Missing ACCESS_TOKEN_SEVER_SECRET');
    });

    it('signs JWT with expected payload, secret, and options', async () => {
        process.env.ACCESS_TOKEN_SEVER_SECRET = 'super-secret';
        process.env.JWT_ACCESS_ISSUER = 'olei-api';
        process.env.JWT_ACCESS_AUDIENCE = 'olei-client';
        process.env.JWT_ACCESS_SUBJECT = 'access-token';

        const signMock = jest.fn().mockReturnValue('token-server-123');

        jest.doMock('jsonwebtoken', () => ({
            __esModule: true,
            default: {
                sign: signMock,
            },
        }));

        const { generateAccessTokenServer } = await import('../../../../src/services/auth/database/token.service');

        const token = generateAccessTokenServer('session-123');

        expect(signMock).toHaveBeenCalledWith(
            { sessionId: 'session-123' },
            'super-secret',
            {
                algorithm: 'HS256',
                expiresIn: '1y',
                issuer: 'olei-api',
                audience: 'olei-client',
                subject: 'access-token',
            },
        );
        expect(token).toBe('token-server-123');
    });

    it('passes undefined optional JWT metadata when env vars are not present', async () => {
        process.env.ACCESS_TOKEN_SEVER_SECRET = 'super-secret';
        delete process.env.JWT_ACCESS_ISSUER;
        delete process.env.JWT_ACCESS_AUDIENCE;
        delete process.env.JWT_ACCESS_SUBJECT;

        const signMock = jest.fn().mockReturnValue('token-server-456');

        jest.doMock('jsonwebtoken', () => ({
            __esModule: true,
            default: {
                sign: signMock,
            },
        }));

        const { generateAccessTokenServer } = await import('../../../../src/services/auth/database/token.service');

        const token = generateAccessTokenServer('session-456');

        expect(signMock).toHaveBeenCalledWith(
            { sessionId: 'session-456' },
            'super-secret',
            {
                algorithm: 'HS256',
                expiresIn: '1y',
                issuer: undefined,
                audience: undefined,
                subject: undefined,
            },
        );
        expect(token).toBe('token-server-456');
    });
});
