import sql from 'mssql';

import { verifyUserDevice } from '../../../../src/services/auth/client/verifyUserDevice.service';
import { dbConnection } from '../../../../src/database';
import type { UserSessionInterface } from '../../../../src/interface/user';

jest.mock('../../../../src/database', () => ({ dbConnection: jest.fn() }));
jest.mock('mssql', () => ({
    __esModule: true,
    default: { VarChar: jest.fn((size: number) => `VarChar(${size})`) },
}));

describe('verifyUserDevice', () => {
    const mockDbConnection = dbConnection as jest.MockedFunction<typeof dbConnection>;
    const mockVarChar = sql.VarChar as jest.Mock;
    const session: UserSessionInterface = {
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
    };

    const useRecordset = (recordset: unknown) => {
        const query = jest.fn().mockResolvedValue({ recordset });
        const input = jest.fn().mockReturnValue({ query });
        const request = jest.fn().mockReturnValue({ input });
        mockDbConnection.mockResolvedValue({ request } as never);
        return { input, query };
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockVarChar.mockImplementation((size: number) => `VarChar(${size})`);
    });

    it('accepts an active user whose SQL device matches the Redis session device', async () => {
        const { input, query } = useRecordset([{ IdEquipo: 'device-a', SwActivo: 1 }]);

        await expect(verifyUserDevice(session)).resolves.toBe(true);

        expect(mockDbConnection).toHaveBeenCalledWith('SERVER', 'DATABASE', 'USER', 'PASSWORD');
        expect(input).toHaveBeenCalledWith('Id_Usuario', 'VarChar(50)', 'app-user');
        expect(query).toHaveBeenCalledWith(expect.stringContaining('WHERE Id_Usuario = @Id_Usuario'));
    });

    it.each([
        ['inactive user', { IdEquipo: 'DEVICE-A', SwActivo: 0 }, session],
        ['different SQL device', { IdEquipo: 'DEVICE-B', SwActivo: 1 }, session],
        ['missing SQL device', { IdEquipo: null, SwActivo: 1 }, session],
        ['missing session device', { IdEquipo: 'DEVICE-A', SwActivo: 1 }, { ...session, Id_Equipo: undefined }],
    ])('rejects %s', async (_case, dbUser, candidateSession) => {

        useRecordset([dbUser]);
        await expect(verifyUserDevice(candidateSession as UserSessionInterface)).resolves.toBe(false);

    });

    it('rejects a missing or malformed SQL user result', async () => {
        useRecordset(null);
        await expect(verifyUserDevice(session)).resolves.toBe(false);
    });

    it('propagates tenant database failures to the authentication middleware', async () => {
        const failure = new Error('tenant database unavailable');
        mockDbConnection.mockRejectedValue(failure);
        await expect(verifyUserDevice(session)).rejects.toBe(failure);
    });
});
