import {
    generateRedisSession,
    getRedisSession,
    updateSession,
} from '../../../../src/services/auth/database/session.service';
import redisClient from '../../../../src/config/redisClient';
import { AppError, NotFoundError, UnauthorizedError } from '../../../../src/errors/CustomError';
import type { UserSessionInterface } from '../../../../src/interface/user';

jest.mock('../../../../src/config/redisClient', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        set: jest.fn(),
        ttl: jest.fn(),
    },
}));

describe('session.service', () => {
    const mockRedisGet = redisClient.get as jest.MockedFunction<typeof redisClient.get>;
    const mockRedisSet = redisClient.set as jest.MockedFunction<typeof redisClient.set>;
    const mockRedisTtl = redisClient.ttl as jest.MockedFunction<typeof redisClient.ttl>;

    const baseSession: UserSessionInterface = {
        ServidorSQL: 'SERVER',
        BaseSQL: 'DB',
        UsuarioSQL: 'USER',
        PasswordSQL: 'PASS',
        IdUsuarioOLEI: 'user01',
        RazonSocial: 'CLIENTE',
        SwImagenes: true,
        Vigencia: new Date('2027-01-01T00:00:00.000Z'),
        from: 'mobil',
        serverConected: true,
        userConected: false,
    };

    const storedSession = {
        ...baseSession,
        Vigencia: baseSession.Vigencia.toISOString(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getRedisSession', () => {
        it('returns parsed session when key exists in Redis', async () => {
            mockRedisGet.mockResolvedValueOnce(JSON.stringify(storedSession));

            const result = await getRedisSession('session-123');

            expect(mockRedisGet).toHaveBeenCalledWith('session:session-123');
            expect(result).toEqual(storedSession);
        });

        it('throws NotFoundError when key does not exist in Redis', async () => {
            mockRedisGet.mockResolvedValueOnce(null);
            const promise = getRedisSession('missing-session');

            await expect(promise).rejects.toBeInstanceOf(UnauthorizedError);
            await expect(promise).rejects.toHaveProperty(
                'message',
                'Sesión no encontrada en Redis',
            );
        });

        it('throws AppError when Redis returns invalid JSON payload', async () => {
            mockRedisGet.mockResolvedValueOnce('{invalid-json');
            const promise = getRedisSession('bad-json');

            await expect(promise).rejects.toBeInstanceOf(AppError);
            await expect(promise).rejects.toHaveProperty(
                'message',
                expect.stringContaining('Error en getRedisSession'),
            );
        });
    });

    describe('generateRedisSession', () => {
        it('stores session with 1 year TTL', async () => {
            mockRedisSet.mockResolvedValueOnce('OK');

            await expect(generateRedisSession('session-123', baseSession)).resolves.toBeUndefined();

            expect(mockRedisSet).toHaveBeenCalledWith(
                'session:session-123',
                JSON.stringify(baseSession),
                'EX',
                60 * 60 * 24 * 365,
            );
        });

        it('throws AppError when Redis set does not return OK', async () => {
            mockRedisSet.mockResolvedValueOnce('NOPE' as never);
            const promise = generateRedisSession('session-123', baseSession);

            await expect(promise).rejects.toBeInstanceOf(AppError);
            await expect(promise).rejects.toHaveProperty(
                'message',
                'Error al generar la sesión en Redis',
            );
        });

        it('wraps Redis failures in AppError with context', async () => {
            mockRedisSet.mockRejectedValueOnce(new Error('redis down'));
            const promise = generateRedisSession('session-123', baseSession);

            await expect(promise).rejects.toBeInstanceOf(AppError);
            await expect(promise).rejects.toHaveProperty(
                'message',
                'Error en generateRedisSession: redis down',
            );
        });
    });

    describe('updateSession', () => {
        it('updates and returns merged session preserving ttl', async () => {
            const partialUpdate: Partial<UserSessionInterface> = {
                userConected: true,
                from: 'web',
            };

            mockRedisGet.mockResolvedValueOnce(JSON.stringify(storedSession));
            mockRedisTtl.mockResolvedValueOnce(120);
            mockRedisSet.mockResolvedValueOnce('OK');

            const result = await updateSession('session-123', partialUpdate);

            expect(mockRedisGet).toHaveBeenCalledWith('session:session-123');
            expect(mockRedisTtl).toHaveBeenCalledWith('session:session-123');
            expect(mockRedisSet).toHaveBeenCalledWith(
                'session:session-123',
                JSON.stringify({ ...baseSession, ...partialUpdate }),
                'EX',
                120,
            );
            expect(result).toEqual({ ...storedSession, ...partialUpdate });
        });

        it('throws NotFoundError when existing session does not exist', async () => {
            mockRedisGet.mockResolvedValueOnce(null);
            const promise = updateSession('missing-session', { userConected: true });

            await expect(promise).rejects.toBeInstanceOf(
                UnauthorizedError,
            );
            await expect(promise).rejects.toHaveProperty(
                'message',
                'Sesión no encontrada en Redis',
            );

            expect(mockRedisTtl).not.toHaveBeenCalled();
            expect(mockRedisSet).not.toHaveBeenCalled();
        });

        it('throws NotFoundError when session ttl is -2 (expired)', async () => {
            mockRedisGet.mockResolvedValueOnce(JSON.stringify(storedSession));
            mockRedisTtl.mockResolvedValueOnce(-2);
            const promise = updateSession('expired-session', { userConected: true });

            await expect(promise).rejects.toBeInstanceOf(
                NotFoundError,
            );
            await expect(promise).rejects.toHaveProperty(
                'message',
                'Sesión ya expiró',
            );

            expect(mockRedisSet).not.toHaveBeenCalled();
        });

        it('throws AppError when session ttl is -1 (no expiration)', async () => {
            mockRedisGet.mockResolvedValueOnce(JSON.stringify(storedSession));
            mockRedisTtl.mockResolvedValueOnce(-1);
            const promise = updateSession('no-ttl-session', { userConected: true });

            await expect(promise).rejects.toBeInstanceOf(
                AppError,
            );
            await expect(promise).rejects.toHaveProperty(
                'message',
                'La sesión no tiene TTL y no se puede conservar',
            );

            expect(mockRedisSet).not.toHaveBeenCalled();
        });

        it('throws AppError when Redis update does not return OK', async () => {
            mockRedisGet.mockResolvedValueOnce(JSON.stringify(storedSession));
            mockRedisTtl.mockResolvedValueOnce(300);
            mockRedisSet.mockResolvedValueOnce('NOPE' as never);
            const promise = updateSession('session-123', { userConected: true });

            await expect(promise).rejects.toBeInstanceOf(AppError);
            await expect(promise).rejects.toHaveProperty(
                'message',
                'Error al actualizar la sesión en Redis',
            );
        });

        it('wraps ttl failures in AppError with updateSession context', async () => {
            mockRedisGet.mockResolvedValueOnce(JSON.stringify(storedSession));
            mockRedisTtl.mockRejectedValueOnce(new Error('ttl failed'));
            const promise = updateSession('session-123', { userConected: true });

            await expect(promise).rejects.toBeInstanceOf(AppError);
            await expect(promise).rejects.toHaveProperty(
                'message',
                'Error en updateSession: ttl failed',
            );
        });
    });
});
