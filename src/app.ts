import Server from "./models/server";
import dotenv from "dotenv";
import './database/connection'

dotenv.config()

const server = new Server()

server.listen()