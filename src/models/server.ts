// server.ts
import express, { Application } from "express";
import cors from 'cors';
import Redis from 'ioredis';
import RedisStore from 'connect-redis';
import session, { Store } from 'express-session';
import { dbConnection } from "../database/connection";

// Rutas
import userRouter from "../routes/userRouter";
import productRouter from "../routes/productRouter";
import authRouter from "../routes/authRouter";
import searchRouter from "../routes/searchRouter";
import tablesRouter from "../routes/tablesRouter";
import orderRouter from "../routes/orderRouter";
import clientRouter from "../routes/clientRouter";
import inventoryRouter from "../routes/inventoryRouter";
import costosRouter from "../routes/costosRouter";
import typeofmovementsRouter from "../routes/typeofmovementsRouter";
import utilsRouter from "../routes/utilsRouter";

class Server {
    public app: Application;
    private port: string;
    public redis: Redis | null;

    private paths: {
        product: string,
        user: string,
        auth: string,
        search: string,
        tables: string,
        order: string,
        client: string,
        inventory: string,
        costos: string,
        typeofmovements: string,
        utils: string,
    };

    constructor() {
        this.app = express();
        this.port = process.env.PORT || "5001";
        this.redis = null;
        this.paths = {
            product: "/api/product",
            user: "/api/user",
            auth: "/api/auth",
            search: "/api/search",
            tables: "/api/tables",
            order: "/api/order",
            client: "/api/client",
            inventory: "/api/inventory",
            costos: "/api/costos",
            typeofmovements: "/api/typeofmovements",
            utils: "/api/utils"
        };

        this.connectDB();
        this.configureRedis();
        this.configureSessions();
        this.middlewares();
        this.routes();
        this.errorHandler();
    }

    async connectDB() {
        await dbConnection();
    }

    configureRedis() {
        this.redis = new Redis({
            /* host: process.env.ENVIRONMENT === 'production' ? process.env.REDIS_HOST : '127.0.0.1',
            port: process.env.ENVIRONMENT === 'production' ? Number(process.env.REDIS_PORT as string) : 6379, */
            /* host: '127.0.0.1',
            port: 6379, */
            host: 'redis-15399.c82.us-east-1-2.ec2.redns.redis-cloud.com',
            
            port: 15399,
            password: 'y48lv9CO4k0wVaUnW6W5MIbas9e0pjuq'
        });

        this.redis.on('connect', () => {
            console.log('Conectado a Redis');
        });

        this.redis.on('error', (err) => {
            console.error('Error de conexión a Redis:', err);
        });
    }

    configureSessions() {
        if (this.redis) {
            // Define el TTL y maxAge en segundos y milisegundos
            const oneYearInSeconds = 31536000; // 1 año en segundos
            const oneYearInMilliseconds = oneYearInSeconds * 1000; // 1 año en milisegundos
    
            const store = new RedisStore({
                client: this.redis,
                ttl: oneYearInSeconds,
            }) as Store;
    
            this.app.use(session({
                secret: 's3Cr3tperra1112132*',
                name: 'sid',
                store: store,
                resave: false,
                saveUninitialized: true,
                cookie: {
                    secure:  true, /* 'auto' */
                    httpOnly: true,
                    //maxAge: oneYearInMilliseconds,
                    sameSite: 'lax'
                }
            }));
        } else {
            console.error('Redis no está configurado, las sesiones no se almacenarán en Redis');
        }
    }
    

    middlewares() {
        this.app.use(cors({
            //origin:  process.env.ENVIRONMENT === 'production' ? 'https://www.oleionline.com' : 'http://localhost:3000', // Ajusta según sea necesario
            origin: 'https://www.oleionline.com',
            credentials: true // Esto es importante para las cookies de sesión
        }));
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

        // Middleware para registrar el sessionId
        this.app.use((req, res, next) => {
            console.log('Session ID:', req.sessionID);
            next();
        });
    }

    routes() {
        this.app.use(this.paths.product, productRouter);
        this.app.use(this.paths.user, userRouter);
        this.app.use(this.paths.auth, authRouter);
        this.app.use(this.paths.search, searchRouter);
        this.app.use(this.paths.tables, tablesRouter);
        this.app.use(this.paths.order, orderRouter);
        this.app.use(this.paths.client, clientRouter);
        this.app.use(this.paths.inventory, inventoryRouter);
        this.app.use(this.paths.costos, costosRouter);
        this.app.use(this.paths.typeofmovements, typeofmovementsRouter);
        this.app.use(this.paths.utils, utilsRouter);

    }

    errorHandler() {
        this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            res.status(500).json({ error: 'Ocurrió un error en el servidor', err });
        });
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log("Servidor corriendo en puerto " + this.port);
        });
    }
}

export default Server;

// Exportar la instancia de Redis
const server = new Server();
export const redisClient = server.redis;