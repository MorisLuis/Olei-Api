import { loginDB } from '../../../../src/services/auth/database/auth.service';
import { dbConnectionMain, querys } from '../../../../src/database';
import { UnauthorizedError, ValidationError } from '../../../../src/errors/CustomError';
import { sanitizeServerSessionUser } from '../../../../src/controllers/auth/utils/sessionResponse';
import { generateRedisSession } from '../../../../src/services/auth/database/session.service';
import { generateAccessTokenServer } from '../../../../src/services/auth/database/token.service';
import { v4 } from 'uuid';
import sql from 'mssql';

jest.mock('../../../../src/database', () => ({
    dbConnectionMain: jest.fn(),
    querys: {
        authDatabase: 'SELECT * FROM CLIENTES WHERE IdUsuarioOLEI = @IdUsuarioOLEI'
    }
}));

jest.mock('../../../../src/controllers/auth/utils/sessionResponse', () => ({
    sanitizeServerSessionUser: jest.fn(),
}));

jest.mock('../../../../src/services/auth/database/session.service', () => ({
    generateRedisSession: jest.fn(),
}));

jest.mock('../../../../src/services/auth/database/token.service', () => ({
    generateAccessTokenServer: jest.fn(),
}));

jest.mock('uuid', () => ({
    v4: jest.fn(),
}));

jest.mock('mssql', () => ({
    __esModule: true,
    default: {
        VarChar: jest.fn((size: number) => `VarChar(${size})`),
    },
}));

