export interface DeploymentCliOptions {
    clientIds: number[];
    objectNames: string[];
    dryRun: boolean;
}

const MAX_SQL_INT = 2_147_483_647;

const readArgumentValue = (args: string[], index: number, argument: string): string => {
    const value = args[index + 1];

    if (!value || value.startsWith('--')) {
        throw new Error(`${argument} requires a comma-separated value`);
    }

    return value;
};

const parseClientIds = (value: string): number[] => {
    const values = value.split(',').map(clientId => clientId.trim());

    if (values.length === 0 || values.some(clientId => !/^\d+$/.test(clientId))) {
        throw new Error('--clients must contain positive integer client IDs');
    }

    const clientIds = values.map(Number);

    if (clientIds.some(clientId => (
        !Number.isSafeInteger(clientId) || clientId <= 0 || clientId > MAX_SQL_INT
    ))) {
        throw new Error('--clients must contain positive SQL Server integer client IDs');
    }

    if (new Set(clientIds).size !== clientIds.length) {
        throw new Error('--clients contains duplicate client IDs');
    }

    return clientIds;
};

const parseObjectNames = (value: string): string[] => {
    const objectNames = value.split(',').map(name => name.trim());

    if (objectNames.length === 0 || objectNames.some(name => name.length === 0)) {
        throw new Error('--objects must contain non-empty SQL object names');
    }

    const normalizedNames = objectNames.map(name => name.toLowerCase());

    if (new Set(normalizedNames).size !== normalizedNames.length) {
        throw new Error('--objects contains duplicate SQL object names');
    }

    return objectNames;
};


/**
 * @description Parses command-line arguments for the deployment CLI.
 * @example
 * const args = ['--clients', '1,2,3', '--objects', 'object1,object2', '--dry-run'];
 * const options = parseDeploymentArguments(args);
 * console.log(options);
 * // Output: { clientIds: [1, 2, 3], objectNames: ['object1', 'object2'], dryRun: true }
 * @param args - The command-line arguments to parse.
 * @returns An object containing the parsed deployment options.
 * @throws Will throw an error if required arguments are missing or invalid.
 */

export const parseDeploymentArguments = (args: string[]): DeploymentCliOptions => {
    let clientsValue: string | undefined;
    let objectsValue: string | undefined;
    let dryRun = false;

    for (let index = 0; index < args.length; index += 1) {
        const argument = args[index];

        if (argument === '--clients') {
            if (clientsValue !== undefined) {
                throw new Error('--clients may only be provided once');
            }

            clientsValue = readArgumentValue(args, index, '--clients');
            index += 1;
        } else if (argument === '--objects') {
            if (objectsValue !== undefined) {
                throw new Error('--objects may only be provided once');
            }

            objectsValue = readArgumentValue(args, index, '--objects');
            index += 1;
        } else if (argument === '--dry-run') {
            dryRun = true;
        } else {
            throw new Error(`Unknown argument: ${argument}`);
        }
    }

    if (clientsValue === undefined) {
        throw new Error('Missing required argument: --clients');
    }

    if (objectsValue === undefined) {
        throw new Error('Missing required argument: --objects');
    }

    return {
        clientIds: parseClientIds(clientsValue),
        objectNames: parseObjectNames(objectsValue),
        dryRun
    };
};
