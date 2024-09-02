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
import orderDetailsRouter from "../routes/orderDetailsRouter";
import clientRouter from "../routes/clientRouter";
import inventoryRouter from "../routes/inventoryRouter";
import costosRouter from "../routes/costosRouter";
import statisticsRouter from "../routes/statisticsRouter";
import typeofmovementsRouter from "../routes/typeofmovementsRouter";

class Server {
    public app: Application;
    private port: string;
    public redis: Redis | null;  // Cambiado a public para exportar

    private paths: {
        product: string,
        user: string,
        auth: string,
        search: string,
        tables: string,
        order: string,
        orderDetails: string,
        client: string,
        inventory: string,
        costos: string,
        statistics: string,
        typeofmovements: string
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
            orderDetails: "/api/orderDetails",
            client: "/api/client",
            inventory: "/api/inventory",
            costos: "/api/costos",
            statistics: "/api/statistics",
            typeofmovements: "/api/typeofmovements"
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
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: parseFloat(process.env.REDIS_PORT as string) || 6379,
            password: process.env.REDIS_PASSWORD
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
            const store = new RedisStore({
                client: this.redis,
                ttl: parseFloat(process.env.REDIS_SESSION_EXPIRATION as string),
            }) as unknown as Store;

            this.app.use(session({
                secret: process.env.REDIS_SECRET as string,
                name: 'sid',
                store: store,
                resave: false,
                saveUninitialized: false,
                cookie: {
                    secure: process.env.ENVIRONMENT === "production" ? true : 'auto',
                    httpOnly: true,
                    maxAge: parseFloat(process.env.REDIS_SESSION_EXPIRATION as string),
                    sameSite: process.env.ENVIRONMENT === "production" ? "none" : 'lax'
                }
            }));
        } else {
            console.error('Redis no está configurado, las sesiones no se almacenarán en Redis');
        }
    }

    middlewares() {
        this.app.use(cors());
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    }

    routes() {
        this.app.use(this.paths.product, productRouter);
        this.app.use(this.paths.user, userRouter);
        this.app.use(this.paths.auth, authRouter);
        this.app.use(this.paths.search, searchRouter);
        this.app.use(this.paths.tables, tablesRouter);
        this.app.use(this.paths.order, orderRouter);
        this.app.use(this.paths.orderDetails, orderDetailsRouter);
        this.app.use(this.paths.client, clientRouter);
        this.app.use(this.paths.inventory, inventoryRouter);
        this.app.use(this.paths.costos, costosRouter);
        this.app.use(this.paths.statistics, statisticsRouter);
        this.app.use(this.paths.typeofmovements, typeofmovementsRouter);
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
