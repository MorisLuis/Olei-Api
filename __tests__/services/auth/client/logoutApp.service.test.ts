import sql from 'mssql';

import { logoutAppService } from '../../../../src/services/auth/client/logoutApp.service';
import { dbConnection } from '../../../../src/database';
import { updateSession } from '../../../../src/services/auth/database/session.service';
import { usersQuery } from '../../../../src/database/querys/users';
import type { UserSessionInterface } from '../../../../src/interface/user';

jest.mock('../../../../src/database', () => ({ dbConnection: jest.fn() }));
jest.mock('../../../../src/services/auth/database/session.service', () => ({ updateSession: jest.fn() }));
jest.mock('mssql', () => ({
    __esModule: true,
    default: { VarChar: jest.fn((size: number) => `VarChar(${size})`) },
}));

describe('logoutAppService revocation ordering', () => {
    const mockDbConnection = dbConnection as jest.MockedFunction<typeof dbConnection>;
    const mockUpdateSession = updateSession as jest.MockedFunction<typeof updateSession>;
    const mockVarChar = sql.VarChar as jest.Mock;

    const connectedSession: UserSessionInterface = {
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
        Id_Equipo: 'DEVICE-A',
        userRol: 2,
        Id_Almacen: 7,
    };

    const buildPool = () => {
        const query = jest.fn().mockResolvedValue({ rowsAffected: [1] });
        const input = jest.fn().mockReturnValue({ query });
        const request = jest.fn().mockReturnValue({ input });
        return { pool: { request }, request, input, query };
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockVarChar.mockImplementation((size: number) => `VarChar(${size})`);
        mockUpdateSession.mockResolvedValue(connectedSession);
    });

    it('revokes SQL first, then marks the Redis session logged out', async () => {
        const { pool, input, query } = buildPool();
        mockDbConnection.mockResolvedValue(pool as never);

        const result = await logoutAppService({
            sessionId: 'session-a',
            session: connectedSession,
        });

        expect(mockDbConnection).toHaveBeenCalledWith('SERVER', 'DATABASE', 'USER', 'PASSWORD');
        expect(input).toHaveBeenCalledWith('Id_Usuario', 'VarChar(50)', 'app-user');
        expect(query).toHaveBeenCalledWith(usersQuery.updateUserSession);
        expect(query.mock.invocationCallOrder[0]).toBeLessThan(mockUpdateSession.mock.invocationCallOrder[0]);
        expect(mockUpdateSession).toHaveBeenCalledWith('session-a', expect.objectContaining({
            Id_UsuarioOLEI: '',
            userConected: false,
            userRol: 0,
            Id_Almacen: 0,
        }));
        expect(result.user).toEqual(expect.objectContaining({
            Id_UsuarioOLEI: '',
            userConected: false,
        }));
    });

    it('does not update Redis when SQL revocation fails', async () => {
        const sqlFailure = new Error('SQL revocation failed');
        const { pool, query } = buildPool();
        query.mockRejectedValue(sqlFailure);
        mockDbConnection.mockResolvedValue(pool as never);

        await expect(logoutAppService({
            sessionId: 'session-a',
            session: connectedSession,
        })).rejects.toBe(sqlFailure);

        expect(mockUpdateSession).not.toHaveBeenCalled();
    });

    it('preserves the Redis failure after SQL revocation succeeds', async () => {
        const redisFailure = new Error('Redis update failed');
        const { pool, query } = buildPool();
        mockDbConnection.mockResolvedValue(pool as never);
        mockUpdateSession.mockRejectedValue(redisFailure);

        await expect(logoutAppService({
            sessionId: 'session-a',
            session: connectedSession,
        })).rejects.toBe(redisFailure);

        expect(query).toHaveBeenCalledTimes(1);
    });

    it('repeats the idempotent SQL and Redis clearing operations for an already logged-out session', async () => {
        const loggedOutSession = {
            ...connectedSession,
            Id_UsuarioOLEI: '',
            userConected: false,
        };
        const { pool, input, query } = buildPool();
        mockDbConnection.mockResolvedValue(pool as never);

        await expect(logoutAppService({
            sessionId: 'session-a',
            session: loggedOutSession,
        })).resolves.toEqual({ user: expect.objectContaining({ userConected: false }) });

        expect(input).toHaveBeenCalledWith('Id_Usuario', 'VarChar(50)', '');
        expect(query).toHaveBeenCalledWith(usersQuery.updateUserSession);
        expect(mockUpdateSession).toHaveBeenCalledTimes(1);
    });
});
