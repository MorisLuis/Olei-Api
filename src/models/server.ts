import express, { Application } from "express";
import cors from 'cors';
import { dbConnection } from "../database/connection";

import productRouter from "../routes/productRouter";


class Server {
    private app: Application;
    private port: string;
    private paths: {
        product : string
    }

    constructor() {
        this.app = express();
        this.port = process.env.PORT || "5001"
        this.paths = {
            product : "/api/product"
        }

        //Connect to database
        this.connectDB();

        // Middlewares
        this.middlewares();

        // Routes of the app
        this.routes();
    }

    async connectDB() {
        await dbConnection()
    } 

    middlewares(){
        // CORS
        this.app.use(cors());

        // Lectura y parseo del body
        this.app.use(express.json({ limit: '50mb' }))
        this.app.use(express.urlencoded({ extended: true, limit: '50mb' }))
    }

    routes() {
        this.app.use(this.paths.product, productRouter)
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log("Servidor corriendo en puerto " + this.port)
        })
    }
}

export default Server