// Define an interface for the database connection configuration.
export interface ConnectionInterface {
    user: string;         // The user for the Azure database connection.
    password: string;     // The password for the database connection.
    server: string;    // The server for the database connection.
    database: string;  // The database for the database connection.
}