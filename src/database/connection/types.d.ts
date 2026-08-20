import type sql from 'mssql';

export type AuthenticationContext = 'app' | 'web';

export interface DatabaseLocation {
    server: string;
    database: string;
}

export interface TenantPoolCredentials {
    authenticationContext: AuthenticationContext;
    user: string;
    password: string;
}

export interface TenantPoolEntry extends TenantPoolCredentials {
    pool?: sql.ConnectionPool;
    connecting?: Promise<sql.ConnectionPool>;
}
