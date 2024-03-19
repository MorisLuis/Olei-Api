import Server from "./models/server";
import './database/connection'
import dotenv from "dotenv";

import UserInterface from "./interface/user";
import { currentClientTest, currentUserTest, userConnectionTest } from "./database/sharedDataTest";
import { ClientInterface } from "./interface/client";
import { ConnectionInterface } from "./interface/connection";



dotenv.config()

// Create a shared data object to store user information for the session.
// The objective is to track 'Id_ListaPrecio' & 'Id_Almacen' throughout the entire backend.
export const sharedData = {
    // 'currentUser' stores the current user using the 'UserInterface'.
    currentUser: process.env.TEST === 'TRUE'
        ? currentUserTest
        : null as { user: UserInterface } | null,

    // 'currentClient' stores the current client using the 'UserInterface'.
    currentClient: process.env.TEST === 'TRUE'
        ? currentClientTest
        : null as { client: ClientInterface } | null,

    // 'userConnection' stores the connection information using 'ConnectionInterface'.
    userConnection: process.env.TEST === 'TRUE'
        ? userConnectionTest
        : null as { connection: ConnectionInterface } | null,
};

const server = new Server();
server.listen();

export default server;