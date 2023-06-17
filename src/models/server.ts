import express, { Application } from "express";
import cors from 'cors';
import { dbConnection } from "../database/connection";

import userRouter from "../routes/userRouter";
import productRouter from "../routes/productRouter";
import authRouter from "../routes/authRouter";


class Server {
    private app: Application;
    private port: string;
    private paths: {
        product : string,
        user : string,
        auth : string
    }

    constructor() {
        this.app = express();
        this.port = process.env.PORT || "5001"
        this.paths = {
            product : "/api/product",
            user: "/api/user",
            auth : "/api/auth"
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
        this.app.use(this.paths.product, productRouter);
        this.app.use(this.paths.user, userRouter)
        this.app.use(this.paths.auth, authRouter)

    }

    listen() {
        this.app.listen(this.port, () => {
            console.log("Servidor corriendo en puerto " + this.port)
        })
    }
}

export default Server