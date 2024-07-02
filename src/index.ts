import Server from "./models/server";
import './database/connection'
import dotenv from "dotenv";

dotenv.config()

const server = new Server();
server.listen();

export default server;