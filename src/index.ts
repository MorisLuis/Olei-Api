/// <reference path="./types/express-session.d.ts" />

import Server from "./models/server";
import dotenv from "dotenv";
import "./types/express";  // Asegúrate de que la ruta sea correcta.

dotenv.config()

const server = new Server();
server.listen();

export default server;