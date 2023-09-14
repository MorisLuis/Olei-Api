import Server from "./models/server";
import dotenv from "dotenv";
import './database/connection'
import UserInterface from "./interface/user";

dotenv.config()

interface ConnectionInterface {
    user: string,
    password: string,
    server?: string | null,
    database?: string | null
}

// Create a shared data object to store user information for the session.
// The objective is to track Id_ListaPrecion & Id_Almacen throughout the entire backend.
export const sharedData = {
    currentUser: null as { user: UserInterface } | null,
    userConnection: null as { connection: ConnectionInterface } | null
};

const server = new Server()

server.listen()