import sql from 'mssql';

import { loginAppService } from '../../../../src/services/auth/client/loginApp.service';
import { dbConnection } from '../../../../src/database';
import { ValidationError, UnauthorizedError } from '../../../../src/errors/CustomError';
import { sanitizeServerSessionUser } from '../../../../src/controllers/auth/utils/sessionResponse';
import { updateSession } from '../../../../src/services/auth/database/session.service';
import {
    generateAccessToken,
    generateRefreshToken,
} from '../../../../src/services/auth/client/token.service';

jest.mock('../../../../src/database', () => ({
    dbConnection: jest.fn(),
}));

jest.mock('../../../../src/controllers/auth/utils/sessionResponse', () => ({
    sanitizeServerSessionUser: jest.fn(),
}));

jest.mock('../../../../src/services/auth/database/session.service', () => ({
    updateSession: jest.fn(),
}));

jest.mock('../../../../src/services/auth/client/token.service', () => ({
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
}));

jest.mock('mssql', () => ({
    __esModule: true,
    default: {
        VarChar: jest.fn((size: number) => `VarChar(${size})`),
    },
}));

describe('loginAppService', () => {
    const mockDbConnection = dbConnection as jest.MockedFunction<typeof dbConnection>;
    const mockSanitizeServerSessionUser = sanitizeServerSessionUser as jest.MockedFunction<typeof sanitizeServerSessionUser>;
    const mockUpdateSession = updateSession as jest.MockedFunction<typeof updateSession>;
    const mockGenerateAccessToken = generateAccessToken as jest.MockedFunction<typeof generateAccessToken>;
    const mockGenerateRefreshToken = generateRefreshToken as jest.MockedFunction<typeof generateRefreshToken>;
    const mockVarChar = sql.VarChar as jest.Mock;

    const baseSession = {
        ServidorSQL: 'SERVER',
        BaseSQL: 'DB',
        UsuarioSQL: 'USER',
        PasswordSQL: 'PASS',
        IdUsuarioOLEI: 'OLEI-001',
        RazonSocial: 'OLEI S.A.',
        SwImagenes: true,
        Vigencia: new Date('2027-01-01T00:00:00.000Z'),
        from: 'mobil' as const,
        serverConected: true,
        userConected: false,
    };

    const buildPool = (result: unknown) => {
        const execute = jest.fn().mockResolvedValue(result);
        const requestBuilder = {
            input: jest.fn().mockReturnThis(),
            execute,
        };

        const request = jest.fn().mockReturnValue(requestBuilder);

        return {
            pool: { request },
            request,
            input: requestBuilder.input,
            execute,
        };
    };

    beforeEach(() => {
        jest.clearAllMocks();

        mockVarChar.mockImplementation((size: number) => `VarChar(${size})`);
        mockUpdateSession.mockResolvedValue({} as never);
        mockGenerateAccessToken.mockReturnValue('access-token-123');
        mockGenerateRefreshToken.mockReturnValue('refresh-token-123');
        mockSanitizeServerSessionUser.mockReturnValue({ IdUsuarioOLEI: 'OLEI-001' } as never);
    });

    it('returns sanitized user with tokens when credentials are valid', async () => {
        const authResult = {
            recordset: [
                {
                    Id_Perfil: 2,
                    TodosAlmacenes: 1,
                    SalidaSinExistencias: 0,
                    Id_Almacen: 7,
                    AlmacenNombre: 'Main Warehouse',
                    Id_ListPre: 10,
                },
            ],
        };

        const { pool, request, input, execute } = buildPool(authResult);
        const sanitizedUser = {
            IdUsuarioOLEI: 'OLEI-001',
            Id_UsuarioOLEI: 'app-user',
            userConected: true,
        };

        mockDbConnection.mockResolvedValue(pool as never);
        mockSanitizeServerSessionUser.mockReturnValue(sanitizedUser as never);

        const result = await loginAppService({
            sessionId: 'session-123',
            session: baseSession,
            Id_Usuario: '  app-user  ',
            password: 'app-pass',
        });

        expect(mockDbConnection).toHaveBeenCalledWith('SERVER', 'DB', 'USER', 'PASS');
        expect(request).toHaveBeenCalledTimes(1);
        expect(mockVarChar).toHaveBeenCalledWith(50);
        expect(input).toHaveBeenCalledWith('Id_Usuario', 'VarChar(50)', '  app-user  ');
        expect(input).toHaveBeenCalledWith('Password', 'VarChar(50)', 'app-pass');
        expect(execute).toHaveBeenCalledWith('sp_AuthenticateAndGetMovement');

        expect(mockUpdateSession).toHaveBeenCalledWith(
            'session-123',
            expect.objectContaining({
                Id_UsuarioOLEI: 'app-user',
                userRol: 2,
                TodosAlmacenes: 1,
                SalidaSinExistencias: 0,
                Id_Almacen: 7,
                AlmacenNombre: 'Main Warehouse',
                serverConected: true,
                userConected: true,
            }),
        );

        expect(mockGenerateAccessToken).toHaveBeenCalledWith('session-123');
        expect(mockGenerateRefreshToken).toHaveBeenCalledWith('session-123');
        expect(mockSanitizeServerSessionUser).toHaveBeenCalledTimes(1);

        expect(result).toEqual({
            user: sanitizedUser,
            token: 'access-token-123',
            refreshToken: 'refresh-token-123',
        });
    });

    it('throws ValidationError when Id_Usuario is empty after trim', async () => {
        const promise = loginAppService({
            sessionId: 'session-123',
            session: baseSession,
            Id_Usuario: '   ',
            password: 'app-pass',
        });

        await expect(promise).rejects.toBeInstanceOf(ValidationError);
        await expect(promise).rejects.toThrow('Necesario escribir usuario y contraseña');
        expect(mockDbConnection).not.toHaveBeenCalled();
    });

    it('throws ValidationError when password is empty after trim', async () => {
        const promise = loginAppService({
            sessionId: 'session-123',
            session: baseSession,
            Id_Usuario: 'app-user',
            password: '   ',
        });

        await expect(promise).rejects.toBeInstanceOf(ValidationError);
        await expect(promise).rejects.toThrow('Necesario escribir usuario y contraseña');
        expect(mockDbConnection).not.toHaveBeenCalled();
    });

    it('throws ValidationError when SQL connection is unavailable', async () => {
        mockDbConnection.mockResolvedValue(null as never);

        const promise = loginAppService({
            sessionId: 'session-123',
            session: baseSession,
            Id_Usuario: 'app-user',
            password: 'app-pass',
        });

        await expect(promise).rejects.toBeInstanceOf(ValidationError);
        await expect(promise).rejects.toThrow('Error al conectarse a base de datos principal');
    });

    it('throws UnauthorizedError when authenticator returns an empty recordset', async () => {
        const { pool } = buildPool({ recordset: [] });
        mockDbConnection.mockResolvedValue(pool as never);

        const promise = loginAppService({
            sessionId: 'session-123',
            session: baseSession,
            Id_Usuario: 'app-user',
            password: 'app-pass',
        });

        await expect(promise).rejects.toBeInstanceOf(UnauthorizedError);
        await expect(promise).rejects.toThrow('Respuesta inválida del autenticador');
    });

    it('throws UnauthorizedError when recordset is not an array', async () => {
        const { pool } = buildPool({
            recordset: null,
        });
        mockDbConnection.mockResolvedValue(pool as never);

        const promise = loginAppService({
            sessionId: 'session-123',
            session: baseSession,
            Id_Usuario: 'app-user',
            password: 'app-pass',
        });

        await expect(promise).rejects.toBeInstanceOf(UnauthorizedError);
        await expect(promise).rejects.toThrow('Respuesta inválida del autenticador');
    });

    it('throws UnauthorizedError when recordset is undefined', async () => {
        const { pool } = buildPool({
            recordset: undefined,
        });
        mockDbConnection.mockResolvedValue(pool as never);

        const promise = loginAppService({
            sessionId: 'session-123',
            session: baseSession,
            Id_Usuario: 'app-user',
            password: 'app-pass',
        });

        await expect(promise).rejects.toBeInstanceOf(UnauthorizedError);
        await expect(promise).rejects.toThrow('Respuesta inválida del autenticador');
    });

    it('propagates SQL execution failures', async () => {
        const executeError = new Error('stored procedure failed');
        const requestBuilder = {
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockRejectedValue(executeError),
        };
        const pool = {
            request: jest.fn().mockReturnValue(requestBuilder),
        };

        mockDbConnection.mockResolvedValue(pool as never);

        const promise = loginAppService({
            sessionId: 'session-123',
            session: baseSession,
            Id_Usuario: 'app-user',
            password: 'app-pass',
        });

        await expect(promise).rejects.toThrow(executeError);
    });

    it('propagates session update failures', async () => {
        const { pool } = buildPool({
            recordset: [
                {
                    Id_Perfil: 2,
                    TodosAlmacenes: 1,
                    SalidaSinExistencias: 0,
                    Id_Almacen: 7,
                    AlmacenNombre: 'Main Warehouse',
                    Id_ListPre: 10,
                },
            ],
        });
        const redisError = new Error('redis unavailable');

        mockDbConnection.mockResolvedValue(pool as never);
        mockUpdateSession.mockRejectedValue(redisError);

        const promise = loginAppService({
            sessionId: 'session-123',
            session: baseSession,
            Id_Usuario: 'app-user',
            password: 'app-pass',
        });

        await expect(promise).rejects.toThrow(redisError);
    });

    it('propagates token generation failures', async () => {
        const { pool } = buildPool({
            recordset: [
                {
                    Id_Perfil: 2,
                    TodosAlmacenes: 1,
                    SalidaSinExistencias: 0,
                    Id_Almacen: 7,
                    AlmacenNombre: 'Main Warehouse',
                    Id_ListPre: 10,
                },
            ],
        });

        const tokenError = new Error('jwt error');
        mockDbConnection.mockResolvedValue(pool as never);
        mockGenerateAccessToken.mockImplementation(() => {
            throw tokenError;
        });

        const promise = loginAppService({
            sessionId: 'session-123',
            session: baseSession,
            Id_Usuario: 'app-user',
            password: 'app-pass',
        });

        await expect(promise).rejects.toThrow(tokenError);
    });

    it('propagates database connection failures', async () => {
        const dbError = new Error('database unavailable');
        mockDbConnection.mockRejectedValue(dbError);

        const promise = loginAppService({
            sessionId: 'session-123',
            session: baseSession,
            Id_Usuario: 'app-user',
            password: 'app-pass',
        });

        await expect(promise).rejects.toThrow(dbError);
    });
});
