import * as userApi from '../../../src/test/userApi'
import { getUserGreeting } from '../../../src/test/userService';

jest.mock('../../../src/test/userApi')

describe('getUserGreeting', () => {

    it('return the greeting with the user name (resolved)', async () => {
        // 1. Preparamos la respuesta fake:
        const fakeUser: userApi.User = { id: 1, name: 'Luis' }; // ← ERROR: 'string' no es 'number'
        (userApi.fetchUser as jest.Mock).mockResolvedValue(fakeUser)

        // 2. Ejecutamos la funcion que queremos probar.
        const greeting = await getUserGreeting(1);

        // 3. Afirmaciones
        expect(userApi.fetchUser).toHaveBeenCalledWith(1);
        expect(greeting).toBe('Hola Luis!')

    });

    it('propagates an error when the API fails (rejected)', async () => {
        const boom = new Error('kaboom');
        (userApi.fetchUser as jest.Mock).mockRejectedValue(boom);
        await expect(getUserGreeting(1)).rejects.toThrow('kaboom');
    })
})