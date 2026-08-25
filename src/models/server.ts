// server.ts

import type { Application } from "express";
import express from "express";
import type { Server as HttpServer } from 'node:http';
import type { CorsOptions } from 'cors';
import cors from 'cors';
import { closeAllDatabaseConnections, dbConnectionMain } from "../database/connection";
import { abortRedisConnection, connectRedis } from '../config/redisClient';

// Routers
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
import meetingsRouter from "../routes/meetingRouter";
import calendarRouter from "../routes/calendarRouter";
import emailRouter from "../routes/emailRouter";
import reportsRouter from "../routes/reportsRouter";
import almacenesRouter from "../routes/almacenesRouter";
import statisticsRouter from "../routes/statisticsRouter";
import abonosRouter from "../routes/abonosRouter";
import aiRouter from "../routes/aiRouter";
import informesiaRouter from "../routes/informesiaRouter";
import typeOfDocuments from "../routes/typeOfDocuments"
import vendedoresRouter from "../routes/vendedoresRouter";
import healthRouter from '../routes/healthRouter';

import { errorHandler } from "../middleware/errorHandler";
import cookieParser from 'cookie-parser';
import type { ServerDependencies } from "./types";
import { markNotReady, markReady } from '../services/health/health.service';

export const listen = async (app: Application, port: number): Promise<HttpServer> => new Promise((resolve, reject) => {
    const httpServer = app.listen(port);

    const removeStartupListeners = (): void => {
        httpServer.off('error', onError);
        httpServer.off('listening', onListening);
    };
    const onError = (error: Error): void => {
        removeStartupListeners();
        reject(error);
    };
    const onListening = (): void => {
        removeStartupListeners();
        resolve(httpServer);
    };

    httpServer.once('error', onError);
    httpServer.once('listening', onListening);
});

const defaultDependencies: ServerDependencies = {
    connectDatabase: dbConnectionMain,
    connectRedis,
    closeDatabase: closeAllDatabaseConnections,
    abortRedis: abortRedisConnection,
    listen,
};

class Server {
    public app: Application;
    private readonly port: number;
    private readonly dependencies: ServerDependencies;
    private httpServer: HttpServer | null = null;

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
        almacenes: string,
        statistics: string,
        abonos: string,
        aiRouter: string,
        informesia: string,
        typeOfDocuments: string,
        vendedores: string
    };

    constructor(port: number, dependencies: ServerDependencies = defaultDependencies) {
        this.app = express();
        this.port = port;
        this.dependencies = dependencies;
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
            almacenes: "/api/almacenes",
            statistics: "/api/statistics",
            abonos: "/api/abonos",
            aiRouter: "/api/ai",
            informesia: "/api/informesia",
            typeOfDocuments: "/api/documents/types",
            vendedores: "/api/vendedores"
        };

        this.middlewares();
        this.routes();

        this.errorHandler();
    }

    private middlewares(): void {
        const allowedOrigins: string[] = [
            'https://www.oleicrm.com',
            'https://www.oleionline.com',
            'http://localhost:3000',
            'http://localhost:3001',
            'https://olei-crm.vercel.app',
            // Demos
            'https://oleiweb-git-demo2-morisluis-projects.vercel.app'
        ];

        const corsOptions: CorsOptions = {
            origin: (origin: string | undefined, callback) => {
                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true,
        };

        this.app.use(cors(corsOptions));
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

        this.app.use(cookieParser());
    }

    private routes() {
        this.app.use('/health', healthRouter);
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
        this.app.use(this.paths.statistics, statisticsRouter);
        this.app.use(this.paths.abonos, abonosRouter);
        this.app.use(this.paths.aiRouter, aiRouter);
        this.app.use(this.paths.informesia, informesiaRouter);
        this.app.use(this.paths.typeOfDocuments, typeOfDocuments)
        this.app.use(this.paths.vendedores, vendedoresRouter);

    }

    public async closeConnections(): Promise<void> {
        await closeAllDatabaseConnections();
        console.log('Conexión a la base de datos cerrada');
    }

    public async start(): Promise<void> {
        markNotReady();
        try {
            await this.dependencies.connectDatabase();
            await this.dependencies.connectRedis();
            this.httpServer = await this.dependencies.listen(this.app, this.port);
            markReady();
            console.log("✅ Servidor corriendo en puerto " + this.port);
        } catch (error) {
            markNotReady();
            try {
                this.dependencies.abortRedis();
            } catch {
                // Preserve the startup failure; shutdown logging is handled at the process boundary.
            }
            await this.dependencies.closeDatabase().catch(() => undefined);
            throw error;
        }
    }

    errorHandler(): void {
        this.app.use(errorHandler);
    }

}

export default Server;
