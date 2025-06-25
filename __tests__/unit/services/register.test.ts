import { register } from '../../../src/test/register';
import * as userService from '../../../src/test/userService';

jest.mock('../../../src/test/userService');

describe( 'register', () => {
    it('should call saveUser', () => {
        register('Morado')
        
        expect(userService.saveUser).toHaveBeenCalledWith('Morado')
    })
})