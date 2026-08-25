import { parseDeploymentArguments } from '../../../src/database/sqlDeployment/cli';

describe('parseDeploymentArguments', () => {
    it('parses clients, objects, and dry-run', () => {
        expect(parseDeploymentArguments([
            '--clients',
            '1,5,10',
            '--objects',
            'sp_GetProducts,fn_GetPrice',
            '--dry-run'
        ])).toEqual({
            clientIds: [1, 5, 10],
            objectNames: ['sp_GetProducts', 'fn_GetPrice'],
            dryRun: true
        });
    });

    it('requires clients', () => {
        expect(() => parseDeploymentArguments(['--objects', 'sp_GetProducts']))
            .toThrow('Missing required argument: --clients');
    });

    it('requires objects', () => {
        expect(() => parseDeploymentArguments(['--clients', '1']))
            .toThrow('Missing required argument: --objects');
    });

    it('rejects invalid and duplicate client IDs', () => {
        expect(() => parseDeploymentArguments([
            '--clients', '1,nope', '--objects', 'sp_GetProducts'
        ])).toThrow('--clients must contain positive integer client IDs');

        expect(() => parseDeploymentArguments([
            '--clients', '1,01', '--objects', 'sp_GetProducts'
        ])).toThrow('--clients contains duplicate client IDs');
    });

    it('rejects empty and duplicate object names', () => {
        expect(() => parseDeploymentArguments([
            '--clients', '1', '--objects', 'sp_GetProducts,'
        ])).toThrow('--objects must contain non-empty SQL object names');

        expect(() => parseDeploymentArguments([
            '--clients', '1', '--objects', 'sp_GetProducts,SP_GETPRODUCTS'
        ])).toThrow('--objects contains duplicate SQL object names');
    });
});