describe('loginDB service', () => {
    const mockDbConnectionMain = dbConnectionMain as jest.MockedFunction<typeof dbConnectionMain>;
    const mockSanitizeServerSessionUser = sanitizeServerSessionUser as jest.MockedFunction<typeof sanitizeServerSessionUser>;
    const mockGenerateRedisSession = generateRedisSession as jest.MockedFunction<typeof generateRedisSession>;
    const mockGenerateAccessTokenServer = generateAccessTokenServer as jest.MockedFunction<typeof generateAccessTokenServer>;
    const mockV4 = v4 as jest.MockedFunction<typeof v4>;
    const mockVarChar = sql.VarChar as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        mockVarChar.mockImplementation((size: number) => `VarChar(${size})`);
        mockV4.mockReturnValue('session-123');
        mockGenerateRedisSession.mockResolvedValue(undefined);
        mockGenerateAccessTokenServer.mockReturnValue('token-server-123');
    });

    it('returns the user when credentials are valid', async () => {
        const dbUser = {
            IdOLEI: 1,
            PasswordOLEI: 'secret',
            IdUsuarioOLEI: 'user01',
            ServidorSQL: 'SERVER',
            BaseSQL: 'DB',
            UsuarioSQL: 'USER',
            PasswordSQL: 'PASS',
            RazonSocial: 'CLIENTE',
            SwImagenes: true,
            Vigencia: '2027-01-01',
            Id_ListPre: 3,
        };
        const sanitizedUser = {
            IdUsuarioOLEI: 'user01',
            RazonSocial: 'CLIENTE',
            BaseSQL: 'DB',
        };

        const query = jest.fn().mockResolvedValue({ recordset: [dbUser] });
        const input = jest.fn().mockReturnValue({ query });
        const request = jest.fn().mockReturnValue({ input });

        mockDbConnectionMain.mockResolvedValue({ request } as never);
        mockSanitizeServerSessionUser.mockReturnValue(sanitizedUser as never);

        const result = await loginDB({
            IdUsuarioOLEI: 'user01',
            PasswordOLEI: 'secret',
        });

        expect(mockDbConnectionMain).toHaveBeenCalledTimes(1);
        expect(request).toHaveBeenCalledTimes(1);
        expect(mockVarChar).toHaveBeenCalledWith(50);
        expect(input).toHaveBeenCalledWith('IdUsuarioOLEI', 'VarChar(50)', 'user01');
        expect(query).toHaveBeenCalledWith(querys.authDatabase);

        expect(mockSanitizeServerSessionUser).toHaveBeenCalledWith({
            ServidorSQL: 'SERVER',
            BaseSQL: 'DB',
            UsuarioSQL: 'USER',
            PasswordSQL: 'PASS',
            IdUsuarioOLEI: 'user01',
            RazonSocial: 'CLIENTE',
            SwImagenes: true,
            Vigencia: '2027-01-01',
            Id_ListPre: 3,
            from: 'mobil',
            userConected: false,
            serverConected: true,
        });

        expect(mockV4).toHaveBeenCalledTimes(1);
        expect(mockGenerateRedisSession).toHaveBeenCalledWith('session-123', {
            ServidorSQL: 'SERVER',
            BaseSQL: 'DB',
            UsuarioSQL: 'USER',
            PasswordSQL: 'PASS',
            IdUsuarioOLEI: 'user01',
            RazonSocial: 'CLIENTE',
            SwImagenes: true,
            Vigencia: '2027-01-01',
            Id_ListPre: 3,
            from: 'mobil',
            userConected: false,
            serverConected: true,
        });
        expect(mockGenerateAccessTokenServer).toHaveBeenCalledWith('session-123');

        expect(result).toEqual({
            user: sanitizedUser,
            tokenServer: 'token-server-123',
        });
    });

    it('throws ValidationError when user is missing', async () => {
        await expect(
            loginDB({
                IdUsuarioOLEI: '   ',
                PasswordOLEI: 'secret',
            }),
        ).rejects.toBeInstanceOf(ValidationError);

        await expect(
            loginDB({
                IdUsuarioOLEI: '   ',
                PasswordOLEI: 'secret',
            }),
        ).rejects.toThrow('Necesario enviar usuario y contraseña');

        expect(mockDbConnectionMain).not.toHaveBeenCalled();
    });

    it('throws ValidationError when password is missing', async () => {
        await expect(
            loginDB({
                IdUsuarioOLEI: 'user01',
                PasswordOLEI: '   ',
            }),
        ).rejects.toBeInstanceOf(ValidationError);

        expect(mockDbConnectionMain).not.toHaveBeenCalled();
    });

    it('throws ValidationError when main connection is unavailable', async () => {
        mockDbConnectionMain.mockResolvedValue(null as never);

        await expect(
            loginDB({
                IdUsuarioOLEI: 'user01',
                PasswordOLEI: 'secret',
            }),
        ).rejects.toThrow('Error al conectarse a base de datos principal');
    });

    it('throws UnauthorizedError when user is not found', async () => {
        const query = jest.fn().mockResolvedValue({ recordset: [] });
        const input = jest.fn().mockReturnValue({ query });
        const request = jest.fn().mockReturnValue({ input });

        mockDbConnectionMain.mockResolvedValue({ request } as never);

        await expect(
            loginDB({
                IdUsuarioOLEI: 'user01',
                PasswordOLEI: 'secret',
            }),
        ).rejects.toBeInstanceOf(UnauthorizedError);

        await expect(
            loginDB({
                IdUsuarioOLEI: 'user01',
                PasswordOLEI: 'secret',
            }),
        ).rejects.toThrow('Credenciales inválidas');
    });

    it('throws UnauthorizedError when password does not match', async () => {
        const query = jest.fn().mockResolvedValue({
            recordset: [{
                IdUsuarioOLEI: 'user01',
                PasswordOLEI: 'different-password',
                ServidorSQL: 'SERVER',
                BaseSQL: 'DB',
                UsuarioSQL: 'USER',
                PasswordSQL: 'PASS',
                RazonSocial: 'CLIENTE',
                SwImagenes: true,
                Vigencia: '2027-01-01',
                Id_ListPre: 3,
            }]
        });
        const input = jest.fn().mockReturnValue({ query });
        const request = jest.fn().mockReturnValue({ input });

        mockDbConnectionMain.mockResolvedValue({ request } as never);

        await expect(
            loginDB({
                IdUsuarioOLEI: 'user01',
                PasswordOLEI: 'secret',
            }),
        ).rejects.toBeInstanceOf(UnauthorizedError);
    });

    it('allows DB password with spaces when trimmed value matches', async () => {
        const dbUser = {
            IdUsuarioOLEI: 'user01',
            PasswordOLEI: ' secret ',
            ServidorSQL: 'SERVER',
            BaseSQL: 'DB',
            UsuarioSQL: 'USER',
            PasswordSQL: 'PASS',
            RazonSocial: 'CLIENTE',
            SwImagenes: true,
            Vigencia: '2027-01-01',
            Id_ListPre: 3,
        };
        const sanitizedUser = {
            IdUsuarioOLEI: 'user01',
            RazonSocial: 'CLIENTE',
        };

        const query = jest.fn().mockResolvedValue({ recordset: [dbUser] });
        const input = jest.fn().mockReturnValue({ query });
        const request = jest.fn().mockReturnValue({ input });

        mockDbConnectionMain.mockResolvedValue({ request } as never);
        mockSanitizeServerSessionUser.mockReturnValue(sanitizedUser as never);

        const result = await loginDB({
            IdUsuarioOLEI: 'user01',
            PasswordOLEI: 'secret',
        });

        expect(result).toEqual({
            user: sanitizedUser,
            tokenServer: 'token-server-123',
        });
    });

    it('propagates database connection errors', async () => {
        const dbError = new Error('db down');
        mockDbConnectionMain.mockRejectedValue(dbError);

        await expect(
            loginDB({
                IdUsuarioOLEI: 'user01',
                PasswordOLEI: 'secret',
            }),
        ).rejects.toThrow(dbError);
    });

    it('propagates query execution errors', async () => {
        const dbError = new Error('query failed');
        const query = jest.fn().mockRejectedValue(dbError);
        const input = jest.fn().mockReturnValue({ query });
        const request = jest.fn().mockReturnValue({ input });

        mockDbConnectionMain.mockResolvedValue({ request } as never);

        await expect(
            loginDB({
                IdUsuarioOLEI: 'user01',
                PasswordOLEI: 'secret',
            }),
        ).rejects.toThrow(dbError);
    });

    it('returns user when PasswordOLEI is absent in result (edge case)', async () => {
        const dbUser = {
            IdUsuarioOLEI: 'user01',
            ServidorSQL: 'SERVER',
            BaseSQL: 'DB',
            UsuarioSQL: 'USER',
            PasswordSQL: 'PASS',
            RazonSocial: 'CLIENTE',
            SwImagenes: true,
            Vigencia: '2027-01-01',
            Id_ListPre: 3,
        };
        const sanitizedUser = {
            IdUsuarioOLEI: 'user01',
            RazonSocial: 'CLIENTE',
        };

        const query = jest.fn().mockResolvedValue({ recordset: [dbUser] });
        const input = jest.fn().mockReturnValue({ query });
        const request = jest.fn().mockReturnValue({ input });

        mockDbConnectionMain.mockResolvedValue({ request } as never);
        mockSanitizeServerSessionUser.mockReturnValue(sanitizedUser as never);

        const result = await loginDB({
            IdUsuarioOLEI: 'user01',
            PasswordOLEI: 'secret',
        });

        expect(result).toEqual({
            user: sanitizedUser,
            tokenServer: 'token-server-123',
        });
    });

    it('propagates redis session errors', async () => {
        const dbUser = {
            IdUsuarioOLEI: 'user01',
            PasswordOLEI: 'secret',
            ServidorSQL: 'SERVER',
            BaseSQL: 'DB',
            UsuarioSQL: 'USER',
            PasswordSQL: 'PASS',
            RazonSocial: 'CLIENTE',
            SwImagenes: true,
            Vigencia: '2027-01-01',
            Id_ListPre: 3,
        };
        const query = jest.fn().mockResolvedValue({ recordset: [dbUser] });
        const input = jest.fn().mockReturnValue({ query });
        const request = jest.fn().mockReturnValue({ input });
        const redisError = new Error('redis failed');

        mockDbConnectionMain.mockResolvedValue({ request } as never);
        mockSanitizeServerSessionUser.mockReturnValue({ IdUsuarioOLEI: 'user01' } as never);
        mockGenerateRedisSession.mockRejectedValue(redisError);

        await expect(
            loginDB({
                IdUsuarioOLEI: 'user01',
                PasswordOLEI: 'secret',
            }),
        ).rejects.toThrow(redisError);
    });
});
