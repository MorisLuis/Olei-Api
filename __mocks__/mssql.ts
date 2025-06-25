// __mocks__/mssql.ts

export class ConnectionPool {
    connected = false;

    constructor(config: any) {
        // Simula conectar instantáneamente
    }

    async connect() {
        this.connected = true;
        return this;
    }

    async close() {
        this.connected = false;
        return;
    }
}

export default {
    ConnectionPool,
};
