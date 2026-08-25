import type { SqlObjectDefinition, TenantDatabase, DeploymentResult } from "./types";

export const printDryRun = (
    tenants: TenantDatabase[],
    sqlObjects: SqlObjectDefinition[]
): void => {
    console.log('DRY RUN\n');
    console.log(`Selected tenants: ${tenants.length}\n`);

    for (const tenant of tenants) {
        console.log(`Client ${tenant.clientId}`);
        console.log(`  ${tenant.server} / ${tenant.database}\n`);
    }

    console.log(`Selected SQL objects: ${sqlObjects.length}\n`);

    for (const object of sqlObjects) {
        console.log(object.name);
    }

    console.log('\nNo tenant databases were modified.');
};

export const printDeploymentStart = (
    tenants: TenantDatabase[],
    sqlObjects: SqlObjectDefinition[]
): void => {
    console.log('Starting deployment\n');
    console.log(`Tenants: ${tenants.length}`);
    console.log(`SQL objects: ${sqlObjects.length}\n`);
};

export const printTenantStart = (tenant: TenantDatabase): void => {
    console.log(`Deploying to Client ${tenant.clientId} (${tenant.database})\n`);
};

export const printDeploymentResult = (result: DeploymentResult): void => {
    const outcome = result.status === 'success' ? '✅' : '❌';
    console.log(`-> ${result.object.name}  ${outcome}`);
};

export const printResults = (results: DeploymentResult[]): void => {
    console.log('Deployment completed\n');

    const successful = results.filter(result => result.status === 'success').length;
    const failures = results.filter(result => result.status === 'failed');

    console.log(`Successful: ${successful}`);
    console.log(`Failed: ${failures.length}`);
    console.log(`Total: ${results.length}`);

    if (failures.length === 0) {
        return;
    }

    console.log('\nFailures:\n');
    const tenantIds = [...new Set(failures.map(result => result.tenant.clientId))];

    for (const tenantId of tenantIds) {
        const tenantFailures = failures.filter(result => result.tenant.clientId === tenantId);
        const tenant = tenantFailures[0].tenant;
        console.log(`Client ${tenant.clientId} / ${tenant.database}`);

        for (const failure of tenantFailures) {
            console.log(`  ${failure.object.name}`);
            console.log(`  ${failure.error ?? 'Unknown deployment error'}`);
        }

        console.log('');
    }
};
