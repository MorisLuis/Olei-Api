// __mocks__/mssql.ts

export class ConnectionPool {
    connected = false;

    constructor(_config: unknown) {
        void _config;
    }

    async connect(): Promise<this> {
        await Promise.resolve();
        this.connected = true;
        return this;
    }


    async close(): Promise<this> {
        await Promise.resolve();
        this.connected = false;
        return this;
    }
}

export default {
    ConnectionPool,
};
