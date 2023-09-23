import Server from "./models/server";
import dotenv from "dotenv";
import './database/connection'
import UserInterface from "./interface/user";

dotenv.config()

// Define an interface for the database connection configuration.
interface ConnectionInterface {
    user: string;         // The user for the Azure database connection.
    password: string;     // The password for the database connection.
    server: string;    // The server for the database connection.
    database: string;  // The database for the database connection.
}

interface ClientInterface {
    Id_Almacen: number,
    Id_ListPre?: number | null
    Id_Cliente: number,
}

// Create a shared data object to store user information for the session.
// The objective is to track 'Id_ListaPrecion' & 'Id_Almacen' throughout the entire backend.
export const sharedData = {
    // 'currentUser' stores the current user using the 'UserInterface'.
    currentUser: null as { user: UserInterface } | null,

    // 'currentClient' stores the current client using the 'UserInterface'.
    currentClient: null as { client: ClientInterface } | null,

    // 'userConnection' stores the connection information using 'ConnectionInterface'.
    userConnection: null as { connection: ConnectionInterface } | null
};

const server = new Server()

server.listen()