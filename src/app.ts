import Server from "./models/server";
import dotenv from "dotenv";
import './database/connection'

dotenv.config()

// Create a shared data object to store user information for the session.
// The objective is to track Id_ListaPrecion & Id_Almacen throughout the entire backend.
export const sharedData = {
    currentUser: null as { user: any } | null,
};

const server = new Server()

server.listen()