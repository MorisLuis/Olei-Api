import { getDeploymentErrorMessage } from '../../../src/database/sqlDeployment/errors';

describe('getDeploymentErrorMessage', () => {
    it('returns ordinary SQL Server errors unchanged', () => {
        expect(getDeploymentErrorMessage(new Error("Invalid column name 'PrecioNuevo'")))
            .toBe("Invalid column name 'PrecioNuevo'");
    });

    it('redacts credentials from connection-style error messages', () => {
        expect(getDeploymentErrorMessage(
            new Error('server=SQL01;user=admin;password=secret;database=TENANT')
        )).toBe('server=SQL01;user=<redacted>;password=<redacted>;database=TENANT');
    });

    it('handles unknown thrown values safely', () => {
        expect(getDeploymentErrorMessage('failure')).toBe('Unknown deployment error');
    });
});
