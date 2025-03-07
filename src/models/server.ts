// server.ts
import express, { Application } from "express";
import cors from 'cors';
import Redis from 'ioredis';
import RedisStore from 'connect-redis';
import session, { Store } from 'express-session';
import { dbConnectionMain } from "../database/connection";

// Rutas
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
import errorsRouter from "../routes/errorsRouter";
import sellsRouter from "../routes/sellsRouter";
import meetingsRouter from "../routes/bitacoraRouter";
import calendarRouter from "../routes/calendarRouter";
import emailRouter from "../routes/emailRouter";
import reportsRouter from "../routes/reportsRouter";
import almacenesRouter from "../routes/almacenesRouter";

import { errorHandler } from "../middleware/errorHandler";

class Server {
    public app: Application;
    private port: string;
    public redis: Redis | null;

    private paths: {
        product: string,
        auth: string,
        search: string,
        tables: string,
        order: string,
        client: string,
        inventory: string,
        costos: string,
        typeofmovements: string,
        utils: string,
        errors: string,
        sells: string,
        meetings: string,
        calendar: string,
        email: string,
        reports: string
        almacenes: string
    };

    constructor() {
        this.app = express();
        this.port = process.env.PORT || "5001";
        this.redis = null;
        this.paths = {
            product: "/api/product",
            auth: "/api/auth",
            search: "/api/search",
            tables: "/api/tables",
            order: "/api/order",
            client: "/api/client",
            inventory: "/api/inventory",
            costos: "/api/costos",
            typeofmovements: "/api/typeofmovements",
            utils: "/api/utils",
            errors: "/api/errors",
            sells: "/api/sells",
            meetings: "/api/meetings",
            calendar: "/api/calendar",
            email: "/api/email",
            reports: "/api/reports",
            almacenes: "/api/almacenes"
        };

        this.connectDB();
        this.configureRedis();
        this.configureSessions();
        this.middlewares();
        this.routes();

        this.errorHandler();
    }

    private async connectDB() {
        await dbConnectionMain();
    }

    private configureRedis() {
        this.redis = new Redis({
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: Number(process.env.REDIS_PORT as string) || 6379,
            password: process.env.REDIS_PASSWORD
        });

        this.redis.on('connect', () => {
            console.log('Conectado a Redis');
        });

        this.redis.on('error', (err) => {
            console.error('Error de conexión a Redis:', err);
        });
    }

    private configureSessions() {
        if (this.redis) {
            const isProduction = process.env.ENVIRONMENT === 'production';

            // Define el TTL y maxAge para móvil y web
            const webMaxAgeInSeconds = 12 * 60 * 60; // 8 horas para la web
            const mobileMaxAgeInSeconds = 365 * 24 * 60 * 60; // 1 año en móvil

            // Define el store de Redis, una sola vez
            const store = new RedisStore({
                client: this.redis,
                ttl: webMaxAgeInSeconds // Default ttl
            }) as Store;

            // Configurar express-session una vez para toda la aplicación
            this.app.use(session({
                secret: process.env.REDIS_SECRET as string,
                name: 'sid',
                store: store,
                resave: false,
                saveUninitialized: false,
                cookie: {
                    secure: isProduction ? 'auto' : false, // true en producción, false en local
                    httpOnly: true,
                    sameSite: isProduction ? 'none' : 'lax', // 'none' para producción, 'lax' para local
                    maxAge: webMaxAgeInSeconds * 1000 // Default maxAge
                }
            }));

            // Middleware personalizado para ajustar el maxAge según el User-Agent
            this.app.use((req, res, next) => {
                const userAgent = req.headers['user-agent'];

                if (userAgent && (userAgent.includes('Mobile') || userAgent.includes('OleiApp'))) {
                    // Si es una app móvil, ajustamos maxAge
                    req.session.cookie.maxAge = mobileMaxAgeInSeconds * 1000;
                }

                next();
            });
        } else {
            console.error('Redis no está configurado, las sesiones no se almacenarán en Redis');
        }
    }

    private middlewares() {
        const allowedOrigins = [
            'https://www.oleionline.com',
            'http://localhost:3000',
            'http://localhost:3001',
            "https://olei-crm.vercel.app",

            //Demos
            "https://oleiweb-git-demo2-morisluis-projects.vercel.app"
        ];

        const corsOptions = {
            origin: (origin: any, callback: any) => {
                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true
        };

        this.app.use(cors(corsOptions));

        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    }

    private routes() {
        this.app.use(this.paths.product, productRouter);
        this.app.use(this.paths.auth, authRouter);
        this.app.use(this.paths.search, searchRouter);
        this.app.use(this.paths.tables, tablesRouter);
        this.app.use(this.paths.order, orderRouter);
        this.app.use(this.paths.client, clientRouter);
        this.app.use(this.paths.inventory, inventoryRouter);
        this.app.use(this.paths.costos, costosRouter);
        this.app.use(this.paths.typeofmovements, typeofmovementsRouter);
        this.app.use(this.paths.errors, errorsRouter);
        this.app.use(this.paths.utils, utilsRouter);
        this.app.use(this.paths.sells, sellsRouter);
        this.app.use(this.paths.meetings, meetingsRouter);
        this.app.use(this.paths.calendar, calendarRouter);
        this.app.use(this.paths.email, emailRouter);
        this.app.use(this.paths.reports, reportsRouter);
        this.app.use(this.paths.almacenes, almacenesRouter);
    }

    public async closeConnections() {
        if (this.redis) {
            await this.redis.quit();
            console.log('Conexión a Redis cerrada');
        }
        await dbConnectionMain().then(pool => pool.close()).catch(() => { });
        console.log('Conexión a la base de datos cerrada');
    }

    errorHandler() {
        this.app.use(errorHandler);
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log("Servidor corriendo en puerto " + this.port);
        });
    }

}

export default Server;

// Exportar la instancia de Redis
const server = new Server();
export const redisClient = server.redis;

// Listener para cerrar conexiones con SIGINT
process.on('SIGINT', async () => {
    console.log('Cerrando conexiones...');
    await server.closeConnections();
    process.exit(0);
});

// Listeners globales para errores inesperados
process.on('uncaughtException', (err) => {
    console.error('🔥 Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Promise Rejection:', reason);
    process.exit(1);
});