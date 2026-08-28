export interface TenantDatabase {
    clientId: number;
    server: string;
    database: string;
}

export interface TenantDatabaseRow {
    Id_Cliente: number;
    ServidorSQL: string | null;
    BaseSQL: string | null;
}


export type SqlObjectType = 'procedure' | 'function';

export interface SqlObjectDefinition {
    name: string;
    type: SqlObjectType;
    filePath: string;
    sql: string;
}


export type DeploymentStatus = 'success' | 'failed';

export interface DeploymentResult {
    tenant: TenantDatabase;
    object: SqlObjectDefinition;
    status: DeploymentStatus;
    error?: string;
}

export interface DeploymentProgressCallbacks {
    // eslint-disable-next-line no-unused-vars
    onTenantStart?: (tenant: TenantDatabase) => void;
    // eslint-disable-next-line no-unused-vars
    onResult?: (result: DeploymentResult) => void;
}
